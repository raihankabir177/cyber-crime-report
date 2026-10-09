from flask import Flask, request, jsonify, session, send_from_directory
import os
from werkzeug.utils import secure_filename
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = 'your_secret_key'  # Needed for session

app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'Rahu@12345'
app.config['MYSQL_DB'] = 'cybercrime_db'


UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
print(f"Upload folder configured: {UPLOAD_FOLDER}")
print(f"Upload folder exists: {os.path.exists(UPLOAD_FOLDER)}")

# Database connection function
def get_db_connection():
    """Get database connection"""
    try:
        connection = mysql.connector.connect(
            host=app.config['MYSQL_HOST'],
            user=app.config['MYSQL_USER'],
            password=app.config['MYSQL_PASSWORD'],
            database=app.config['MYSQL_DB']
        )
        if connection.is_connected():
            print("Successfully connected to MySQL Database")
            return connection
    except Error as e:
        print(f"Error connecting to MySQL Database: {e}")
        return None

# Test database connection
@app.route('/test_db')
def test_db():
    connection = get_db_connection()
    if connection:
        cursor = connection.cursor()
        try:
            # Test if tables exist
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            connection.close()
            return jsonify({
                "message": "Database connection successful",
                "tables": [table[0] for table in tables]
            }), 200
        except Exception as e:
            connection.close()
            return jsonify({"error": f"Database error: {str(e)}"}), 500
    return jsonify({"error": "Database connection failed"}), 500


# In-memory storage for audit logs (fallback if database is not available)
audit_logs = []


def init_database():
    """Initialize database tables"""
    connection = get_db_connection()
    if connection:
        cursor = connection.cursor()
        try:
            # Read and execute the database schema
            with open('database_schema.sql', 'r') as file:
                schema = file.read()
                # Split by semicolon and execute each statement
                statements = schema.split(';')
                for statement in statements:
                    if statement.strip():
                        cursor.execute(statement)
            connection.commit()
            print("Database initialized successfully")
        except Exception as e:
            print(f"Error initializing database: {e}")
        finally:
            cursor.close()
            connection.close()



