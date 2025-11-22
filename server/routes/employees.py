from flask import Blueprint, request, jsonify
from db import query_all, execute
from mysql.connector import Error
# Import BOTH the logging utility and the email notifier
from utils.logs import log_database_change, log_failure
from utils.email_notifier import send_database_change_notification

employees_bp = Blueprint('employees', __name__)

def validate_employee_data(data):
    """Validate employee data with new fields"""
    required_fields = ['name', 'experience_years', 'age', 'gender', 'position', 'department', 'location', 'job_role', 'salary']
    
    for field in required_fields:
        if field not in data:
            return False, f"Missing required field: {field}"
        if data[field] is None or str(data[field]).strip() == '':
            return False, f"Field cannot be empty: {field}"
    
    try:
        name = str(data['name']).strip()
        exp = float(data['experience_years'])
        age = int(data['age'])
        salary = float(data['salary'])
        gender = str(data['gender']).strip()
        position = str(data['position']).strip()
        department = str(data['department']).strip()
        location = str(data['location']).strip()
        job_role = str(data['job_role']).strip()
        
        # Validations
        if len(name) < 2 or len(name) > 100:
            return False, "Name must be between 2 and 100 characters"
        if exp < 0 or exp > 50:
            return False, "Experience must be between 0 and 50 years"
        if age < 18 or age > 100:
            return False, "Age must be between 18 and 100"
        if salary < 0:
            return False, "Salary must be positive"
        if gender not in ['Male', 'Female', 'male', 'female']:
            return False, "Gender must be 'Male' or 'Female'"
        if department not in ['HR', 'Tech', 'Finance', 'Operations', 'Marketing', 'Sales', 'Support']:
            return False, "Invalid department"
        if len(position) < 2 or len(position) > 100:
            return False, "Position must be between 2 and 100 characters"
        if len(location) < 2 or len(location) > 50:
            return False, "Location must be between 2 and 50 characters"
        if len(job_role) < 2 or len(job_role) > 100:
            return False, "Job role must be between 2 and 100 characters"
            
        return True, None
    except (ValueError, TypeError) as e:
        return False, f"Invalid data format: {str(e)}"


@employees_bp.route('/employees', methods=['GET'])
def get_employees():
    try:
        print("📋 Fetching employees from database...")
        rows = query_all("SELECT * FROM employees ORDER BY id DESC")
        print(f"✓ Successfully fetched {len(rows)} employees")
        return jsonify(rows), 200
    except Error as e:
        error_msg = f"Database error: {str(e)}"
        print(f"✗ {error_msg}")
        log_failure(error_msg, context="GET_EMPLOYEES")
        return jsonify({"error": error_msg}), 500
    except Exception as e:
        error_msg = f"Server error: {str(e)}"
        print(f"✗ {error_msg}")
        log_failure(error_msg, context="GET_EMPLOYEES")
        return jsonify({"error": error_msg}), 500


@employees_bp.route('/employees/<int:emp_id>', methods=['GET'])
def get_employee(emp_id):
    try:
        print(f"📋 Fetching employee ID: {emp_id}")
        rows = query_all("SELECT * FROM employees WHERE id=%s", (emp_id,))
        if not rows:
            print(f"✗ Employee {emp_id} not found")
            return jsonify({"error": "Employee not found"}), 404
        print(f"✓ Found employee {emp_id}")
        return jsonify(rows[0]), 200
    except Error as e:
        error_msg = f"Database error: {str(e)}"
        print(f"✗ {error_msg}")
        log_failure(error_msg, context="GET_ONE_EMPLOYEE")
        return jsonify({"error": error_msg}), 500
    except Exception as e:
        error_msg = f"Server error: {str(e)}"
        print(f"✗ {error_msg}")
        log_failure(error_msg, context="GET_ONE_EMPLOYEE")
        return jsonify({"error": error_msg}), 500


