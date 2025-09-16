# Phishing Email Detector — Backend (FastAPI)

A minimal, production-friendly backend that exposes a `/api/detect` endpoint to classify emails as **phishing** or **legitimate**.
It ships with a prepackaged lightweight model artifact so you can run without training.

## Quickstart

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

Open:
- Health: http://127.0.0.1:8000/health
- Predict (POST): http://127.0.0.1:8000/api/detect

### Example request (POST /api/detect)
```json
{
  "raw_email": "From: \"PayPal\" <security@paypalsecure.com>\nSubject: Urgent: Your account is limited\n\nVerify now at http://phish.example/verify"
}
```

### Example response
```json
{
  "label": "phishing",
  "score": 0.87,
  "explanation": [
    {"feature": "verify", "count": 1, "weight": 2.0},
    {"feature": "links", "count": 1, "weight": 1.0},
    {"feature": "urgent", "count": 1, "weight": 2.0},
    {"feature": "account", "count": 1, "weight": 1.6}
  ]
}
```

## Notes
- The bundled model is **rule-weighted** for portability. You can later replace it with a TF‑IDF + Naive Bayes or Logistic Regression model and still keep the same API surface (must implement `predict_proba` and `explain`).  
- All artifacts live under `model_artifacts/`.