def log_audit_event(user, action, details, status="Success", ip_address="127.0.0.1"):
    """Helper function to log audit events"""
    from datetime import datetime
    
    # Get user_id from session if available
    user_id = session.get('user_id') if session else None
    
    # If user_id is not available, try to find it by email
    if not user_id and session.get('email'):
        connection = get_db_connection()
        if connection:
            cursor = connection.cursor()
            try:
                cursor.execute("SELECT id FROM users WHERE email = %s", (session.get('email'),))
                result = cursor.fetchone()
                if result:
                    user_id = result[0]
            except Exception as e:
                print(f"Error finding user_id by email: {e}")
            finally:
                cursor.close()
                connection.close()
    
    connection = get_db_connection()
    if connection:
        cursor = connection.cursor()
        try:
            cursor.execute("""
                INSERT INTO audit_logs (user_id, action, details, ip_address, status)
                VALUES (%s, %s, %s, %s, %s)
            """, (user_id, action, details, ip_address, status))
            connection.commit()
            print(f"Audit Log: {action} by {user} (user_id: {user_id}) - {details}")
        except Exception as e:
            print(f"Error logging audit event: {e}")
        finally:
            cursor.close()
            connection.close()
    else:
        # Fallback to in-memory logging if database is not available
        log_entry = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "user": user,
            "action": action,
            "details": details,
            "status": status,
            "ip_address": ip_address
        }
        audit_logs.append(log_entry)
        print(f"Audit Log: {action} by {user} - {details}")

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    print(f"Login attempt for email: {email}")
    
    # Get user from database
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT u.id, u.name, u.email, u.password, u.role, u.phone
            FROM users u WHERE u.email = %s AND u.is_active = TRUE
        """, (email,))
        user = cursor.fetchone()
        
        if not user:
            print(f"User not found: {email}")
            return jsonify({"error": "Invalid credentials"}), 401
        
        # Check password
        if not check_password_hash(user['password'], password):
            print(f"Password mismatch for user: {email}")
            return jsonify({"error": "Invalid credentials"}), 401
        
        # Set session
        session['user_id'] = user['id']
        session['email'] = user['email']
        session['role'] = user['role']
        
        print(f"Login successful for {user['role']}: {email}")
        
        # Log the login event
        log_audit_event(user['name'], "User Login", f"Login successful for {user['role']}", "Success", request.remote_addr)
        
        return jsonify({
            "message": "Login successful",
            "role": user['role'],
            "name": user['name']
        }), 200
        
    except Exception as e:
        print(f"Database error during login: {e}")
        return jsonify({"error": "Database error"}), 500
    finally:
        cursor.close()
        connection.close()
    
    user_id = user.get('id', 1)  # Use actual user ID if available
    role = user["role"]
    name = user["name"]
    session['user_id'] = user_id
    session['role'] = role
    session['email'] = email
    
    print(f"Login successful for {email} with role: {role}")
    print(f"Session after login: {session}")
    
    # Log the login event
    log_audit_event(name, "Login", f"User logged in successfully", "Success", request.remote_addr)
    
    return jsonify({"message": "Login successful", "role": role, "name": name}), 200

@app.route('/victim/report', methods=['POST'])
def report_crime():
    if 'user_id' not in session or session.get('role') != 'victim':
        return jsonify({"error": "Unauthorized"}), 401
    
    victim_id = session['user_id']
    crime_type = request.form.get('crime_type')
    description = request.form.get('description')
    date_occurred = request.form.get('date')
    location = request.form.get('location')
    files = request.files.getlist('files')
    
    if not all([crime_type, description, date_occurred, location]):
        return jsonify({"error": "All fields are required"}), 400
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = connection.cursor()
    try:
        # Insert the report into database
        cursor.execute("""
            INSERT INTO reports (victim_id, crime_type, description, date_occurred, location, status, priority)
            VALUES (%s, %s, %s, %s, %s, 'Open', 'Medium')
        """, (victim_id, crime_type, description, date_occurred, location))
        
        report_id = cursor.lastrowid
        
        # Handle file uploads
        evidence_files = []
        for file in files:
            if file and file.filename:
                filename = secure_filename(file.filename)
                unique_filename = f"{report_id}_{filename}"
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
                file.save(file_path)
                
                # Save evidence record to database
                cursor.execute("""
                    INSERT INTO evidence (report_id, filename, original_name, file_path, file_size, content_type, uploaded_by, description)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (report_id, unique_filename, file.filename, file_path, os.path.getsize(file_path), file.content_type, victim_id, f"Evidence uploaded with report"))
                
                evidence_files.append({
                    "filename": unique_filename,
                    "original_name": file.filename,
                    "content_type": file.content_type
                })
        
        connection.commit()
        print(f"Report submitted successfully: ID {report_id}")
        
        # Log the report submission event
        victim_name = session.get('email', 'Unknown')
        log_audit_event(victim_name, "Report Submitted", f"Crime report #{report_id} submitted", "Success", request.remote_addr)
        
        return jsonify({
            'message': 'Report submitted successfully', 
            'report_id': report_id,
            'evidence_count': len(evidence_files)
        }), 200
        
    except Exception as e:
        print(f"Database error in report submission: {e}")
        connection.rollback()
        return jsonify({"error": "Database error"}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/victim/report/<int:report_id>/evidence', methods=['POST'])
def add_report_evidence(report_id):
    if 'user_id' not in session or session.get('role') != 'victim':
        return jsonify({"error": "Unauthorized"}), 401
    
    user_id = session['user_id']
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = connection.cursor(dictionary=True)
    try:
        # Check if report exists and belongs to this user
        cursor.execute("""
            SELECT id FROM reports WHERE id = %s AND victim_id = %s
        """, (report_id, user_id))
        
        report = cursor.fetchone()
        if not report:
            return jsonify({"error": "Report not found"}), 404
        
        files = request.files.getlist('files')
        evidence_files = []
        
        for file in files:
            if file and file.filename:
                filename = secure_filename(file.filename)
                unique_filename = f"{report_id}_{filename}"
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
                file.save(file_path)
                
                # Save evidence record to database
                cursor.execute("""
                    INSERT INTO evidence (report_id, filename, original_name, file_path, file_size, content_type, uploaded_by, description)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (report_id, unique_filename, file.filename, file_path, os.path.getsize(file_path), file.content_type, user_id, f"Additional evidence uploaded"))
                
                evidence_files.append({
                    "filename": unique_filename,
                    "original_name": file.filename,
                    "content_type": file.content_type
                })
        
        connection.commit()
        
        # Get updated evidence list for this report
        cursor.execute("""
            SELECT id, filename, original_name, content_type, file_size, description, upload_date
            FROM evidence 
            WHERE report_id = %s
            ORDER BY upload_date DESC
        """, (report_id,))
        
        updated_evidence = cursor.fetchall()
        
        # Convert datetime objects to strings for JSON serialization
        for ev in updated_evidence:
            if ev.get('upload_date'):
                ev['upload_date'] = ev['upload_date'].strftime('%Y-%m-%d %H:%M:%S')
        
        return jsonify({
            'message': 'Evidence added successfully', 
            'evidence': updated_evidence
        }), 200
        
    except Exception as e:
        print(f"Database error in add evidence: {e}")
        connection.rollback()
        return jsonify({"error": "Database error"}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/auth/signup', methods=['POST'])
def signup():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get('confirmPassword')
    role = data.get('role')
    phone = data.get('phone')
    nid = data.get('nid')  # For victim
    # Officer fields
    badge = data.get('badge')
    department = data.get('department')
    specialization = data.get('specialization')
    # Admin fields
    admin_code = data.get('adminCode')
    position = data.get('position')

    # Validate passwords
    if password != confirm_password:
        return jsonify({'error': 'Passwords do not match'}), 400
    
    # Check if user already exists
    connection = get_db_connection()
    if connection:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            cursor.close()
            connection.close()
            return jsonify({'error': 'User already exists'}), 400
        cursor.close()
        connection.close()

    # Role-specific validation
    if role == 'victim':
        if not all([name, email, phone, nid, password]):
            return jsonify({'error': 'All fields are required'}), 400
    elif role == 'officer':
        if not all([name, email, phone, badge, department, specialization, password]):
            return jsonify({'error': 'All fields are required'}), 400
    elif role == 'admin':
        if not all([name, email, phone, admin_code, position, password]):
            return jsonify({'error': 'All fields are required'}), 400
    else:
        return jsonify({'error': 'Invalid role'}), 400

    # Hash password
    password_hash = generate_password_hash(password)
    
    # Save to database
    connection = get_db_connection()
    if connection:
        cursor = connection.cursor()
        try:
            # Insert into users table
            cursor.execute("""
                INSERT INTO users (name, email, password, phone, role)
                VALUES (%s, %s, %s, %s, %s)
            """, (name, email, password_hash, phone, role))
            
            user_id = cursor.lastrowid
            
            # Insert role-specific data
            if role == 'victim':
                cursor.execute("""
                    INSERT INTO victims (user_id, nid)
                    VALUES (%s, %s)
                """, (user_id, nid))
            elif role == 'officer':
                cursor.execute("""
                    INSERT INTO officers (user_id, badge_number, department, specialization)
                    VALUES (%s, %s, %s, %s)
                """, (user_id, badge, department, specialization))
            elif role == 'admin':
                cursor.execute("""
                    INSERT INTO admins (user_id, admin_code, position)
                    VALUES (%s, %s, %s)
                """, (user_id, admin_code, position))
            
            connection.commit()
            print(f"Signup successful for {role}: {email}")
            
            # Log the user creation event
            log_audit_event(name, "User Created", f"New {role} account created", "Success", request.remote_addr)
            
            return jsonify({"message": "Signup successful", "role": role}), 200
            
        except Exception as e:
            print(f"Database error during signup: {e}")
            connection.rollback()
            return jsonify({'error': 'Database error'}), 500
        finally:
            cursor.close()
            connection.close()
    else:
        return jsonify({'error': 'Database connection failed'}), 500

@app.route('/profile', methods=['GET', 'PUT'])
def profile():
    user_id = session.get('user_id')
    email = session.get('email')
    if not user_id or not email:
        return jsonify({"error": "Unauthorized"}), 401
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = connection.cursor(dictionary=True)
    
    try:
        if request.method == 'GET':
            # Get user data with role-specific information
            if session.get('role') == 'victim':
                cursor.execute("""
                    SELECT u.*, v.nid
                    FROM users u
                    LEFT JOIN victims v ON u.id = v.user_id
                    WHERE u.id = %s
                """, (user_id,))
            elif session.get('role') == 'officer':
                cursor.execute("""
                    SELECT u.*, o.badge_number, o.department, o.specialization
                    FROM users u
                    LEFT JOIN officers o ON u.id = o.user_id
                    WHERE u.id = %s
                """, (user_id,))
            elif session.get('role') == 'admin':
                cursor.execute("""
                    SELECT u.*, a.admin_code, a.position
                    FROM users u
                    LEFT JOIN admins a ON u.id = a.user_id
                    WHERE u.id = %s
                """, (user_id,))
            else:
                cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            
            user = cursor.fetchone()
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            # Build profile data
            profile_data = {
                "name": user["name"],
                "email": user["email"],
                "role": user["role"],
                "phone": user.get("phone", ""),
                "id": user["id"],
                "join_date": user.get("created_at", "2024-01-01")
            }
            
            # Add role-specific information
            if user["role"] == "officer":
                profile_data.update({
                    "badge": user.get("badge_number", ""),
                    "department": user.get("department", ""),
                    "specialization": user.get("specialization", "")
                })
            elif user["role"] == "admin":
                profile_data.update({
                    "admin_code": user.get("admin_code", ""),
                    "position": user.get("position", "")
                })
            elif user["role"] == "victim":
                profile_data.update({
                    "nid": user.get("nid", "")
                })
            
            return jsonify({"profile": profile_data}), 200
            
        elif request.method == 'PUT':
            data = request.json
            
            # First, get the current user data to check role and name
            cursor.execute("SELECT name, role FROM users WHERE id = %s", (user_id,))
            current_user = cursor.fetchone()
            if not current_user:
                return jsonify({"error": "User not found"}), 404
            
            # Update basic user information
            update_fields = []
            update_values = []
            
            if "name" in data:
                update_fields.append("name = %s")
                update_values.append(data["name"])
            if "phone" in data:
                update_fields.append("phone = %s")
                update_values.append(data["phone"])
            
            if update_fields:
                update_values.append(user_id)
                cursor.execute(f"""
                    UPDATE users SET {', '.join(update_fields)}
                    WHERE id = %s
                """, update_values)
            
            # Update role-specific information
            if current_user["role"] == "officer":
                if "specialization" in data or "department" in data:
                    officer_fields = []
                    officer_values = []
                    if "specialization" in data:
                        officer_fields.append("specialization = %s")
                        officer_values.append(data["specialization"])
                    if "department" in data:
                        officer_fields.append("department = %s")
                        officer_values.append(data["department"])
                    
                    if officer_fields:
                        officer_values.append(user_id)
                        cursor.execute(f"""
                            UPDATE officers SET {', '.join(officer_fields)}
                            WHERE user_id = %s
                        """, officer_values)
            
            elif current_user["role"] == "admin":
                if "position" in data:
                    cursor.execute("""
                        UPDATE admins SET position = %s WHERE user_id = %s
                    """, (data["position"], user_id))
            
            connection.commit()
            
            # Log the profile update
            log_audit_event(current_user["name"], "Profile Updated", f"User updated their profile information", "Success", request.remote_addr)
            
            # Get updated profile data to return
            if current_user["role"] == 'victim':
                cursor.execute("""
                    SELECT u.*, v.nid
                    FROM users u
                    LEFT JOIN victims v ON u.id = v.user_id
                    WHERE u.id = %s
                """, (user_id,))
            elif current_user["role"] == 'officer':
                cursor.execute("""
                    SELECT u.*, o.badge_number, o.department, o.specialization
                    FROM users u
                    LEFT JOIN officers o ON u.id = o.user_id
                    WHERE u.id = %s
                """, (user_id,))
            elif current_user["role"] == 'admin':
                cursor.execute("""
                    SELECT u.*, a.admin_code, a.position
                    FROM users u
                    LEFT JOIN admins a ON u.id = a.user_id
                    WHERE u.id = %s
                """, (user_id,))
            else:
                cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            
            updated_user = cursor.fetchone()
            if updated_user:
                # Build profile data
                profile_data = {
                    "name": updated_user["name"],
                    "email": updated_user["email"],
                    "role": updated_user["role"],
                    "phone": updated_user.get("phone", ""),
                    "id": updated_user["id"],
                    "join_date": updated_user.get("created_at", "2024-01-01")
                }
                
                # Add role-specific information
                if updated_user["role"] == "officer":
                    profile_data.update({
                        "badge": updated_user.get("badge_number", ""),
                        "department": updated_user.get("department", ""),
                        "specialization": updated_user.get("specialization", "")
                    })
                elif updated_user["role"] == "admin":
                    profile_data.update({
                        "admin_code": updated_user.get("admin_code", ""),
                        "position": updated_user.get("position", "")
                    })
                elif updated_user["role"] == "victim":
                    profile_data.update({
                        "nid": updated_user.get("nid", "")
                    })
                
                return jsonify({"profile": profile_data}), 200
            
            return jsonify({"message": "Profile updated successfully"}), 200
            
    except Exception as e:
        print(f"Database error in profile: {e}")
        return jsonify({"error": "Database error"}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/profile/change-password', methods=['POST'])
def change_password():
    user_id = session.get('user_id')
    email = session.get('email')
    if not user_id or not email:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.json
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    confirm_password = data.get('confirm_password')
    
    if not all([current_password, new_password, confirm_password]):
        return jsonify({"error": "All fields are required"}), 400
    
    if new_password != confirm_password:
        return jsonify({"error": "New passwords do not match"}), 400
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = connection.cursor(dictionary=True)
    try:
        # Get current user data
        cursor.execute("SELECT name, password FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Check current password
        if not check_password_hash(user['password'], current_password):
            return jsonify({"error": "Current password is incorrect"}), 400
        
        # Hash new password
        new_password_hash = generate_password_hash(new_password)
        
        # Update password
        cursor.execute("UPDATE users SET password = %s WHERE id = %s", (new_password_hash, user_id))
        connection.commit()
        
        # Log the password change
        log_audit_event(user["name"], "Password Changed", f"User changed their password", "Success", request.remote_addr)
        
        return jsonify({"message": "Password changed successfully"}), 200
        
    except Exception as e:
        print(f"Database error in change password: {e}")
        return jsonify({"error": "Database error"}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/test-session', methods=['GET'])
def test_session():
    """Test endpoint to check session data"""
    return jsonify({
        'user_id': session.get('user_id'),
        'role': session.get('role'),
        'email': session.get('email'),
        'session_data': dict(session)
    }), 200

@app.route('/profile/stats', methods=['GET'])
def get_profile_stats():
    user_id = session.get('user_id')
    role = session.get('role')
    if not user_id or not role:
        return jsonify({"error": "Unauthorized"}), 401
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = connection.cursor(dictionary=True)
    try:
        stats = {
            "total_reports": 0,
            "active_cases": 0,
            "completed_cases": 0,
            "total_evidence": 0
        }
        
        if role == "victim":
            # Count reports by this victim
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_reports,
                    SUM(CASE WHEN status != 'Closed' THEN 1 ELSE 0 END) as active_cases,
                    SUM(CASE WHEN status = 'Closed' THEN 1 ELSE 0 END) as completed_cases,
                    (SELECT COUNT(*) FROM evidence e WHERE e.report_id IN 
                        (SELECT id FROM reports WHERE victim_id = %s)
                    ) as total_evidence
                FROM reports 
                WHERE victim_id = %s
            """, (user_id, user_id))
            
            result = cursor.fetchone()
            if result:
                stats.update({
                    "total_reports": result["total_reports"] or 0,
                    "active_cases": result["active_cases"] or 0,
                    "completed_cases": result["completed_cases"] or 0,
                    "total_evidence": result["total_evidence"] or 0
                })
            
        elif role == "officer":
            # Count cases assigned to this officer
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_reports,
                    SUM(CASE WHEN status != 'Closed' THEN 1 ELSE 0 END) as active_cases,
                    SUM(CASE WHEN status = 'Closed' THEN 1 ELSE 0 END) as completed_cases,
                    (SELECT COUNT(*) FROM evidence e WHERE e.report_id IN 
                        (SELECT id FROM reports WHERE assigned_officer_id = %s)
                    ) as total_evidence
                FROM reports 
                WHERE assigned_officer_id = %s
            """, (user_id, user_id))
            
            result = cursor.fetchone()
            if result:
                stats.update({
                    "total_reports": result["total_reports"] or 0,
                    "active_cases": result["active_cases"] or 0,
                    "completed_cases": result["completed_cases"] or 0,
                    "total_evidence": result["total_evidence"] or 0
                })
            
        elif role == "admin":
            # Admin sees overall system stats
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_reports,
                    SUM(CASE WHEN status != 'Closed' THEN 1 ELSE 0 END) as active_cases,
                    SUM(CASE WHEN status = 'Closed' THEN 1 ELSE 0 END) as completed_cases,
                    (SELECT COUNT(*) FROM evidence) as total_evidence
                FROM reports
            """)
            
            result = cursor.fetchone()
            if result:
                stats.update({
                    "total_reports": result["total_reports"] or 0,
                    "active_cases": result["active_cases"] or 0,
                    "completed_cases": result["completed_cases"] or 0,
                    "total_evidence": result["total_evidence"] or 0
                })
        
        return jsonify({"stats": stats}), 200
        
    except Exception as e:
        print(f"Database error in get_profile_stats: {e}")
        return jsonify({"error": "Database error"}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """
    Serve uploaded files (for development/testing only).
    """
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)



