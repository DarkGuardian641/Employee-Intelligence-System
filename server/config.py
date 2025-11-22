import os

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", "root"),
    "database": os.getenv("DB_NAME", "company_db")
}

# Centralized Configuration
MAIL_CONFIG = {
    "SMTP_SERVER": "smtp.gmail.com",
    "SMTP_PORT": 587,
    "SENDER_EMAIL": "atharvab641@gmail.com",
    "SENDER_PASSWORD": "ryktmbgpswzmimsz",
    "RECIPIENT_EMAIL": "atharvab641@gmail.com"
}
