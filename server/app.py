from flask import Flask, jsonify
from flask_cors import CORS
from routes.employees import employees_bp
from routes.predict import predict_bp
from routes.search import search_bp 
from config import MAIL_CONFIG
from utils.email_notifier import init_mail

app = Flask(__name__)

# Email configuration
app.config.update(MAIL_CONFIG)
init_mail(app)

# Configure CORS to allow requests from your React frontend
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://localhost:5173"], 
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Register Blueprints (Routes)
app.register_blueprint(employees_bp, url_prefix='/api')
app.register_blueprint(predict_bp, url_prefix='/api')
app.register_blueprint(search_bp, url_prefix='/api')

# Health check endpoint
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "message": "Server is running"}), 200

# Global error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    print("\n" + "="*50)
    print(" Flask Server Starting...")
    print("="*50)
    print("Endpoints:")
    print("   GET    http://localhost:5000/health")
    print("   GET    http://localhost:5000/api/employees")
    print("   POST   http://localhost:5000/api/employees")
    print("   PUT    http://localhost:5000/api/employees/<id>")
    print("   DELETE http://localhost:5000/api/employees/<id>")
    print("   POST   http://localhost:5000/api/predict")
    print("   POST   http://localhost:5000/api/search")
    print("="*50 + "\n")
    
    # Run the application
    app.run(debug=True, port=5000, host='0.0.0.0')