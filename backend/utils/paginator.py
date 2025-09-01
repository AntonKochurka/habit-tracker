from typing import Any, List, Optional, Tuple, Dict
from math import ceil

from fastapi import HTTPException, status
from pydantic import BaseModel

from sqlalchemy.inspection import inspect
from sqlalchemy import select, desc, asc, func
from sqlalchemy.sql import Select

from sqlalchemy import Integer, Float, Boolean, DateTime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import InstrumentedAttribute

from datetime import datetime, timezone, timedelta
from config import settings

_SUFFIXES = {
    "gt": "gt",
    "ge": "ge",
    "lt": "lt",
    "le": "le",
    "contains": "contains",
    "startswith": "startswith",
    "endswith": "endswith",
    "in": "in",
    # exact is default (no suffix)
}

def _is_date_only(s: str) -> bool:
    return isinstance(s, str) and len(s) == 10 and s[4] == "-" and s[7] == "-"

def _parse_iso_to_utc(value: str | datetime) -> datetime:
    if isinstance(value, datetime):
        return value.astimezone(timezone.utc) if value.tzinfo else value.replace(tzinfo=timezone.utc)
    if isinstance(value, str):
        s = value.strip()
        if s.endswith("Z"):
            s = s[:-1] + "+00:00"
        dt = datetime.fromisoformat(s)
        return dt.astimezone(timezone.utc) if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
    raise ValueError(f"Unsupported datetime value: {value!r}")

def _day_range_utc(date_str: str) -> tuple[datetime, datetime]:
    start = datetime.fromisoformat(date_str).replace(tzinfo=timezone.utc)
    end = start + timedelta(days=1)
    return start, end

def _get_col_type(col: InstrumentedAttribute):
    try:
        return col.property.columns[0].type
    except Exception:
        try:
            return getattr(col, "type", None)
        except Exception:
            return None

def _is_datetime_col(col: InstrumentedAttribute) -> bool:
    ct = _get_col_type(col)
    if ct is None:
        return False
    try:
        return isinstance(ct, DateTime) or "timestamp" in ct.__class__.__name__.lower()
    except Exception:
        try:
            return "timestamp" in str(ct).lower() or "timestamptz" in str(ct).lower()
        except Exception:
            return False

