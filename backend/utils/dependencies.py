from typing import Any, Dict, Optional, Set, Callable
from fastapi import Request, Query
from sqlalchemy.orm import DeclarativeMeta

def _get_model_columns(model: DeclarativeMeta) -> Set[str]:
    return {c.name for c in getattr(model, "__table__").columns}

def _get_forbidden_list(model: DeclarativeMeta) -> Set[str]:
    forb = getattr(model, "__forbidden_list__")

    if forb is None:
        forb = []
    
    return forb

def create_filter_dependency(model: DeclarativeMeta) -> Callable:
    """
    Returns a FastAPI dependency function bound to model.
    Usage: filters: dict = Depends(create_filter_dependency(User))
    """
    allowed_columns = _get_model_columns(model) - _get_forbidden_list(model)

    async def _parse_filters(
        request: Request,
        page: int = Query(1, ge=1),
    ) -> Dict[str, Any]:
        params = dict(request.query_params)
        params.pop("page", None)

        out: Dict[str, Any] = {}
        for key, value in params.items():
            if value is None or value == "":
                continue

            if "__" in key:
                base, _ = key.split("__", 1)
            else:
                base = key

            if base in allowed_columns:
                out[key] = value

        return out

    return _parse_filters
