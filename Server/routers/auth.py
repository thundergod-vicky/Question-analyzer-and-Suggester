from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import os
import asyncio
from pydantic import BaseModel, EmailStr
from database import get_db_connection

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
SCHEMA_NAME = "AI_Question_Analyzer_greaterdig"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

router = APIRouter(prefix="/auth", tags=["Authentication"])

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    credits_used: int

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user_from_db(email: str):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(f"SET search_path TO {SCHEMA_NAME};")
    cur.execute("SELECT id, email, credits_used FROM users WHERE email = %s", (email,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    return user

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user = await asyncio.to_thread(get_user_from_db, token_data.email)
    
    if user is None:
        raise credentials_exception
    return {"id": user[0], "email": user[1], "credits_used": user[2]}

@router.post("/register", response_model=UserOut)
async def register(user_in: UserCreate):
    def register_user():
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(f"SET search_path TO {SCHEMA_NAME};")
        
        # Check if user exists
        cur.execute("SELECT id FROM users WHERE email = %s", (user_in.email,))
        if cur.fetchone():
            cur.close()
            conn.close()
            return None
        
        # Create user
        hashed_password = get_password_hash(user_in.password)
        cur.execute(
            "INSERT INTO users (email, password_hash) VALUES (%s, %s) RETURNING id, email, credits_used",
            (user_in.email, hashed_password)
        )
        new_user = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        return new_user

    new_user = await asyncio.to_thread(register_user)
    if new_user is None:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    return {"id": new_user[0], "email": new_user[1], "credits_used": new_user[2]}

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    def authenticate_user():
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(f"SET search_path TO {SCHEMA_NAME};")
        cur.execute("SELECT id, email, password_hash FROM users WHERE email = %s", (form_data.username,))
        user = cur.fetchone()
        cur.close()
        conn.close()
        return user

    user = await asyncio.to_thread(authenticate_user)
    
    if not user or not verify_password(form_data.password, user[2]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user[1]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user
