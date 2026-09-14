from typing import Any, Dict, List

from fastapi import HTTPException

from .schemas import FieldDefinition


def validate_custom_fields(
    custom_fields: Dict[str, Any], field_definitions: List[FieldDefinition]
) -> Dict[str, Any]:
    defs_by_name = {f.name: f for f in field_definitions}

    for key, value in custom_fields.items():
        field_def = defs_by_name.get(key)
        if field_def is None:
            raise HTTPException(status_code=400, detail=f"Unknown field '{key}' for this habit")

        if field_def.type == "integer" and not (isinstance(value, int) and not isinstance(value, bool)):
            raise HTTPException(status_code=400, detail=f"Field '{key}' must be an integer")
        if field_def.type == "float" and not (
            isinstance(value, (int, float)) and not isinstance(value, bool)
        ):
            raise HTTPException(status_code=400, detail=f"Field '{key}' must be a number")
        if field_def.type == "text" and not isinstance(value, str):
            raise HTTPException(status_code=400, detail=f"Field '{key}' must be text")

    return custom_fields
