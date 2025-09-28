import os
import json
import re
from datetime import datetime
from cryptography.fernet import Fernet
from dotenv import load_dotenv

load_dotenv()

ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", Fernet.generate_key().decode())
fernet = Fernet(ENCRYPTION_KEY.encode())
LOG_FILE_PATH = "logs/secure_app.json"
os.makedirs("logs", exist_ok=True)

def encrypt_text(text: str) -> str:
    """Encrypts a string using Fernet (AES-128)."""
    return fernet.encrypt(text.encode()).decode()

def log_secure_event(event_type: str, event_data: dict):
    """Creates a structured JSON log entry and writes it to a file."""
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "event": event_type,
        "data": event_data
    }
    with open(LOG_FILE_PATH, "a") as log_file:
        log_file.write(json.dumps(log_entry) + "\n")

def extract_urls(text: str) -> list:
    """Extracts all URLs from a block of text."""
    return re.findall(r"(https?://[^\s]+)", text)

def check_domain_mismatch(from_email: str, reply_to: str) -> bool:
    """
    Checks if the domain in 'from_email' mismatches 'reply_to'.
    Returns True if they mismatch, False otherwise.
    """
    if not from_email or not reply_to:
        return False
    
    try:
        from_domain = from_email.split('@')[1]
        reply_domain = reply_to.split('@')[1]
        return from_domain.lower() != reply_domain.lower()
    except IndexError:
        return False