@employees_bp.route('/employees', methods=['POST'])
def add_employee():
    try:
        print("➕ Adding new employee...")
        data = request.get_json(force=True)
        print(f"📥 Received data: {data}")
        
        is_valid, error_msg = validate_employee_data(data)
        if not is_valid:
            print(f"✗ Validation failed: {error_msg}")
            return jsonify({"error": error_msg}), 400
        
        gender = data['gender'].capitalize()
        
        sql = """
            INSERT INTO employees 
            (name, experience_years, age, gender, position, department, location, job_role, salary) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        params = (
            data["name"].strip(),
            float(data["experience_years"]),
            int(data["age"]),
            gender,
            data["position"].strip(),
            data["department"],
            data["location"].strip(),
            data["job_role"].strip(),
            float(data["salary"])
        )
        
        print(f"💾 Executing SQL with params: {params}")
        new_id = execute(sql, params)
        
        employee_data = {
            "id": new_id,
            "name": data["name"].strip(),
            "experience_years": float(data["experience_years"]),
            "age": int(data["age"]),
            "gender": gender,
            "position": data["position"].strip(),
            "department": data["department"],
            "location": data["location"].strip(),
            "job_role": data["job_role"].strip(),
            "salary": float(data["salary"])
        }
        
        # 1. Log to File
        print(f"📝 Logging ADD action for ID: {new_id}")
        log_database_change("ADD", employee_data)
        
        # 2. Send Email
        print(f"📧 Sending ADD email for ID: {new_id}")
        send_database_change_notification("ADD", employee_data)
        
        print(f"✓ Successfully added employee ID: {new_id}")
        return jsonify(employee_data), 201
        
    except Error as e:
        error_msg = f"Database error: {str(e)}"
        print(f"✗ {error_msg}")
        log_failure(error_msg, context="ADD_EMPLOYEE")
        return jsonify({"error": error_msg}), 500
    except Exception as e:
        error_msg = f"Server error: {str(e)}"
        print(f"✗ {error_msg}")
        log_failure(error_msg, context="ADD_EMPLOYEE")
        return jsonify({"error": error_msg}), 500


@employees_bp.route('/employees/<int:emp_id>', methods=['PUT'])
def update_employee(emp_id):
    try:
        print(f"📝 Updating employee ID: {emp_id}")
        data = request.get_json(force=True)
        print(f"📥 Received data: {data}")
        
        is_valid, error_msg = validate_employee_data(data)
        if not is_valid:
            print(f"✗ Validation failed: {error_msg}")
            return jsonify({"error": error_msg}), 400
        
        existing = query_all("SELECT * FROM employees WHERE id=%s", (emp_id,))
        if not existing:
            print(f"✗ Employee {emp_id} not found")
            return jsonify({"error": "Employee not found"}), 404
        
        gender = data['gender'].capitalize()
        
        sql = """
            UPDATE employees 
            SET name=%s, experience_years=%s, age=%s, gender=%s, 
                position=%s, department=%s, location=%s, job_role=%s, salary=%s 
            WHERE id=%s
        """
        params = (
            data["name"].strip(),
            float(data["experience_years"]),
            int(data["age"]),
            gender,
            data["position"].strip(),
            data["department"],
            data["location"].strip(),
            data["job_role"].strip(),
            float(data["salary"]),
            emp_id
        )
        
        print(f"💾 Executing SQL with params: {params}")
        execute(sql, params)
        
        employee_data = {
            "id": emp_id,
            "name": data["name"].strip(),
            "experience_years": float(data["experience_years"]),
            "age": int(data["age"]),
            "gender": gender,
            "position": data["position"].strip(),
            "department": data["department"],
            "location": data["location"].strip(),
            "job_role": data["job_role"].strip(),
            "salary": float(data["salary"])
        }
        
        # 1. Log to File
        print(f"📝 Logging UPDATE action for ID: {emp_id}")
        log_database_change("UPDATE", employee_data)
        
        # 2. Send Email
        print(f"📧 Sending UPDATE email for ID: {emp_id}")
        send_database_change_notification("UPDATE", employee_data)
        
        print(f"✓ Successfully updated employee ID: {emp_id}")
        return jsonify(employee_data), 200
        
    except Error as e:
        error_msg = f"Database error: {str(e)}"
        print(f"✗ {error_msg}")
        log_failure(error_msg, context="UPDATE_EMPLOYEE")
        return jsonify({"error": error_msg}), 500
    except Exception as e:
        error_msg = f"Server error: {str(e)}"
        print(f"✗ {error_msg}")
        log_failure(error_msg, context="UPDATE_EMPLOYEE")
        return jsonify({"error": error_msg}), 500


@employees_bp.route('/employees/<int:emp_id>', methods=['DELETE'])
def delete_employee(emp_id):
    try:
        print(f"🗑️ Deleting employee ID: {emp_id}")
        
        existing = query_all("SELECT * FROM employees WHERE id=%s", (emp_id,))
        if not existing:
            print(f"✗ Employee {emp_id} not found")
            return jsonify({"error": "Employee not found"}), 404
        
        # Capture data before deletion for the log/email
        employee_data_for_log = existing[0]
        
        execute("DELETE FROM employees WHERE id=%s", (emp_id,))
        
        # 1. Log to File
        print(f"📝 Logging DELETE action for ID: {emp_id}")
        log_database_change("DELETE", employee_data_for_log)
        
        # 2. Send Email
        print(f"📧 Sending DELETE email for ID: {emp_id}")
        send_database_change_notification("DELETE", employee_data_for_log)
        
        print(f"✓ Successfully deleted employee ID: {emp_id}")
        return jsonify({"deleted": emp_id, "message": "Employee deleted successfully"}), 200
        
    except Error as e:
        error_msg = f"Database error: {str(e)}"
        print(f"✗ {error_msg}")
        log_failure(error_msg, context="DELETE_EMPLOYEE")
        return jsonify({"error": error_msg}), 500
    except Exception as e:
        error_msg = f"Server error: {str(e)}"
        print(f"✗ {error_msg}")
        log_failure(error_msg, context="DELETE_EMPLOYEE")
        return jsonify({"error": error_msg}), 500