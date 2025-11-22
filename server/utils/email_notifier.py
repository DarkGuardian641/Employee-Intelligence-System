import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from config import MAIL_CONFIG
from utils.logs import log_failure  # Log email failures to file too

def init_mail(app):
    """
    Placeholder function to satisfy app.py import.
    Not strictly needed for smtplib but required to prevent ImportError in app.py.
    """
    pass

def send_database_change_notification(action, employee_data, user_email=None):
    """
    Send email notification when database changes occur
    """
    # Use the config recipient if no specific user email provided
    target_email = user_email if user_email else MAIL_CONFIG["RECIPIENT_EMAIL"]
    
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"🔔 Database Alert: Employee {action}"
        msg['From'] = MAIL_CONFIG["SENDER_EMAIL"]
        msg['To'] = target_email
        
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S IST')
        
        # Define colors based on action
        if action == "ADD":
            color = "#28a745" # Green
            icon = "✅"
            title = "New Employee Added"
        elif action == "UPDATE":
            color = "#ffc107" # Yellow
            icon = "📝"
            title = "Employee Record Updated"
        else: # DELETE
            color = "#dc3545" # Red
            icon = "🗑️"
            title = "Employee Record Deleted"

        # HTML Template
        html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
                <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <h2 style="color: {color}; border-bottom: 3px solid {color}; padding-bottom: 10px;">
                        {icon} {title}
                    </h2>
                    <p style="font-size: 16px; color: #333;">Database change detected:</p>
                    
                    <table style="border-collapse: collapse; margin: 20px 0; width: 100%;">
                        <tr style="background-color: #f8f9fa;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; width: 40%;">Employee ID</td>
                            <td style="padding: 12px; border: 1px solid #ddd;">{employee_data.get('id', 'N/A')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Name</td>
                            <td style="padding: 12px; border: 1px solid #ddd;">{employee_data.get('name', 'N/A')}</td>
                        </tr>
                         <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Salary</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: {color}; font-weight: bold;">
                                ₹{employee_data.get('salary', 0)}
                            </td>
                        </tr>
                    </table>
                    
                    <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px;">
                        ⏰ {timestamp}
                    </p>
                </div>
            </body>
        </html>
        """
        
        msg.attach(MIMEText(html, 'html'))
        
        # Send Email
        with smtplib.SMTP(MAIL_CONFIG["SMTP_SERVER"], MAIL_CONFIG["SMTP_PORT"]) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(MAIL_CONFIG["SENDER_EMAIL"], MAIL_CONFIG["SENDER_PASSWORD"])
            server.sendmail(
                MAIL_CONFIG["SENDER_EMAIL"],
                target_email,
                msg.as_string()
            )
        
        print(f"✓ Email sent to {target_email}")
        return True
        
    except Exception as e:
        error_msg = f"Failed to send email: {str(e)}"
        print(f"✗ {error_msg}")
        log_failure(error_msg, context="EMAIL_NOTIFICATION")
        return False