from datetime import datetime

from pydantic import BaseModel


class RequirementConstraintResponse(BaseModel):
    id: int
    requirement_id: int
    metric: str
    operator: str
    value: float | None
    unit: str | None
    qualifier: str | None
    context: str | None
    source_text: str | None
    sequence: int
    created_at: datetime

    model_config = {
        "from_attributes": True
    }
