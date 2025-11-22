import os
from datetime import datetime

def _get_log_path(filename):
    """
    Internal helper to get the absolute path for a log file.
    Creates the 'server/logs' directory if it doesn't exist.
    """
    # Go up two levels from utils/logs.py to get to 'server' folder
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    log_dir = os.path.join(base_dir, 'logs')
    
    # Create directory if it doesn't exist
    os.makedirs(log_dir, exist_ok=True)
    
    return os.path.join(log_dir, filename)

def log_database_change(action, employee_data, user_email="System"):
    """
    Logs database modifications (ADD, UPDATE, DELETE) to database_changes.log
    """
    try:
        log_file = _get_log_path('database_changes.log')
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Define icons based on action
        icons = {
            "ADD": "✅",
            "UPDATE": "📝",
            "DELETE": "🗑️"
        }
        icon = icons.get(action, "🔔")

        with open(log_file, 'a', encoding='utf-8') as f:
            f.write(f"\n{'='*60}\n")
            f.write(f"⏰ TIME:   {timestamp}\n")
            f.write(f"📂 LOG:    DATABASE CHANGE\n")
            f.write(f"{'-'*60}\n")
            f.write(f"{icon} ACTION: {action}\n")
            f.write(f"👤 USER:   {user_email}\n")
            f.write(f"📄 DATA:\n")
            
            # Gracefully handle dictionary or string data
            if isinstance(employee_data, dict):
                # ID first
                if 'id' in employee_data:
                     f.write(f"   • ID: {employee_data['id']}\n")
                # Other fields
                for k, v in employee_data.items():
                    if k != 'id':
                        f.write(f"   • {k.replace('_', ' ').title()}: {v}\n")
            else:
                f.write(f"   {str(employee_data)}\n")
            
            f.write(f"{'='*60}\n")
            
        return True
    except Exception as e:
        # If db logging fails, log it to failure logs
        log_failure(f"Logging System Error: Failed to write to database_changes.log - {str(e)}")
        return False

def log_failure(error_message, context="General"):
    """
    Logs errors and exceptions to failure_logs.log
    """
    try:
        log_file = _get_log_path('failure_logs.log')
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        with open(log_file, 'a', encoding='utf-8') as f:
            # Simple one-line format for errors to keep it readable
            f.write(f"[{timestamp}] [{context.upper()}] ❌ {error_message}\n")
            
        return True
    except Exception as e:
        print(f"CRITICAL: Logging system failed completely. {e}")
        return False