class Paginator:
    def __init__(
        self,
        model,
        *, 
        forbiden_list: list = None, 
        item_model: BaseModel = None,
        session: Optional[AsyncSession] = None
    ):
        """
        model: SQLAlchemy ORM mapped class (e.g., User)
        forbiden_list: list of fields which cannot be filtrated (for preprevent filtrating by sensetive data)
        item_model: Pydantic ORM Model which will wrap pagination items.
        session: AsyncSession instance (can be passed later to apply/paginate)
        """
        self.model = model
        self.forbiden_list = getattr(model, "__forbidden_list__")

        if self.forbiden_list is None:
            self.forbiden_list = []

        self.ItemModel = item_model
        self._session = session
        self._where = []
        self._order_by: List[Any] = []
        self._base_query: Optional[Select] = None

    def filtrate_by_dict(self, filters: Dict):
        """filtrating by {'field':'value'} dict"""

        model_columns = {c.key: c for c in inspect(self.model).columns}
        types = (
            (Integer, int,),
            (Float, float,),
            (Boolean, bool,),
        ) 

        for field, value in filters.items():
            if field.endswith("__in"):
                value = [v.strip() for v in str(value).strip().split(",") if v.strip()]

            field_name, op = self._parse_field(field)
            
            if field_name not in model_columns:
                continue
                
            col_type = model_columns[field_name].type
            
            try: 
                if isinstance(col_type, DateTime):
                    if isinstance(value, list):
                        value = [_parse_iso_to_utc(v) for v in value]
                    else:
                        if isinstance(value, str) and _is_date_only(value):
                            value = value
                        else:
                            value = _parse_iso_to_utc(value)
                else:
                    for sqltype, _type in types:
                        if isinstance(col_type, sqltype):
                            if isinstance(value, list):
                                value = [_type(v) for v in value]
                            else:
                                value = _type(value)
                            break

                self.filtrate(field, value)
            except Exception as e:
                raise HTTPException(
                    detail=f"Cannot convert value '{value}' for field {field}: {e}",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
        
        return self

    def filtrate(self, field: str, value: Any):
        """
        field: "age__lgq" or "username__startswith" or just "email"
        value: value or iterable for 'in'
        """
        field_name, op = self._parse_field(field)

        if field_name in self.forbiden_list:
            raise HTTPException(
                detail=f"Field '{field_name}' cannot be filtrated", 
                status_code=status.HTTP_403_FORBIDDEN
            )

        col = getattr(self.model, field_name, None)
        if col is None or not isinstance(col, InstrumentedAttribute):
            raise HTTPException(
                detail=f"Unknown field '{field_name}'", 
                status_code=status.HTTP_400_BAD_REQUEST
            )        
        expr = self._build_expr(col, op, value)
        self._where.append(expr)

        return self

    def order_by(self, field: str, descending: bool = False):
        col = getattr(self.model, field, None)

        if col is None or not isinstance(col, InstrumentedAttribute):
            raise ValueError(f"Unknown field '{field}' for model {self.model.__name__}")

        self._order_by.append(desc(col) if descending else asc(col))
        return self

    def _make_query(self) -> Select:
        if self._base_query is None:
            q = select(self.model)
        else:
            q = self._base_query

        for clause in self._where:
            q = q.filter(clause)

        if self._order_by:
            q = q.order_by(*self._order_by)

        return q

    async def paginate(
        self,
        page: int = 1,
        per_page: None | int = None,
        session: Optional[AsyncSession] = None,
        ItemModel: Optional[BaseModel] = None, 
        is_dictable: bool = False,
    ) -> Dict[str, Any]:
        """
        Executes query with LIMIT/OFFSET and returns:
        { items: [...], total: int, page: int, per_page: int, pages: int }
        """
        if per_page is None:
            per_page = settings.PER_PAGE

        ItemModel = ItemModel or self.ItemModel
        sess = session or self._session
        if sess is None:
            raise RuntimeError("No AsyncSession provided to Paginator (pass to constructor or to paginate()).")
        if page < 1:
            page = 1
        if per_page < 1:
            per_page = 1

        base_q = self._make_query()
        
        count_stmt = select(func.count()).select_from(base_q.subquery())
        total = (await sess.execute(count_stmt)).scalar_one()

        pages = max(1, ceil(total / per_page))
        offset = (page - 1) * per_page

        q = base_q.limit(per_page).offset(offset)
        result = await sess.execute(q)
        items = result.scalars().all()

        if ItemModel is not None:
            items = [ItemModel(**item.to_dict()) for item in items]
        else:
            if is_dictable:
                items = [item.to_dict() for item in items]

        return {
            "items": items,
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": pages,
        }

    async def first(
        self, 
        session: Optional[AsyncSession] = None,
        *,
        ItemModel: Optional[BaseModel] = None,
        is_dictable: bool = False
    ):
        """Returns just one single record with filters"""
        sess = session or self._session
        ItemModel = ItemModel or self.ItemModel

        if sess is None:
            raise RuntimeError(...)
        
        q = self._make_query().limit(1)
        result = await sess.execute(q)
        item = result.scalars().first()
        
        if item is None:
            return None

        if ItemModel is not None:
            item = self.ItemModel(**item.to_dict())                    
        else:
            if  is_dictable:
                item = item.to_dict()

        return item

    def _parse_field(self, field: str) -> Tuple[str, str]:
        """
        Return (field_name, op). op is one of keys in _SUFFIXES or 'exact'.
        Accepts only '__' separator before suffix.
        Examples:
          "age__lgq" -> ("age", "lgq")
          "username__startswith" -> ("username", "startswith")
          "email" -> ("email", "exact")
        """
        if "__" in field:
            name, suff = field.split("__", 1)
            return name, suff

        return field, "exact"

    def _build_expr(self, col: InstrumentedAttribute, op: str, value: Any):
        if _is_datetime_col(col):
            if op == "exact" and isinstance(value, str) and _is_date_only(value):
                start, end = _day_range_utc(value)
                return (col >= start) & (col < end)
            if isinstance(value, str):
                value = _parse_iso_to_utc(value)
            elif isinstance(value, list):
                value = [_parse_iso_to_utc(v) for v in value]

        if op == "exact":
            return col == value
        if op == "gt":
            return col > value
        if op == "ge":
            return col >= value
        if op == "lt":
            return col < value
        if op == "le":
            return col <= value
        if op == "contains":
            return col.contains(value)
        if op == "startswith":
            return col.startswith(value)
        if op == "endswith":
            return col.endswith(value)
        if op == "in":
            if isinstance(value, str):
                value = [v.strip() for v in value.split(",") if v.strip()]
            if not isinstance(value, (list, tuple, set)):
                raise ValueError(
                    "Value for 'in' must be an iterable or comma-separated string"
                )
            return col.in_(value)
        return col == value
