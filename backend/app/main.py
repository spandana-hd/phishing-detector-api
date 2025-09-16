from fastapi import FastAPI, Depends, APIRouter, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from typing import List
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Import our project modules
from .auth import authenticate_user, create_access_token, get_current_user, require_role
from .ml_pipeline import predict_single_email
from .models import EmailInput, User, Token, PredictionResult
from .utils import log_secure_event, encrypt_text, LOG_FILE_PATH
import json

# --- Rate Limiter Configuration ---
limiter = Limiter(key_func=get_remote_address)

# --- App Configuration ---
app = FastAPI(
    title="Professional Phishing Email Detector",
    version="2.2.0 (Rate Limiting Enabled)",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# --- Middleware ---
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
@auth_router.post("/token", response_model=Token)
@limiter.limit("15/minute")  # Apply rate limit
async def login_for_access_token(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": user["username"], "role": user["role"]})
    return {"access_token": access_token, "token_type": "bearer"}

# --- Prediction Endpoint ---
@predict_router.post("/", response_model=PredictionResult)
@limiter.limit("30/minute")  # Apply rate limit
async def predict(request: Request, email: EmailInput, current_user: User = Depends(get_current_user)):
    result = predict_single_email(email)
    log_secure_event("email_analysis", {
        "user": current_user.username,
        "prediction": result.prediction,
        "encrypted_email": encrypt_text(email.text)
    })
    return result

# --- Admin Endpoint ---
@admin_router.get("/logs", response_model=List[dict])
async def get_secure_logs(request: Request, current_user: User = Depends(require_role("admin"))):
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
@limiter.limit("60/minute") # Also rate limit the root
def read_root(request: Request):
    return {"message": "Welcome to the Phishing Detector API"}