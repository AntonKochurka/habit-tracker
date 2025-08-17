from sqlalchemy import Column, Integer, DateTime, func
from sqlalchemy.orm import declarative_mixin

@declarative_mixin
class BaseMixin:
    id = Column(Integer, primary_key=True, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __forbidden_list__ = None

    def to_dict(self, *, with_forbidden_list: bool = False) -> dict:
        """
        Convert record into dict.
        if with_forbidden_list = True, columns in __forbiden_list__ will be excluded.
        """
        from sqlalchemy.inspection import inspect

        mapper = inspect(self.__class__)
        result = {}

        forbidden = self.__forbidden_list__ or []
        for column in mapper.columns:
            key = column.key
            if with_forbidden_list and key in forbidden:
                continue
            result[key] = getattr(self, key)

        return result
