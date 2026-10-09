# 🛡️ Cyber Crime Report Management System

A comprehensive, full-stack web application designed to streamline the process of reporting, investigating, and managing cybercrime cases. The system provides role-based access control for victims, law enforcement officers, and administrators, ensuring secure and efficient case management.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
- [Deploying to Vercel](#deploying-to-vercel)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [User Roles](#user-roles)
- [Security Features](#security-features)
- [Development Notes](#development-notes)
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

| Layer | Tech |
|---|---|
| Frontend | React 18 (Create React App), Material-UI 7, React Router 6 |
| Backend | Node.js 20+, Express 4, TypeScript, Prisma ORM |
| Database | PostgreSQL ([Neon](https://neon.tech)); sessions stored in Postgres via `connect-pg-simple` |
| File storage | [Cloudinary](https://cloudinary.com) (evidence uploads) |
| Hosting | Vercel (frontend and backend as two separate projects) |

## 📁 Project Structure

```
Cyber_Crime_Report/
├── backend/
│   ├── api/index.js          # Vercel serverless entry (wraps the compiled Express app)
│   ├── prisma/               # schema.prisma + migrations
│   ├── src/
│   │   ├── index.ts          # Long-running server entry (local / Render / Railway)
│   │   ├── app.ts            # Express app: security, CORS, sessions, routes
│   │   ├── config/env.ts     # Environment loading + validation
│   │   ├── routes/           # auth, profile, victim, officer, admin, misc
│   │   ├── middleware/       # auth guards, upload (multer)
│   │   └── services/         # audit, cloudinary, reports, evidence
│   ├── vercel.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── utils/api.js      # API_BASE + apiFetch() — every backend call goes through here
│   │   ├── pages/            # admin/, officer/, victim/, auth/
│   │   └── components/
│   ├── vercel.json           # SPA rewrites + security headers
│   └── .env.example
└── legacy/flask-backend/     # Old Flask + MySQL backend (not used)
```

## 🚀 Local Development

**Prerequisites:** Node.js 20+, a Neon (or any PostgreSQL) database, a Cloudinary account.

```bash
# 1. Backend
cd backend
cp .env.example .env          # fill in DATABASE_URL, CLOUDINARY_*, etc.
npm install                   # also runs `prisma generate`
npx prisma migrate deploy     # create tables
npm run dev                   # http://localhost:5000

# 2. Frontend (new terminal)
cd frontend
cp .env.example .env          # REACT_APP_API_URL=http://localhost:5000
npm install
npm start                     # http://localhost:3000
```

Health check: `curl http://localhost:5000/health`

## ☁️ Deploying to Vercel

Create **two Vercel projects** from this repo.

### 1. Backend project
- **Root Directory:** `backend` (Framework preset: *Other*; `vercel.json` sets everything else)
- **Environment variables:**

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Neon **pooled** connection string |
| `SECRET_KEY` | random 32+ chars: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `CORS_ORIGINS` | your frontend URL, e.g. `https://your-app.vercel.app` (comma-separate several, no trailing slash) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | from Cloudinary |
| `ADMIN_SIGNUP_CODE` | *(optional)* secret code required to register an admin; leave unset to disable admin sign-up |
| `MAX_UPLOAD_MB` | *(optional)* defaults to 4 on Vercel (platform body limit is 4.5 MB) |

- Run migrations against production once (and after every schema change):
  ```bash
  cd backend && DATABASE_URL="<neon-url>" npx prisma migrate deploy
  ```
- Verify: `https://<backend>.vercel.app/health` → `{"status":"ok"}`

### 2. Frontend project
- **Root Directory:** `frontend` (preset: *Create React App*)
- **Environment variable:** `REACT_APP_API_URL=https://<backend>.vercel.app`
  (baked in at build time — redeploy after changing it)

### 3. Wire them together
Put the frontend's final URL into the backend's `CORS_ORIGINS` and redeploy the backend.
Login uses a cross-site cookie (`SameSite=None; Secure`), so both must be served over HTTPS.

> **Alternative:** the backend can also run as a normal server (Render, Railway, Fly.io):
> build `npm install && npm run build`, start `npm start`.

## 🎮 Usage

### Default Routes

- `/` - Role selection page
- `/login` - Login page
- `/victim/dashboard` - Victim dashboard
- `/officer/dashboard` - Officer dashboard
- `/admin/dashboard` - Admin dashboard


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

- `GET /health` - Liveness check
- `GET /test_db` - Database connectivity check (development only)

## 🗄️ Database Schema

Defined in [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma), managed with Prisma migrations:

- **users** - User accounts and authentication
- **victims** / **officers** / **admins** - Role-specific profile data
- **reports** - Crime reports and case information
- **evidence** - Evidence metadata (files live in Cloudinary)
- **case_logs** - Investigation logs and notes
- **audit_logs** - System activity audit trail
- **session** - Login sessions (created automatically)


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

- **Password hashing** with PBKDF2-SHA256 (600k iterations; compatible with legacy Werkzeug hashes)
- **Cookie sessions** stored in Postgres — `HttpOnly`, `Secure`, `SameSite=None` in production; session ID regenerated on login
- **Role-based access control** on every API route
- **Strict CORS** allow-list via `CORS_ORIGINS`
- **Security headers** via Helmet (backend) and `vercel.json` (frontend)
- **Rate limiting** on login and sign-up (20 requests / 15 min per IP)
- **Admin sign-up gated** by `ADMIN_SIGNUP_CODE`
- **Upload size limits** and in-memory streaming to Cloudinary (no local disk)
- **No internal error details** leaked in production responses
- **Audit logging** of significant actions

## 📝 Development Notes

- Sessions live in the `session` table in Postgres, so they survive restarts and work on serverless
- All frontend API calls go through `apiFetch()` in `frontend/src/utils/api.js`
- The frontend uses React Context for auth state; protected routes use React Router


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
- Express, Prisma and Neon communities for excellent documentation
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
