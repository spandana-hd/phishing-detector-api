# Professional Phishing Email Detector

This project is a secure, enterprise-ready phishing email detection system. It is built with a professional, modular backend using FastAPI and includes key cybersecurity features like role-based access control, encrypted logging, and automated vulnerability scanning.

## Key Features

- **Secure by Design**: Endpoints are protected with **JWT authentication**.
- **Role-Based Access Control (RBAC)**: Differentiates between 'admin' and 'analyst' roles, with specific permissions for each.
- **Encrypted Logging**: Sensitive email data is encrypted at rest using AES to ensure data privacy.
- **API Rate Limiting**: Protects the service from abuse and DoS attacks by limiting request frequency.
- **Automated Security Scanning**: Integrated with GitHub Dependabot to automatically detect and patch vulnerable dependencies.
- **Professional & Modular Structure**: The backend code is organized into separate, specialized modules for authentication, ML, and utilities, making it easy to maintain and scale.

## Tech Stack

- **Backend**: FastAPI, Python
- **Security**: JWT, Passlib (for password hashing), Cryptography (for AES encryption)
- **Machine Learning**: Scikit-learn, Joblib
- **API Tools**: Uvicorn, Pydantic, SlowAPI (for rate limiting)
- **Frontend**: React.js, Axios

## How to Run

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/spandana-hd/phishing-detector-api.git](https://github.com/spandana-hd/phishing-detector-api.git)
    cd phishing-email-detector
    ```

2.  **Set up the Backend:**
    - Navigate to the `backend` directory: `cd backend`
    - Create and activate a virtual environment.
    - Create a `.env` file and add your `SECRET_KEY` and `ENCRYPTION_KEY`.
    - Install dependencies: `pip install -r requirements.txt`
    - Run the server: `uvicorn app.main:app --reload`
    - The API will be available at `http://127.0.0.1:8000/docs`.

3.  **Set up the Frontend:**
    - Navigate to the `frontend` directory: `cd frontend`
    - Install dependencies: `npm install`
    - Run the application: `npm start`
    - The frontend will be available at `http://localhost:3000`.

## API Usage

- **Authentication**: `POST /v1/auth/token` with `username` and `password`.
- **Prediction**: `POST /v1/predict/` with email data (requires Bearer token).
- **Admin**: `GET /v1/admin/logs` to view logs (requires 'admin' role).