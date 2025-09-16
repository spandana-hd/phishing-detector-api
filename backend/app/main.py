from fastapi import FastAPI, Depends, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from typing import List
import json

# Import all project modules
from .auth import authenticate_user, create_access_token, get_current_user, require_role, User, Token
from .ml_pipeline import predict_single_email
from .models import EmailInput, PredictionResult
from .utils import log_secure_event, encrypt_text, LOG_FILE_PATH

# --- App Configuration ---
app = FastAPI(
    title="Professional Phishing Email Detector",
    version="2.1.0 (RBAC Enabled)",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Routers ---
auth_router = APIRouter(prefix="/v1/auth", tags=["Authentication"])
predict_router = APIRouter(prefix="/v1/predict", tags=["Prediction"])
admin_router = APIRouter(prefix="/v1/admin", tags=["Admin"])

# --- Authentication Endpoint ---
# THIS WAS THE MISSING PART
@auth_router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user_data = authenticate_user(form_data.username, form_data.password)
    if not user_data:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": user_data["username"], "role": user_data["role"]})
    return {"access_token": access_token, "token_type": "bearer"}

# --- Prediction Endpoint ---
@predict_router.post("/", response_model=PredictionResult)
async def predict(email: EmailInput, current_user: User = Depends(get_current_user)):
    result = predict_single_email(email)
    log_secure_event("email_analysis", {
        "user": current_user.username,
        "prediction": result.prediction,
        "encrypted_email": encrypt_text(email.text)
    })
    return result

# --- Admin Endpoint ---
@admin_router.get("/logs", response_model=List[dict])
async def get_secure_logs(current_user: User = Depends(require_role("admin"))):
    try:
        with open(LOG_FILE_PATH, "r") as f:
            logs = [json.loads(line) for line in f]
        return logs
    except FileNotFoundError:
        return []

# --- Add Routers to App ---
app.include_router(auth_router)
app.include_router(predict_router)
app.include_router(admin_router)

@app.get("/", tags=["General"])
def read_root():
    return {"message": "Welcome to the Phishing Detector API"}