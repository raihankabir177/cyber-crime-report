-- Database Schema for CyberCrime Reporting System

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS cybercrime_db;
USE cybercrime_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('victim', 'officer', 'admin') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Victims table
CREATE TABLE IF NOT EXISTS victims (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    nid VARCHAR(50),
    address TEXT,
    emergency_contact VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Officers table
CREATE TABLE IF NOT EXISTS officers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    badge_number VARCHAR(20) UNIQUE,
    department VARCHAR(100),
    specialization VARCHAR(100),
    rank_name VARCHAR(50) DEFAULT 'Officer',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    admin_code VARCHAR(50) UNIQUE,
    position VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    victim_id INT NOT NULL,
    crime_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    date_occurred DATE NOT NULL,
    date_submitted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    location VARCHAR(255),
    status ENUM('Open', 'Under Investigation', 'Closed', 'Rejected') DEFAULT 'Open',
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    assigned_officer_id INT,
    assignment_date TIMESTAMP NULL,
    assignment_note TEXT,
    FOREIGN KEY (victim_id) REFERENCES users(id),
    FOREIGN KEY (assigned_officer_id) REFERENCES users(id)
);

-- Evidence table
CREATE TABLE IF NOT EXISTS evidence (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    file_path TEXT,
    file_size INT,
    content_type VARCHAR(100),
    uploaded_by INT NOT NULL,
    description TEXT,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Case logs table
CREATE TABLE IF NOT EXISTS case_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    officer_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    notes TEXT,
    log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50),
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (officer_id) REFERENCES users(id)
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    status VARCHAR(50) DEFAULT 'Success',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ==========================================
-- STORED PROCEDURES
-- ==========================================

DELIMITER //

-- Procedure to get user statistics
CREATE PROCEDURE GetUserStats()
BEGIN
    SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'victim' THEN 1 ELSE 0 END) as victims,
        SUM(CASE WHEN role = 'officer' THEN 1 ELSE 0 END) as officers,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins
    FROM users 
    WHERE is_active = TRUE;
END //

-- Procedure to get report statistics
CREATE PROCEDURE GetReportStats()
BEGIN
    SELECT 
        COUNT(*) as total_reports,
        SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END) as open_reports,
        SUM(CASE WHEN status = 'Under Investigation' THEN 1 ELSE 0 END) as investigating_reports,
        SUM(CASE WHEN status = 'Closed' THEN 1 ELSE 0 END) as closed_reports,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected_reports
    FROM reports;
END //

-- Procedure to assign officer to report
CREATE PROCEDURE AssignOfficerToReport(
    IN p_report_id INT,
    IN p_officer_id INT,
    IN p_assignment_note TEXT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Update report assignment
    UPDATE reports 
    SET assigned_officer_id = p_officer_id,
        assignment_date = NOW(),
        assignment_note = p_assignment_note,
        status = 'Under Investigation'
    WHERE id = p_report_id;
    
    -- Log the assignment
    INSERT INTO audit_logs (user_id, action, details, status)
    VALUES (p_officer_id, 'Officer Assigned', 
            CONCAT('Officer assigned to report #', p_report_id), 'Success');
    
    COMMIT;
END //

-- Procedure to update report status
CREATE PROCEDURE UpdateReportStatus(
    IN p_report_id INT,
    IN p_new_status VARCHAR(50),
    IN p_officer_id INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Update report status
    UPDATE reports 
    SET status = p_new_status
    WHERE id = p_report_id AND assigned_officer_id = p_officer_id;
    
    -- Log the status change
    INSERT INTO audit_logs (user_id, action, details, status)
    VALUES (p_officer_id, 'Status Updated', 
            CONCAT('Report #', p_report_id, ' status changed to ', p_new_status), 'Success');
    
    COMMIT;
END //

-- Procedure to get officer workload
CREATE PROCEDURE GetOfficerWorkload(IN p_officer_id INT)
BEGIN
    SELECT 
        o.id,
        u.name as officer_name,
        COUNT(r.id) as total_cases,
        SUM(CASE WHEN r.status = 'Open' THEN 1 ELSE 0 END) as open_cases,
        SUM(CASE WHEN r.status = 'Under Investigation' THEN 1 ELSE 0 END) as investigating_cases,
        SUM(CASE WHEN r.status = 'Closed' THEN 1 ELSE 0 END) as closed_cases
    FROM users u
    JOIN officers o ON u.id = o.user_id
    LEFT JOIN reports r ON u.id = r.assigned_officer_id
    WHERE u.id = p_officer_id AND u.role = 'officer'
    GROUP BY o.id, u.name;
END //

DELIMITER ;

-- ==========================================
-- TRIGGERS
-- ==========================================

DELIMITER //

-- Trigger to log user creation
CREATE TRIGGER after_user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, details, status)
    VALUES (NEW.id, 'User Created', 
            CONCAT('New ', NEW.role, ' account created: ', NEW.email), 'Success');
END //

-- Trigger to log report submission
CREATE TRIGGER after_report_insert
AFTER INSERT ON reports
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, details, status)
    VALUES (NEW.victim_id, 'Report Submitted', 
            CONCAT('Crime report #', NEW.id, ' submitted'), 'Success');
