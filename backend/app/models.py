from pydantic import BaseModel
from typing import List

class EmailInput(BaseModel):
    text: str
    from_email: str = ""
    reply_to: str = ""

class PredictionResult(BaseModel):
    prediction: str
    confidence: float
    suspicious_urls: List[str]
    domain_mismatch: bool
    reason: List[str]