@app.route('/victim/reports', methods=['GET'])
def get_victim_reports():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT r.*, u.name as victim_name, o.name as assigned_officer_name,
                   (SELECT COUNT(*) FROM evidence e WHERE e.report_id = r.id) as evidence_count
            FROM reports r
            JOIN users u ON r.victim_id = u.id
            LEFT JOIN users o ON r.assigned_officer_id = o.id
            WHERE r.victim_id = %s
            ORDER BY r.date_submitted DESC
        """, (user_id,))
        
        my_reports = cursor.fetchall()
        
        # Convert datetime objects to strings for JSON serialization
        for report in my_reports:
            if report.get('date_submitted'):
                report['date_submitted'] = report['date_submitted'].strftime('%Y-%m-%d %H:%M:%S')
            if report.get('date_occurred'):
                report['date_occurred'] = report['date_occurred'].strftime('%Y-%m-%d')
            if report.get('assignment_date'):
                report['assignment_date'] = report['assignment_date'].strftime('%Y-%m-%d %H:%M:%S')
        
        return jsonify({"reports": my_reports}), 200
        
    except Exception as e:
        print(f"Database error in get_victim_reports: {e}")
        return jsonify({"error": "Database error"}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/victim/report/<int:report_id>', methods=['GET'])
def get_victim_report_details(report_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = connection.cursor(dictionary=True)
    try:
        # Get report details with assigned officer information
        cursor.execute("""
            SELECT r.*, u.name as victim_name, 
                   o.name as assigned_officer_name, o.email as assigned_officer_email,
                   off.badge_number, off.specialization
            FROM reports r
            JOIN users u ON r.victim_id = u.id
            LEFT JOIN users o ON r.assigned_officer_id = o.id
            LEFT JOIN officers off ON o.id = off.user_id
            WHERE r.id = %s AND r.victim_id = %s
        """, (report_id, user_id))
        
        report = cursor.fetchone()
        if not report:
            return jsonify({"error": "Report not found"}), 404
        
        # Get evidence for this report
        cursor.execute("""
            SELECT id, filename, original_name, content_type, file_size, description, upload_date
            FROM evidence 
            WHERE report_id = %s
            ORDER BY upload_date DESC
        """, (report_id,))
        
        evidence = cursor.fetchall()
        
        # Convert datetime objects to strings for JSON serialization
        if report.get('date_submitted'):
            report['date_submitted'] = report['date_submitted'].strftime('%Y-%m-%d %H:%M:%S')
        if report.get('date_occurred'):
            report['date_occurred'] = report['date_occurred'].strftime('%Y-%m-%d')
        if report.get('assignment_date'):
            report['assignment_date'] = report['assignment_date'].strftime('%Y-%m-%d %H:%M:%S')
        
        # Convert evidence datetime objects
        for ev in evidence:
            if ev.get('upload_date'):
                ev['upload_date'] = ev['upload_date'].strftime('%Y-%m-%d %H:%M:%S')
        
        # Add evidence to report
        report['evidence'] = evidence
        
        return jsonify({"report": report}), 200
        
    except Exception as e:
        print(f"Database error in get_victim_report_details: {e}")
        return jsonify({"error": "Database error"}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/officer/all_evidence', methods=['GET'])
def officer_all_evidence():
    if 'user_id' not in session or session.get('role') != 'officer':
        return jsonify({'error': 'Unauthorized'}), 401
    
    officer_id = session.get('user_id')
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT e.id, e.report_id as case_id, e.filename, e.original_name, e.content_type, e.file_size, e.upload_date,
                   r.crime_type, r.status, u.name as victim_name
            FROM evidence e
            JOIN reports r ON e.report_id = r.id
            JOIN users u ON r.victim_id = u.id
            WHERE r.assigned_officer_id = %s
            ORDER BY e.upload_date DESC
        """, (officer_id,))
        
        evidence_list = cursor.fetchall()
        
        # Convert datetime objects to strings for JSON serialization
        for evidence in evidence_list:
            if evidence.get('upload_date'):
                evidence['upload_date'] = evidence['upload_date'].strftime('%Y-%m-%d %H:%M:%S')
        
        return jsonify({'evidence': evidence_list}), 200
        
    except Exception as e:
        print(f"Database error in officer_all_evidence: {e}")
        return jsonify({"error": "Database error"}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/officer/case/<int:case_id>', methods=['GET'])
def get_case_details(case_id):
    print(f"get_case_details called - Case ID: {case_id}")
    print(f"Session: {session}")
    print(f"User ID in session: {session.get('user_id')}")
    print(f"Role in session: {session.get('role')}")
    
    if 'user_id' not in session or session.get('role') != 'officer':
        print(f"Unauthorized access attempt to case details - Session: {session}")
        return jsonify({'error': 'Unauthorized'}), 401
    
    officer_id = session.get('user_id')
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT r.id, r.crime_type, r.description, r.date_occurred, r.date_submitted, r.location, r.status, r.priority,
                   u.name as victim_name, u.phone as victim_phone
            FROM reports r
            JOIN users u ON r.victim_id = u.id
            WHERE r.id = %s AND r.assigned_officer_id = %s
        """, (case_id, officer_id))
        
        case = cursor.fetchone()
        if not case:
            return jsonify({'error': 'Case not found'}), 404
        
        # Convert datetime objects to strings for JSON serialization
        if case.get('date_submitted'):
            case['date_submitted'] = case['date_submitted'].strftime('%Y-%m-%d %H:%M:%S')
        if case.get('date_occurred'):
            case['date_occurred'] = case['date_occurred'].strftime('%Y-%m-%d')
        
        return jsonify({'case': case}), 200
        
    except Exception as e:
        print(f"Database error in get_case_details: {e}")
        return jsonify({"error": "Database error"}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/officer/case/<int:case_id>/logs', methods=['POST'])
def add_case_log(case_id):
    print(f"add_case_log called for case_id: {case_id}")
    print(f"Session data: {session}")
    
    if 'user_id' not in session or session.get('role') != 'officer':
        print("Unauthorized access attempt")
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    print(f"Received data: {data}")
    
    action = data.get('action')
    notes = data.get('notes')
    
    if not all([action, notes]):
        print("Missing required fields")
        return jsonify({'error': 'Action and notes are required'}), 400
    
    officer_id = session.get('user_id')
    print(f"Officer ID: {officer_id}")
    
    connection = get_db_connection()
    if not connection:
        print("Database connection failed")
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = connection.cursor(dictionary=True)
    try:
        # Check if case is assigned to this officer
        cursor.execute("""
            SELECT id FROM reports 
            WHERE id = %s AND assigned_officer_id = %s
        """, (case_id, officer_id))
        
        case = cursor.fetchone()
        if not case:
            print(f"Case {case_id} not found or not assigned to officer {officer_id}")
            return jsonify({'error': 'Case not found or not assigned to you'}), 404
        
        # Create case_logs table if it doesn't exist (without foreign key constraints for now)
        try:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS case_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    report_id INT NOT NULL,
                    officer_id INT NOT NULL,
                    action VARCHAR(100) NOT NULL,
                    notes TEXT,
                    log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    status VARCHAR(50)
                )
            """)
            connection.commit()
        except Exception as table_error:
            print(f"Table creation error (might already exist): {table_error}")
            # Continue anyway, the table might already exist
        
        # Check if the log_date column exists, if not add it
        try:
            cursor.execute("SHOW COLUMNS FROM case_logs LIKE 'log_date'")
            log_date_column_exists = cursor.fetchone()
            if not log_date_column_exists:
                print("Adding missing 'log_date' column to case_logs table")
                cursor.execute("ALTER TABLE case_logs ADD COLUMN log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER notes")
                connection.commit()
        except Exception as alter_error:
            print(f"Error checking/adding log_date column: {alter_error}")
        
        # Insert the log entry
        try:
            print(f"Inserting log entry with values: report_id={case_id}, officer_id={officer_id}, action={action}, notes={notes[:50]}...")
            cursor.execute("""
                INSERT INTO case_logs (report_id, officer_id, action, notes, log_date)
                VALUES (%s, %s, %s, %s, NOW())
            """, (case_id, officer_id, action, notes))
            
            connection.commit()
            print(f"Log added for case {case_id}: {action} - {notes}")
            return jsonify({'message': 'Log entry saved successfully.'}), 200
            
        except Exception as insert_error:
            print(f"Insert error: {insert_error}")
            connection.rollback()
            return jsonify({"error": f"Failed to insert log entry: {str(insert_error)}"}), 500
        
    except Exception as e:
        print(f"Database error in add_case_log: {e}")
        connection.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/officer/case/<int:case_id>/logs', methods=['GET'])
