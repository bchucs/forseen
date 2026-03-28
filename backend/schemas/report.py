from pydantic import BaseModel
from typing import List
from schemas.company import CompanyProfile


class ReportSection(BaseModel):
    title: str
    whats_happening: str
    why_it_matters: str
    what_to_do: str


class PriorityAction(BaseModel):
    priority: str  # high | medium | low
    action: str
    deadline: str
    effort: str


class ReportRequest(BaseModel):
    company: CompanyProfile
    prediction_ids: List[str] = []


class ReportResponse(BaseModel):
    headline: str
    executive_summary: str
    sections: List[ReportSection]
    priority_actions: List[PriorityAction]
    predictions_used: List[str]
