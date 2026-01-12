# 🛡️ Cyber Crime Report Management System

A comprehensive, full-stack web application designed to streamline the process of reporting, investigating, and managing cybercrime cases. The system provides role-based access control for victims, law enforcement officers, and administrators, ensuring secure and efficient case management.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [User Roles](#user-roles)
- [Security Features](#security-features)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

The Cyber Crime Report Management System is a modern web application that facilitates the entire lifecycle of cybercrime case management. From initial report submission by victims to investigation by officers and administrative oversight, the system provides a centralized platform for tracking and managing cybercrime incidents.

### Key Highlights

- **Multi-role Authentication System** - Secure role-based access for Victims, Officers, and Administrators
- **Real-time Case Tracking** - Monitor case status and progress in real-time
- **Evidence Management** - Secure file upload and management system for case evidence
- **Comprehensive Audit Trail** - Complete logging of all system activities
- **Responsive Design** - Modern UI built with Material-UI for optimal user experience
- **RESTful API** - Well-structured backend API for seamless frontend-backend communication

## ✨ Features

### For Victims 👤
- **Crime Reporting**: Submit detailed cybercrime reports with evidence attachments
- **Case Tracking**: View real-time status updates on submitted reports
- **Evidence Upload**: Add additional evidence to existing reports
- **Report History**: Access complete history of all submitted reports
- **Profile Management**: Update personal information and contact details
- **Help & Support**: Access help resources and support information

### For Officers 🚔
- **Case Management**: View and manage assigned cases
- **Investigation Tools**: Access specialized tools for case investigation
- **Evidence Review**: Review and manage evidence associated with cases
- **Case Logs**: Maintain detailed investigation logs and notes
- **Status Updates**: Update case status and priority levels
- **Performance Dashboard**: Monitor workload and case statistics

### For Administrators 👑
- **User Management**: Create, update, and manage user accounts
- **Officer Assignment**: Assign officers to cases based on workload and specialization
- **System Overview**: Comprehensive dashboard with system-wide statistics
- **Report Management**: View and manage all reports across the system
- **Audit Logs**: Monitor all system activities and user actions
- **Analytics**: Access detailed reports and analytics

## 🛠️ Technology Stack

### Frontend
- **React 18.2.0** - Modern UI library for building interactive interfaces
- **React Router DOM 6.3.0** - Client-side routing and navigation
- **Material-UI (MUI) 7.2.0** - Comprehensive component library for modern design
- **Emotion** - CSS-in-JS styling solution
- **React Scripts 5.0.1** - Build tools and development server

### Backend
- **Python 3.x** - Programming language
- **Flask 2.3.3** - Lightweight web framework
- **Flask-CORS 4.0.0** - Cross-Origin Resource Sharing support
- **MySQL Connector Python 8.1.0** - Database connectivity
- **Werkzeug 2.3.7** - WSGI utilities and security features

### Database
- **MySQL** - Relational database management system
- **Stored Procedures** - Database-level business logic
- **Triggers** - Automated audit logging
- **Views** - Optimized data access patterns

## 📁 Project Structure

```
Cyber_Crime_Report-main/
├── backend/
│   ├── app.py                 # Main Flask application and API routes
│   ├── database_schema.sql    # Database schema and initialization
│   ├── init_database.py       # Database initialization script
│   ├── requirements.txt       # Python dependencies
│   └── uploads/               # Evidence file storage directory
│
├── frontend/
│   ├── public/
│   │   └── index.html         # HTML template
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   │   ├── AdminSidebar.js
│   │   │   ├── Navbar.js
│   │   │   ├── Notifications.js
│   │   │   ├── OfficerSidebar.js
│   │   │   ├── ProtectedRoute.js
│   │   │   └── Sidebar.js
│   │   ├── contexts/          # React context providers
│   │   │   └── AuthContext.js
│   │   ├── pages/             # Page components
│   │   │   ├── admin/         # Admin-specific pages
│   │   │   ├── auth/          # Authentication pages
│   │   │   ├── officer/       # Officer-specific pages
│   │   │   └── victim/        # Victim-specific pages
│   │   ├── utils/             # Utility functions
│   │   │   ├── auth.js
│   │   │   └── useSessionStorage.js
│   │   ├── App.js             # Main application component
│   │   └── index.js           # Application entry point
│   ├── package.json           # Node.js dependencies
│   └── package-lock.json      # Dependency lock file
│
└── README.md                  # Project documentation
```

## 📦 Prerequisites

Before installing and running the application, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher) and **npm** (v6.0.0 or higher)
- **Python** (v3.8 or higher)
- **MySQL** (v8.0 or higher)
- **Git** (for cloning the repository)

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Cyber_Crime_Report-main/Cyber_Crime_Report-main
```

### Step 2: Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

### Step 3: Database Setup

1. Start your MySQL server

2. Create the database and initialize schema:
```bash
# Option 1: Using MySQL command line
mysql -u root -p < database_schema.sql

# Option 2: Using Python script
python init_database.py
```

3. Verify database connection by accessing the test endpoint after starting the server

### Step 4: Frontend Setup

1. Navigate to the frontend directory:
```bash
cd ../frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

## ⚙️ Configuration

### Backend Configuration

Edit `backend/app.py` to configure database connection:

```python
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'your_password'
app.config['MYSQL_DB'] = 'cybercrime_db'
```

**Important**: Update the secret key for production:
```python
app.secret_key = 'your_secret_key_here'  # Change this to a secure random string
```

### Frontend Configuration

The frontend is configured to proxy API requests to `http://localhost:5000` (as defined in `package.json`). If your backend runs on a different port, update the proxy setting.

## 🎮 Usage

### Starting the Application

1. **Start the Backend Server**:
```bash
cd backend
python app.py
```
The backend server will start on `http://localhost:5000`

2. **Start the Frontend Development Server**:
```bash
cd frontend
npm start
```
The frontend application will open in your browser at `http://localhost:3000`

### Accessing the Application

1. Navigate to `http://localhost:3000` in your web browser
2. Register a new account by selecting your role (Victim, Officer, or Admin)
3. Log in with your credentials
4. Start using the application based on your role

### Default Routes

- **Login**: `/auth/login`
- **Registration**: `/register`
- **Victim Dashboard**: `/victim_dashboard`
- **Officer Dashboard**: `/officer_dashboard`
- **Admin Dashboard**: `/admin_dashboard`

## 📡 API Documentation

### Authentication Endpoints

- `POST /auth/login` - User login
- `POST /auth/register/victim` - Victim registration
- `POST /auth/register/officer` - Officer registration
- `POST /auth/register/admin` - Admin registration
- `POST /auth/logout` - User logout

### Victim Endpoints

- `POST /victim/report` - Submit a crime report
- `GET /victim/reports` - Get all reports by victim
- `GET /victim/report/<id>` - Get specific report details
- `POST /victim/report/<id>/evidence` - Add evidence to a report
- `PUT /victim/profile` - Update victim profile

### Officer Endpoints

- `GET /officer/cases` - Get all assigned cases
- `GET /officer/case/<id>` - Get case details
- `PUT /officer/case/<id>/status` - Update case status
- `POST /officer/case/<id>/log` - Add investigation log
- `GET /officer/case/<id>/evidence` - Get case evidence
- `POST /officer/case/<id>/evidence` - Upload evidence

### Admin Endpoints

- `GET /admin/dashboard` - Get dashboard statistics
- `GET /admin/reports` - Get all reports
- `POST /admin/assign-officer` - Assign officer to case
- `GET /admin/users` - Get all users
- `POST /admin/users` - Create new user
- `PUT /admin/users/<id>` - Update user
- `DELETE /admin/users/<id>` - Deactivate user
- `GET /admin/audit-logs` - Get audit logs

### Utility Endpoints

- `GET /test_db` - Test database connection
- `GET /uploads/<filename>` - Access uploaded files

## 🗄️ Database Schema

The database consists of the following main tables:

- **users** - User accounts and authentication
- **victims** - Victim-specific information
- **officers** - Officer details and credentials
- **admins** - Administrator information
- **reports** - Crime reports and case information
- **evidence** - Evidence files and metadata
- **case_logs** - Investigation logs and notes
- **audit_logs** - System activity audit trail

The schema includes:
- **Stored Procedures** for complex operations
- **Triggers** for automated audit logging
- **Views** for optimized data access
- **Foreign Key Constraints** for data integrity

## 👥 User Roles

### Victim Role
- Can submit crime reports
- Can upload evidence
- Can view their own reports
- Can update their profile
- Cannot access other users' data

### Officer Role
- Can view assigned cases
- Can update case status
- Can add investigation logs
- Can upload and manage evidence
- Can view case details and history
- Cannot access unassigned cases

### Admin Role
- Full system access
- Can manage all users
- Can assign officers to cases
- Can view all reports and statistics
- Can access audit logs
- Can manage system settings

## 🔒 Security Features

- **Password Hashing**: All passwords are hashed using Werkzeug's security utilities
- **Session Management**: Secure session-based authentication
- **Role-Based Access Control**: Route and API protection based on user roles
- **CORS Configuration**: Properly configured Cross-Origin Resource Sharing
- **File Upload Security**: Secure filename handling and validation
- **SQL Injection Prevention**: Parameterized queries for all database operations
- **Audit Logging**: Comprehensive logging of all system activities
- **Input Validation**: Server-side validation for all user inputs

## 🧪 Testing

To test the database connection:
```bash
curl http://localhost:5000/test_db
```

## 📝 Development Notes

- The application uses Flask sessions for authentication
- File uploads are stored in the `backend/uploads/` directory
- All database operations use parameterized queries
- The frontend uses React Context for state management
- Protected routes are implemented using React Router

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Follow ESLint rules for JavaScript/React code
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes before submitting

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Asir Hamim**
- GitHub: [Asir003](https://github.com/Asir003)
- Email: asirhamim03@gmail.com

## 🙏 Acknowledgments

- Material-UI for the comprehensive component library
- Flask community for excellent documentation
- React team for the powerful framework
- All contributors who have helped improve this project

## 📞 Support

For support, email asirhamim03@gmail.com or create an issue in the repository.

---

**Note**: This is a development version. For production deployment, ensure:
- Strong secret keys are used
- Database credentials are secured
- HTTPS is enabled
- File upload limits are configured
- Regular backups are performed
- Security best practices are followed

---

⭐ If you find this project helpful, please consider giving it a star!
