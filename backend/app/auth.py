import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv

from .models import TokenData, User

load_dotenv()

# --- Security Configuration ---
SECRET_KEY = os.getenv("SECRET_KEY", "a-strong-default-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/v1/auth/token")

# --- Password Utilities ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# --- Mock User Database with Roles ---
FAKE_USERS_DB = {
    "admin": {
        "username": "admin",
        "hashed_password": get_password_hash("admin123"),
        "role": "admin"  # Admin user
    },
    "analyst": {
        "username": "analyst",
        "hashed_password": get_password_hash("analyst123"),
        "role": "analyst" # Analyst user
    }
}

# --- Core Authentication Functions ---
def authenticate_user(username: str, password: str) -> Optional[dict]:
    user = FAKE_USERS_DB.get(username)
    if not user or not verify_password(password, user["hashed_password"]):
        return None
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    # Add the user's role to the JWT token payload
    to_encode.update({"role": data.get("role", "analyst")})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# --- User and Role Dependencies ---
async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role") # <-- Extract role from token
        if username is None or role is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    user_data = FAKE_USERS_DB.get(token_data.username)
    if user_data is None:
        raise credentials_exception
    return User(**user_data)

# New dependency to check for a specific role
def require_role(required_role: str):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )
        return current_user
    return role_checker

