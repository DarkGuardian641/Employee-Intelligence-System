from flask import Blueprint, request, jsonify
import joblib
import numpy as np
import os


predict_bp = Blueprint('predict', __name__)


MODEL_PATH = os.path.join(os.path.dirname(__file__), '../models/salary_model.pkl')
GENDER_ENCODER_PATH = os.path.join(os.path.dirname(__file__), '../models/gender_encoder.pkl')
JOB_ROLE_ENCODER_PATH = os.path.join(os.path.dirname(__file__), '../models/job_role_encoder.pkl')
LOCATION_ENCODER_PATH = os.path.join(os.path.dirname(__file__), '../models/location_encoder.pkl')


try:
    model = joblib.load(os.path.abspath(MODEL_PATH))
    le_gender = joblib.load(os.path.abspath(GENDER_ENCODER_PATH))
    le_job_role = joblib.load(os.path.abspath(JOB_ROLE_ENCODER_PATH))
    le_location = joblib.load(os.path.abspath(LOCATION_ENCODER_PATH))
    print(f"✓ Model loaded successfully from {MODEL_PATH}")
    print(f"✓ Gender encoder loaded successfully")
    print(f"✓ Job Role encoder loaded successfully")
    print(f"✓ Location encoder loaded successfully")
except Exception as e:
    print(f"✗ Error loading model or encoders: {e}")
    model = None
    le_gender = None
    le_job_role = None
    le_location = None


@predict_bp.route('/predict', methods=['POST'])
def predict():
    if model is None or le_gender is None or le_job_role is None or le_location is None:
        return jsonify({"error": "ML model or encoders not loaded. Check server logs."}), 500
    
    try:
        payload = request.get_json(force=True)
        
        # 1. Update required fields to include all 6 features
        required_fields = ['experience_years', 'age', 'gender', 'position', 'job_role', 'location']
        missing = [f for f in required_fields if f not in payload]
        if missing:
            return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400
        
        # 2. Extract Data
        experience = float(payload["experience_years"])
        age = int(payload["age"])
        gender = str(payload["gender"]).strip()
        position = str(payload["position"]).strip()
        job_role = str(payload["job_role"]).strip()
        location = str(payload["location"]).strip()
        
        # 3. Validation
        if experience < 0 or experience > 50:
            return jsonify({"error": "Experience must be between 0 and 50 years"}), 400
        if age < 18 or age > 100:
            return jsonify({"error": "Age must be between 18 and 100"}), 400
        
        # 4. Encode Gender using LabelEncoder
        try:
            gender_encoded = le_gender.transform([gender])[0]
        except ValueError:
            valid_genders = le_gender.classes_.tolist()
            return jsonify({"error": f"Invalid gender. Must be one of {valid_genders}"}), 400
            
        # 5. Encode Position
        position_map = {
            'Intern': 0,
            'Junior': 1,
            'Senior': 2,
            'Lead': 3,
            'Manager': 4,
            'Director': 5
        }
        
        position_encoded = position_map.get(position)
        if position_encoded is None:
            return jsonify({"error": f"Invalid position. Must be one of {list(position_map.keys())}"}), 400

        # 6. Encode Job_Role using LabelEncoder
        try:
            job_role_encoded = le_job_role.transform([job_role])[0]
        except ValueError:
            valid_job_roles = le_job_role.classes_.tolist()
            return jsonify({"error": f"Invalid job role. Must be one of {valid_job_roles}"}), 400

        # 7. Encode Location using LabelEncoder
        try:
            location_encoded = le_location.transform([location])[0]
        except ValueError:
            valid_locations = le_location.classes_.tolist()
            return jsonify({"error": f"Invalid location. Must be one of {valid_locations}"}), 400

        # 8. Create features array with ALL 6 features in correct order
        # Order: ['Experience_Years', 'Age', 'Gender', 'Position_Encoded', 'Job_Role', 'Location']
        features = np.array([[experience, age, gender_encoded, position_encoded, job_role_encoded, location_encoded]])
        
        # 9. Predict
        prediction = model.predict(features)[0]
        
        return jsonify({
            "prediction": float(prediction),
            "input": {
                "experience_years": experience,
                "age": age,
                "gender": gender,
                "position": position,
                "job_role": job_role,
                "location": location
            }
        }), 200
        
    except ValueError as e:
        return jsonify({"error": f"Invalid data format: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": f"Prediction error: {str(e)}"}), 500