def get_case_logs(case_id):
    print(f"get_case_logs called for case_id: {case_id}")
    print(f"Session data: {session}")
    
    if 'user_id' not in session or session.get('role') != 'officer':
        print("Unauthorized access attempt")
        return jsonify({'error': 'Unauthorized'}), 401
    
    officer_id = session.get('user_id')
    print(f"Officer ID: {officer_id}")
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = connection.cursor(dictionary=True)
    try:
        # Check if case is assigned to this officer
        cursor.execute("""
            SELECT id FROM reports 
            WHERE id = %s AND assigned_officer_id = %s
        """, (case_id, officer_id))
        
        case = cursor.fetchone()
        if not case:
            return jsonify({'error': 'Case not found or not assigned to you'}), 404
        
        # Create case_logs table if it doesn't exist (without foreign key constraints for now)
        try:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS case_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    report_id INT NOT NULL,
                    officer_id INT NOT NULL,
                    action VARCHAR(100) NOT NULL,
                    notes TEXT,
                    log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    status VARCHAR(50)
                )
            """)
        except Exception as table_error:
            print(f"Table creation error (might already exist): {table_error}")
            # Continue anyway, the table might already exist
        
        # Check if the log_date column exists, if not add it
        try:
            cursor.execute("SHOW COLUMNS FROM case_logs LIKE 'log_date'")
            log_date_column_exists = cursor.fetchone()
            if not log_date_column_exists:
                print("Adding missing 'log_date' column to case_logs table")
                cursor.execute("ALTER TABLE case_logs ADD COLUMN log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER notes")
                connection.commit()
        except Exception as alter_error:
            print(f"Error checking/adding log_date column: {alter_error}")
        
        # Get logs for this case
        print(f"Fetching logs for case_id: {case_id}")
        cursor.execute("""
            SELECT cl.*, u.name as officer_name, u.email as officer_email
            FROM case_logs cl
            LEFT JOIN users u ON cl.officer_id = u.id
            WHERE cl.report_id = %s
            ORDER BY cl.log_date DESC
        """, (case_id,))
        
        logs = cursor.fetchall()
        print(f"Found {len(logs)} logs for case {case_id}")
        print(f"Logs: {logs}")
        
        # Convert datetime objects to strings for JSON serialization
        for log in logs:
            if log.get('log_date'):
                log['log_date'] = log['log_date'].strftime('%Y-%m-%d %H:%M:%S')
                # Also add a 'date' field for frontend compatibility
                log['date'] = log['log_date'].split(' ')[0]  # Extract just the date part
        
        return jsonify({'logs': logs}), 200
        
    except Exception as e:
        print(f"Database error in get_case_logs: {e}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/officer/case/<int:case_id>/evidence', methods=['GET', 'POST'])
def officer_case_evidence(case_id):
    if 'user_id' not in session or session.get('role') != 'officer':
        return jsonify({'error': 'Unauthorized'}), 401
    
    officer_id = session.get('user_id')
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = connection.cursor(dictionary=True)
    try:
        # Check if case is assigned to this officer
        cursor.execute("""
            SELECT id FROM reports 
            WHERE id = %s AND assigned_officer_id = %s
        """, (case_id, officer_id))
        
        case = cursor.fetchone()
        if not case:
            return jsonify({'error': 'Case not found or not assigned to you'}), 404
        
        if request.method == 'GET':
            # Get evidence for this case
            cursor.execute("""
                SELECT id, filename, original_name, content_type, file_size, description, upload_date
                FROM evidence 
                WHERE report_id = %s
                ORDER BY upload_date DESC
            """, (case_id,))
            
            evidence = cursor.fetchall()
            
            # Convert datetime objects to strings for JSON serialization
            for ev in evidence:
                if ev.get('upload_date'):
                    ev['upload_date'] = ev['upload_date'].strftime('%Y-%m-%d %H:%M:%S')
            
            return jsonify({'evidence': evidence}), 200
        elif request.method == 'POST':
            files = request.files.getlist('files')
            evidence = []
            from datetime import datetime
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            print(f"Received {len(files)} files for case {case_id}")
            print(f"Files: {[f.filename for f in files if f]}")
            
            if not files:
                return jsonify({'error': 'No files provided'}), 400
            
            for file in files:
                if file and file.filename:
                    try:
                        filename = secure_filename(file.filename)
                        unique_filename = f"{case_id}_{filename}"
                        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
                        file.save(file_path)
                        
                        # Verify file was saved
                        if os.path.exists(file_path):
                            # Save evidence record to database
                            cursor.execute("""
                                INSERT INTO evidence (report_id, filename, original_name, file_path, file_size, content_type, uploaded_by, description)
                                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                            """, (case_id, unique_filename, file.filename, file_path, os.path.getsize(file_path), file.content_type, officer_id, f"Evidence uploaded by officer"))
                            
                            evidence.append({
                                "filename": unique_filename,
                                "original_name": file.filename,
                                "content_type": file.content_type,
                                "description": f"Evidence file: {file.filename}",
                                "uploaded_by": officer_id,
                                "upload_date": current_time
                            })
                        else:
                            return jsonify({'error': f'Failed to save file: {file.filename}'}), 500
                    except Exception as e:
                        return jsonify({'error': f'Error processing file {file.filename}: {str(e)}'}), 500
            
            if evidence:
                connection.commit()
                return jsonify({'message': 'Evidence added successfully', 'evidence': evidence}), 200
            else:
                return jsonify({'error': 'No valid files were uploaded'}), 400
            
    except Exception as e:
        print(f"Database error in officer_case_evidence: {e}")
        connection.rollback()
        return jsonify({"error": "Database error"}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/officer/case/<int:case_id>', methods=['PUT'])
def update_case_status(case_id):
    if 'user_id' not in session or session.get('role') != 'officer':
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    new_status = data.get('status')
    if not new_status:
        return jsonify({'error': 'Status is required'}), 400
    
    officer_id = session.get('user_id')
    
    # Use stored procedure to update status
    try:
        result = update_report_status(case_id, new_status, officer_id)
        if result is not None:
            return jsonify({'message': 'Status updated successfully'}), 200
        else:
            return jsonify({'error': 'Case not found or not assigned to you'}), 404
    except Exception as e:
        print(f"Error in stored procedure call: {e}")
        return jsonify({"error": "Database error"}), 500

@app.route('/admin/assign', methods=['POST'])
def admin_assign():
    print(f"Admin assign request - Session: {session}")
    print(f"User ID in session: {session.get('user_id')}")
    print(f"Role in session: {session.get('role')}")
    
    if 'user_id' not in session or session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    report_id = data.get('report_id')
    officer_id = data.get('officer_id')
    note = data.get('note', '')
    
    if not report_id or not officer_id:
        return jsonify({'error': 'Report ID and Officer ID are required'}), 400
    
    # Use stored procedure to assign officer
    try:
        result = assign_officer_to_report(report_id, officer_id, note)
        if result is not None:
            return jsonify({'message': 'Officer assigned successfully'}), 200
        else:
            return jsonify({'error': 'Failed to assign officer'}), 500
    except Exception as e:
        print(f"Error in stored procedure call: {e}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500

@app.route('/admin/analytics', methods=['GET'])
def admin_analytics():
    if 'user_id' not in session or session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401
    
    # Use stored procedures for statistics
    user_stats = get_user_statistics()
    report_stats = get_report_statistics()
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = connection.cursor(dictionary=True)
    try:
        # Get reports per officer using view
        cursor.execute("""
            SELECT officer_name, total_cases, closed_cases, avg_response_time
            FROM officer_performance_view
            ORDER BY total_cases DESC
        """)
        reports_per_officer = cursor.fetchall()
        
        # Get active cases using view
        cursor.execute("SELECT * FROM active_cases_view LIMIT 10")
        active_cases = cursor.fetchall()
        
        # Get evidence summary using view
        cursor.execute("""
            SELECT report_id, crime_type, evidence_count, total_size
            FROM evidence_summary_view
            ORDER BY evidence_count DESC
            LIMIT 10
        """)
        evidence_summary = cursor.fetchall()
        
        return jsonify({
            'user_stats': user_stats,
            'report_stats': report_stats,
            'reports_per_officer': reports_per_officer,
            'active_cases': active_cases,
            'evidence_summary': evidence_summary
        }), 200
        
    except Exception as e:
        print(f"Database error in admin_analytics: {e}")
        return jsonify({"error": "Database error"}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/admin/active_cases', methods=['GET'])
def get_active_cases():
    if 'user_id' not in session or session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM active_cases_view")
        active_cases = cursor.fetchall()
        
        # Convert datetime objects to strings for JSON serialization
        for case in active_cases:
            if case.get('date_submitted'):
                case['date_submitted'] = case['date_submitted'].strftime('%Y-%m-%d %H:%M:%S')
            if case.get('date_occurred'):
                case['date_occurred'] = case['date_occurred'].strftime('%Y-%m-%d')
        
        return jsonify({'active_cases': active_cases}), 200
        
    except Exception as e:
        print(f"Database error in get_active_cases: {e}")
        return jsonify({"error": "Database error"}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/admin/officer_performance', methods=['GET'])
def get_officer_performance():
    if 'user_id' not in session or session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM officer_performance_view")
        officer_performance = cursor.fetchall()
        
        return jsonify({'officer_performance': officer_performance}), 200
        
    except Exception as e:
        print(f"Database error in get_officer_performance: {e}")
        return jsonify({"error": "Database error"}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/admin/audit_trail', methods=['GET'])
def get_audit_trail():
    if 'user_id' not in session or session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM audit_trail_view LIMIT 100")
        audit_trail = cursor.fetchall()
        
        # Convert datetime objects to strings for JSON serialization
        for log in audit_trail:
            if log.get('timestamp'):
                log['timestamp'] = log['timestamp'].strftime('%Y-%m-%d %H:%M:%S')
        
        return jsonify({'audit_trail': audit_trail}), 200
        
    except Exception as e:
        print(f"Database error in get_audit_trail: {e}")
        return jsonify({"error": "Database error"}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/officer/workload', methods=['GET'])
def get_officer_workload():
    if 'user_id' not in session or session.get('role') != 'officer':
        return jsonify({'error': 'Unauthorized'}), 401
    
    officer_id = session.get('user_id')
    workload = get_officer_workload(officer_id)
    
    if workload:
        return jsonify({'workload': workload}), 200
    else:
        return jsonify({'error': 'Unable to get workload data'}), 500

@app.route('/admin/all_reports', methods=['GET'])
def admin_all_reports():
    if 'user_id' not in session or session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT r.id, r.crime_type, r.description, r.date_occurred, r.date_submitted, r.location, r.status, r.priority,
                   u.name as victim_name, u.phone as victim_phone,
                   o.name as assigned_officer_name
            FROM reports r
            JOIN users u ON r.victim_id = u.id
            LEFT JOIN users o ON r.assigned_officer_id = o.id
            ORDER BY r.date_submitted DESC
        """)
        
        reports = cursor.fetchall()
        
        # Convert datetime objects to strings for JSON serialization
        for report in reports:
            if report.get('date_submitted'):
                report['date_submitted'] = report['date_submitted'].strftime('%Y-%m-%d %H:%M:%S')
            if report.get('date_occurred'):
                report['date_occurred'] = report['date_occurred'].strftime('%Y-%m-%d')
            if report.get('assignment_date'):
                report['assignment_date'] = report['assignment_date'].strftime('%Y-%m-%d %H:%M:%S')
        
        return jsonify({'reports': reports}), 200
        
    except Exception as e:
        print(f"Database error in admin_all_reports: {e}")
        return jsonify({"error": "Database error"}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/admin/available_officers', methods=['GET'])
def admin_available_officers():
    if 'user_id' not in session or session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT u.id, u.name, u.email, u.phone,
                   o.badge_number, o.department, o.specialization, o.rank_name
            FROM users u
            JOIN officers o ON u.id = o.user_id
            WHERE u.role = 'officer' AND u.is_active = TRUE
            ORDER BY u.name
        """)
        
        available_officers = cursor.fetchall()
        
        # Convert to frontend format
        formatted_officers = []
        for officer in available_officers:
            officer_data = {
                'id': officer['id'],
                'name': officer['name'],
                'email': officer['email'],
                'specialization': officer.get('specialization', 'General'),
                'department': officer.get('department', 'Cyber Crime'),
                'badge': officer.get('badge_number', 'N/A'),
                'rank': officer.get('rank_name', 'Officer')
            }
            formatted_officers.append(officer_data)
        
        return jsonify({'officers': formatted_officers}), 200
        
    except Exception as e:
        print(f"Database error in admin_available_officers: {e}")
        return jsonify({"error": "Database error"}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/notifications', methods=['GET'])
def get_notifications():
    user = session.get('user_id')
    user_id = user
    # TODO: Fetch notifications for this user from MySQL
    notifications = [
        # Example:
        # {'id': 1, 'message': 'Your report has been updated.', 'timestamp': '2024-06-10 12:00', 'read': False},
        # ...
    ]
    return jsonify({'notifications': notifications}), 200

@app.route('/notifications/mark-read', methods=['POST'])
def mark_notifications_read():
    user = session.get('user_id')
    user_id = user
    notification_ids = request.json.get('notification_ids', [])
    # TODO: Mark these notifications as read in MySQL for this user
    return jsonify({'message': 'Notifications marked as read'}), 200

@app.route('/officer/assigned_cases', methods=['GET'])
def officer_assigned_cases():
    print(f"Officer assigned_cases called - Session: {session}")
    print(f"User ID in session: {session.get('user_id')}")
    print(f"Role in session: {session.get('role')}")
    
    if 'user_id' not in session or session.get('role') != 'officer':
        print(f"Unauthorized access attempt - Session: {session}")
        return jsonify({'error': 'Unauthorized'}), 401
    
    # Get query parameters for filtering and sorting
    status_filter = request.args.get('status', 'All Status')
    crime_type_filter = request.args.get('crimeType', 'All Types')
    search_query = request.args.get('search', '')
    sort_by = request.args.get('sortBy', 'Date Reported')
    
    officer_id = session.get('user_id')
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = connection.cursor(dictionary=True)
    try:
        # Build the base query
        base_query = """
            SELECT r.id, r.crime_type, r.description, r.date_occurred, r.date_submitted, r.location, r.status, r.priority,
                   u.name as victim_name, u.phone as victim_phone
            FROM reports r
            JOIN users u ON r.victim_id = u.id
            WHERE r.assigned_officer_id = %s
        """
        query_params = [officer_id]
        
        # Add filters
        if status_filter != 'All Status':
            base_query += " AND r.status = %s"
            query_params.append(status_filter)
        
        if crime_type_filter != 'All Types':
            base_query += " AND r.crime_type = %s"
            query_params.append(crime_type_filter)
        
        if search_query:
            base_query += " AND (u.name LIKE %s OR r.crime_type LIKE %s)"
            search_param = f"%{search_query}%"
            query_params.extend([search_param, search_param])
        
        # Add sorting
        if sort_by == 'Victim Name':
            base_query += " ORDER BY u.name"
        elif sort_by == 'Case ID':
            base_query += " ORDER BY r.id"
        elif sort_by == 'Date Reported':
            base_query += " ORDER BY r.date_submitted DESC"
        elif sort_by == 'Crime Type':
            base_query += " ORDER BY r.crime_type"
        elif sort_by == 'Status':
            base_query += " ORDER BY r.status"
        else:
            base_query += " ORDER BY r.date_submitted DESC"
        
        cursor.execute(base_query, query_params)
        assigned = cursor.fetchall()
        
        # Convert datetime objects to strings for JSON serialization
        for case in assigned:
            if case.get('date_submitted'):
                case['date_submitted'] = case['date_submitted'].strftime('%Y-%m-%d %H:%M:%S')
            if case.get('date_occurred'):
                case['date_occurred'] = case['date_occurred'].strftime('%Y-%m-%d')
        
        return jsonify({'cases': assigned}), 200
        
    except Exception as e:
        print(f"Database error in officer_assigned_cases: {e}")
        return jsonify({"error": "Database error"}), 500
    finally:
        cursor.close()
        connection.close()

# New API endpoints for ManageUsers functionality
@app.route('/admin/users', methods=['GET'])
def get_all_users():
    if 'user_id' not in session or session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at,
                   v.nid, v.address, v.emergency_contact,
                   o.badge_number, o.department, o.specialization, o.rank_name,
                   a.admin_code, a.position
            FROM users u
            LEFT JOIN victims v ON u.id = v.user_id
            LEFT JOIN officers o ON u.id = o.user_id
            LEFT JOIN admins a ON u.id = a.user_id
            WHERE u.is_active = TRUE
            ORDER BY u.created_at DESC
        """)
        
        users_list = cursor.fetchall()
        
        # Convert to frontend format
        formatted_users = []
        for user in users_list:
            user_data = {
                'id': user['id'],
                'name': user['name'],
                'email': user['email'],
                'phone': user.get('phone', 'N/A'),
                'role': user['role'].title(),
                'joinDate': user.get('created_at', '2024-01-01').strftime('%Y-%m-%d') if user.get('created_at') else '2024-01-01',
                'specialization': user.get('specialization', 'General'),
                'department': user.get('department', 'Cyber Crime'),
                'badge': user.get('badge_number', 'N/A')
            }
            formatted_users.append(user_data)
        
        return jsonify({'users': formatted_users}), 200
        
    except Exception as e:
        print(f"Database error in get_all_users: {e}")
        return jsonify({"error": "Database error"}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/admin/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    if 'user_id' not in session or session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = connection.cursor()
    try:
        # Update user data in users table
        update_fields = []
        update_values = []
        
        if 'name' in data:
            update_fields.append("name = %s")
            update_values.append(data['name'])
        if 'phone' in data:
            update_fields.append("phone = %s")
            update_values.append(data['phone'])
        if 'role' in data:
            update_fields.append("role = %s")
            update_values.append(data['role'].lower())
        
        if update_fields:
            update_values.append(user_id)
            cursor.execute(f"""
                UPDATE users 
                SET {', '.join(update_fields)}
                WHERE id = %s
            """, update_values)
            
            if cursor.rowcount == 0:
                connection.close()
                return jsonify({'error': 'User not found'}), 404
        
        # Update role-specific data
        if 'role' in data and data['role'].lower() == 'officer':
            if 'specialization' in data or 'department' in data:
                officer_update_fields = []
                officer_update_values = []
                
                if 'specialization' in data:
                    officer_update_fields.append("specialization = %s")
                    officer_update_values.append(data['specialization'])
                if 'department' in data:
                    officer_update_fields.append("department = %s")
                    officer_update_values.append(data['department'])
                
                if officer_update_fields:
                    officer_update_values.append(user_id)
                    cursor.execute(f"""
                        UPDATE officers 
                        SET {', '.join(officer_update_fields)}
                        WHERE user_id = %s
                    """, officer_update_values)
        
        connection.commit()
        
        # Log the user update event
        admin_name = session.get('email', 'Admin')
        log_audit_event(admin_name, "User Updated", f"User ID {user_id} updated", "Success", request.remote_addr)
        
        return jsonify({'message': 'User updated successfully'}), 200
        
    except Exception as e:
        print(f"Database error during user update: {e}")
        connection.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        connection.close()

@app.route('/admin/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    if 'user_id' not in session or session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401
    
    # Don't allow admin to delete themselves
    if user_id == session.get('user_id'):
        return jsonify({'error': 'Cannot delete your own account'}), 400
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = connection.cursor()
    try:
        # Get user info before deletion for audit log
        cursor.execute("SELECT name, email FROM users WHERE id = %s", (user_id,))
        user_info = cursor.fetchone()
        
        if not user_info:
            connection.close()
            return jsonify({'error': 'User not found'}), 404
        
        # Soft delete by setting is_active to FALSE
        cursor.execute("UPDATE users SET is_active = FALSE WHERE id = %s", (user_id,))
        
        if cursor.rowcount == 0:
            connection.close()
            return jsonify({'error': 'User not found'}), 404
        
        connection.commit()
        
        # Log the user deletion event
        admin_name = session.get('email', 'Admin')
        log_audit_event(admin_name, "User Deleted", f"User {user_info[0]} ({user_info[1]}) deleted", "Success", request.remote_addr)
        
        return jsonify({'message': 'User deleted successfully'}), 200
        
    except Exception as e:
        print(f"Database error during user deletion: {e}")
        connection.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        connection.close()

@app.route('/admin/users/stats', methods=['GET'])
def get_user_stats():
    if 'user_id' not in session or session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = connection.cursor()
    try:
        # Get total users count
        cursor.execute("SELECT COUNT(*) FROM users WHERE is_active = TRUE")
        total_users = cursor.fetchone()[0]
        
        # Get counts by role
        cursor.execute("SELECT role, COUNT(*) FROM users WHERE is_active = TRUE GROUP BY role")
        role_counts = cursor.fetchall()
        
        victims = 0
        officers = 0
        admins = 0
        
        for role, count in role_counts:
            if role == 'victim':
                victims = count
            elif role == 'officer':
                officers = count
            elif role == 'admin':
                admins = count
        
        return jsonify({
            'total': total_users,
            'victims': victims,
            'officers': officers,
            'admins': admins
        }), 200
        
    except Exception as e:
        print(f"Database error in get_user_stats: {e}")
        return jsonify({"error": "Database error"}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/admin/audit_logs', methods=['GET'])
def get_audit_logs():
    if 'user_id' not in session or session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT al.id, al.action, al.details, al.status, al.ip_address, al.timestamp,
                   COALESCE(u.name, 'Unknown User') as user, 
                   u.email as user_email, 
                   COALESCE(u.role, 'Unknown Role') as role
            FROM audit_logs al
            LEFT JOIN users u ON al.user_id = u.id
            ORDER BY al.timestamp DESC
            LIMIT 100
        """)
        
        audit_logs = cursor.fetchall()
        
        # Convert datetime objects to strings for JSON serialization
        for log in audit_logs:
            if log.get('timestamp'):
                log['timestamp'] = log['timestamp'].strftime('%Y-%m-%d %H:%M:%S')
            
            # If user is still 'Unknown User', try to extract from details
            if log.get('user') == 'Unknown User' and log.get('details'):
                details = log['details']
                # Look for common patterns in details that might contain user info
                if 'Login successful for' in details:
                    # Extract role from "Login successful for {role}"
                    import re
                    role_match = re.search(r'Login successful for (\w+)', details)
                    if role_match:
                        log['role'] = role_match.group(1).lower()  # Ensure role is lowercase
        
        return jsonify({'logs': audit_logs}), 200
        
    except Exception as e:
        print(f"Database error in get_audit_logs: {e}")
        return jsonify({"error": "Database error"}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/admin/audit_logs/reset', methods=['DELETE'])
def reset_audit_logs():
    if 'user_id' not in session or session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = connection.cursor()
    try:
        # Delete all audit logs
        cursor.execute("DELETE FROM audit_logs")
        connection.commit()
        
        # Log the reset event
        admin_name = session.get('email', 'Admin')
        log_audit_event(admin_name, "Audit Log Reset", "All audit logs have been cleared", "Success", request.remote_addr)
        
        return jsonify({'message': 'Audit logs reset successfully'}), 200
        
    except Exception as e:
        print(f"Database error in reset_audit_logs: {e}")
        connection.rollback()
        return jsonify({"error": "Database error"}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/victim/report/<int:report_id>/logs', methods=['GET'])
def get_victim_report_logs(report_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = connection.cursor(dictionary=True)
    try:
        # Check if the report belongs to this victim
        cursor.execute("""
            SELECT id FROM reports 
            WHERE id = %s AND victim_id = %s
        """, (report_id, user_id))
        
        report = cursor.fetchone()
        if not report:
            return jsonify({'error': 'Report not found or not authorized'}), 404
        
        # Get logs for this report
        cursor.execute("""
            SELECT cl.*, u.name as officer_name, u.email as officer_email
            FROM case_logs cl
            LEFT JOIN users u ON cl.officer_id = u.id
            WHERE cl.report_id = %s
            ORDER BY cl.log_date DESC
        """, (report_id,))
        
        logs = cursor.fetchall()
        
        # Convert datetime objects to strings for JSON serialization
        for log in logs:
            if log.get('log_date'):
                log['log_date'] = log['log_date'].strftime('%Y-%m-%d %H:%M:%S')
                # Also add a 'date' field for frontend compatibility
                log['date'] = log['log_date'].split(' ')[0]  # Extract just the date part
        
        return jsonify({'logs': logs}), 200
        
    except Exception as e:
        print(f"Database error in get_victim_report_logs: {e}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        cursor.close()
        connection.close()

# New functions to use stored procedures
def call_stored_procedure(procedure_name, params=None):
    """Generic function to call stored procedures"""
    connection = get_db_connection()
    if not connection:
        return None
    
    cursor = connection.cursor(dictionary=True)
    try:
        if params:
            cursor.callproc(procedure_name, params)
        else:
            cursor.callproc(procedure_name)
        
        # Get results from all result sets
        results = []
        for result in cursor.stored_results():
            results.extend(result.fetchall())
        
        return results
    except Exception as e:
        print(f"Error calling stored procedure {procedure_name}: {e}")
        return None
    finally:
        cursor.close()

def get_user_statistics():
    """Get user statistics using stored procedure"""
    results = call_stored_procedure('GetUserStats')
    if results and len(results) > 0:
        return results[0]
    return None

def get_report_statistics():
    """Get report statistics using stored procedure"""
    results = call_stored_procedure('GetReportStats')
    if results and len(results) > 0:
        return results[0]
    return None

def assign_officer_to_report(report_id, officer_id, assignment_note):
    """Assign officer to report using stored procedure"""
    return call_stored_procedure('AssignOfficerToReport', [report_id, officer_id, assignment_note])

def update_report_status(report_id, new_status, officer_id):
    """Update report status using stored procedure"""
    return call_stored_procedure('UpdateReportStatus', [report_id, new_status, officer_id])

def get_officer_workload(officer_id):
    """Get officer workload using stored procedure"""
    results = call_stored_procedure('GetOfficerWorkload', [officer_id])
    if results and len(results) > 0:
        return results[0]
    return None

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 