from typing import Any, List, Optional, Tuple, Dict
from math import ceil

from fastapi import HTTPException, status
from pydantic import BaseModel

from sqlalchemy import select, desc, asc, func
from sqlalchemy.sql import Select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import InstrumentedAttribute

from config import settings

_SUFFIXES = {
    "lg": "gt",
    "lgq": "ge",
    "sl": "lt",
    "slq": "le",
    "contains": "contains",
    "startswith": "startswith",
    "endswith": "endswith",
    "in": "in",
    # exact is default (no suffix)
}

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

        for field, value in filters.keys():
            self.filtrate(field, value)

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
        session: Optional[AsyncSession] = None
    ) -> Dict[str, Any]:
        """
        Executes query with LIMIT/OFFSET and returns:
        { items: [...], total: int, page: int, per_page: int, pages: int }
        """
        if per_page is None:
            per_page = settings.PER_PAGE
         
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

        if self.ItemModel is not None:
            items = [self.ItemModel(item) for item in items]

        return {
            "items": items,
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": pages,
        }

    async def first(self, session: Optional[AsyncSession] = None):
        """Returns just one single record with filters"""
        sess = session or self._session
        if sess is None:
            raise RuntimeError(...)
        q = self._make_query().limit(1)
        result = await sess.execute(q)
        item = result.scalars().first()
        if self.ItemModel is not None and item is not None:
            item = self.ItemModel(item)                    
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
        if op == "exact":
            return col == value
        if op == "lg":
            return col > value
        if op == "lgq":
            return col >= value
        if op == "sl":
            return col < value
        if op == "slq":
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
