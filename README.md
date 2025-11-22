# Employee Salary Prediction System

## 🌟 Description

This project is a full-stack web application designed to manage employee records and predict salaries based on various professional factors. The system combines a robust employee management interface with a Machine Learning model to provide accurate salary estimations.

### Key Features:

- **Salary Prediction**: Utilizes a trained Machine Learning model to predict salaries based on experience, age, gender, job role, and location.
- **Employee Management (CRUD)**: Complete functionality to Add, View, Update, and Delete employee records.
- **Interactive Dashboard**: Visual analytics of employee data using Chart.js.
- **Search Functionality**: Efficiently search through the employee database.
- **Email Notifications**: Integrated system for sending email alerts.

<br>

## ⚙️ Prerequisites

Before running the project, ensure you have the following installed:

- **Node.js** (v14+ recommended)
- **Python** (v3.8+ recommended)
- **MySQL Server**

### Tech Stack

- **Frontend**: React (Vite), Bootstrap 5, Chart.js
- **Backend**: Flask (Python), MySQL
- **Machine Learning**: Scikit-learn, Pandas, NumPy

<br>

## 🛠️ Setup & Installation

### 1. Database Setup

1. Ensure MySQL is running.
2. Create the database and tables using the provided SQL script:
   - Run the contents of `server/models.sql` in your MySQL client.

### 2. Backend Setup

1. Navigate to the root directory.
2. Create and activate a virtual environment:
   ```sh
   python -m venv venv
   # Windows: venv\Scripts\activate
   # Mac/Linux: source venv/bin/activate
   ```
3. Install Python dependencies:
   ```sh
   pip install -r requirements.txt
   ```
4. Configure Database:
   - Update `server/config.py` with your MySQL credentials.

### 3. Frontend Setup

1. Navigate to the client directory:
   ```sh
   cd client
   ```
2. Install Node dependencies:
   ```sh
   npm install
   ```

<br>

## 🚀 How to Run

### Option A: Run Separately

**Backend:**

```sh
cd server
python app.py
```

**Frontend:**

```sh
cd client
npm run dev
```

### Option B: Run Concurrently

From the `client` directory:

```sh
npm start
```

<br>

## 📺 API Endpoints

| Method | Endpoint              | Description                    |
| ------ | --------------------- | ------------------------------ |
| GET    | `/health`             | Server health check            |
| GET    | `/api/employees`      | Retrieve all employees         |
| POST   | `/api/employees`      | Create a new employee          |
| PUT    | `/api/employees/<id>` | Update an existing employee    |
| DELETE | `/api/employees/<id>` | Delete an employee             |
| POST   | `/api/predict`        | Predict salary based on inputs |
| POST   | `/api/search`         | Search employees               |

<br>

## 📜 Conclusion

This Employee Salary Prediction System provides a seamless way to manage workforce data and leverage machine learning for salary insights. It demonstrates the integration of a React frontend with a Flask backend and MySQL database.

<br>

## 🤖 Author

[Atharva Baikar](https://github.com/DarkGuardian641)