END //

-- Trigger to log evidence upload
CREATE TRIGGER after_evidence_insert
AFTER INSERT ON evidence
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, details, status)
    VALUES (NEW.uploaded_by, 'Evidence Uploaded', 
            CONCAT('Evidence uploaded for report #', NEW.report_id), 'Success');
END //

-- Trigger to update report status when evidence is added
CREATE TRIGGER after_evidence_insert_status
AFTER INSERT ON evidence
FOR EACH ROW
BEGIN
    UPDATE reports 
    SET status = 'Under Investigation'
    WHERE id = NEW.report_id AND status = 'Open';
END //

-- Trigger to log case log entries
CREATE TRIGGER after_case_log_insert
AFTER INSERT ON case_logs
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, details, status)
    VALUES (NEW.officer_id, 'Case Log Added', 
            CONCAT('Log entry added for report #', NEW.report_id, ': ', NEW.action), 'Success');
END //

DELIMITER ;

-- ==========================================
-- VIEWS
-- ==========================================

-- View for active cases with officer information
CREATE VIEW active_cases_view AS
SELECT 
    r.id,
    r.crime_type,
    r.description,
    r.date_occurred,
    r.date_submitted,
    r.location,
    r.status,
    r.priority,
    v.name as victim_name,
    v.phone as victim_phone,
    o.name as officer_name,
    o.email as officer_email,
    off.badge_number,
    off.specialization
FROM reports r
JOIN users v ON r.victim_id = v.id
LEFT JOIN users o ON r.assigned_officer_id = o.id
LEFT JOIN officers off ON o.id = off.user_id
WHERE r.status IN ('Open', 'Under Investigation')
ORDER BY r.priority DESC, r.date_submitted DESC;

-- View for officer performance
CREATE VIEW officer_performance_view AS
SELECT 
    u.id,
    u.name as officer_name,
    u.email,
    off.badge_number,
    off.department,
    off.specialization,
    COUNT(r.id) as total_cases,
    SUM(CASE WHEN r.status = 'Open' THEN 1 ELSE 0 END) as open_cases,
    SUM(CASE WHEN r.status = 'Under Investigation' THEN 1 ELSE 0 END) as investigating_cases,
    SUM(CASE WHEN r.status = 'Closed' THEN 1 ELSE 0 END) as closed_cases,
    AVG(DATEDIFF(COALESCE(r.assignment_date, NOW()), r.date_submitted)) as avg_response_time
FROM users u
JOIN officers off ON u.id = off.user_id
LEFT JOIN reports r ON u.id = r.assigned_officer_id
WHERE u.role = 'officer' AND u.is_active = TRUE
GROUP BY u.id, u.name, u.email, off.badge_number, off.department, off.specialization;

-- View for evidence summary
CREATE VIEW evidence_summary_view AS
SELECT 
    r.id as report_id,
    r.crime_type,
    r.status as report_status,
    COUNT(e.id) as evidence_count,
    SUM(e.file_size) as total_size,
    MAX(e.upload_date) as latest_evidence_date
FROM reports r
LEFT JOIN evidence e ON r.id = e.report_id
GROUP BY r.id, r.crime_type, r.status;

-- View for audit trail
CREATE VIEW audit_trail_view AS
SELECT 
    al.id,
    al.timestamp,
    al.action,
    al.details,
    al.status,
    al.ip_address,
    u.name as user_name,
    u.email as user_email,
    u.role as user_role
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
ORDER BY al.timestamp DESC;

-- View for case timeline
CREATE VIEW case_timeline_view AS
SELECT 
    r.id as report_id,
    r.crime_type,
    r.date_submitted,
    r.assignment_date,
    cl.log_date,
    cl.action,
    cl.notes,
    u.name as officer_name
FROM reports r
LEFT JOIN case_logs cl ON r.id = cl.report_id
LEFT JOIN users u ON cl.officer_id = u.id
ORDER BY r.id, cl.log_date DESC; 