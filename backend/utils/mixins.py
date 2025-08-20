from typing import Union, List
from sqlalchemy import Column, Integer, DateTime, func
from sqlalchemy.orm import declarative_mixin, RelationshipProperty
from datetime import datetime
from sqlalchemy.inspection import inspect

@declarative_mixin
class BaseMixin:
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __forbidden_list__ = None
    __allowed_relationships__ = None 

    def to_dict(
        self, 
        *, 
        with_forbidden_list: bool = False,
        include_relationships: Union[List[str], bool, None] = None,
        relationship_depth: int = 1
    ) -> dict:
        """
        Convert record into dict.
            if with_forbidden_list = True, columns in __forbiden_list__ will be excluded.
            relationship_depth means how long iteration the recursion will be.
            include_relationships:
                None - uses __allowed_relationships__.
                False - DO NOT include relationships.
                True - DO include ALL relationships.
                List[str] - include only these one, which is written in list.
        """

        mapper = inspect(self.__class__)
        result = {}

        forbidden = self.__forbidden_list__ or []
        for column in mapper.columns:
            key = column.key
            if with_forbidden_list and key in forbidden:
                continue

            value = getattr(self, key)
            if isinstance(value, DateTime):
                result[key] = value.isoformat()
            elif value is None:
                result[key] = None
            else:
                result[key] = value

        if include_relationships is not False and relationship_depth > 0:
            allowed_rels = self.__get_allowed_relationships(include_relationships)
            
            for rel in mapper.relationships:
                if rel.key in allowed_rels:
                    related_obj = getattr(self, rel.key)
                    if related_obj is not None:
                        result[rel.key] = self.__serialize_relationship(
                            related_obj, 
                            rel, 
                            relationship_depth - 1  
                        )

        return result

    def __get_allowed_relationships(self, include_relationships) -> List[str]:
        """Returns the list of allowed relationships"""
        if include_relationships is None:
            return self.__allowed_relationships__ or []
        if include_relationships is True:
            return [rel.key for rel in inspect(self.__class__).relationships]
        if isinstance(include_relationships, list):
            return include_relationships
        return []

    def __serialize_relationship(
        self, 
        related_obj, 
        rel: RelationshipProperty, 
        remaining_depth: int
    ):
        """Recursive serialization"""
        if remaining_depth <= 0:
            return None

        if rel.uselist:
            return [
                item.to_dict(
                    include_relationships=remaining_depth > 1,
                    relationship_depth=remaining_depth
                ) 
                for item in related_obj
            ]
        else:
            return related_obj.to_dict(
                include_relationships=remaining_depth > 1,
                relationship_depth=remaining_depth
            )