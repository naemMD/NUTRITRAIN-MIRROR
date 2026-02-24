from datetime import datetime, timedelta
from jose import jwt
from dotenv import load_dotenv
import os

load_dotenv()

def create_access_token(data: dict):
    to_encode = data.copy()
    
    expire = datetime.utcnow() + timedelta(days=30)
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, os.getenv("SECRET_KEY"), algorithm="HS256")
    
    return encoded_jwt

