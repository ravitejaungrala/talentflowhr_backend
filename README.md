
## Backend README.md

```markdown
# TalentFlow HR - Backend API

![Node.js](https://img.shields.io/badge/Node.js-18.0-green)
![Express](https://img.shields.io/badge/Express-4.18.2-lightgrey)
![MongoDB](https://img.shields.io/badge/MongoDB-7.5.0-green)
![JWT](https://img.shields.io/badge/Auth-Session-brown)
![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Live API

**Base URL:** [https://talentflowhr-backend.onrender.com](https://talentflowhr-backend.onrender.com)

**Health Check:** [https://talentflowhr-backend.onrender.com/health](https://talentflowhr-backend.onrender.com/health)

## 📖 Overview

TalentFlow HR Backend is a robust RESTful API built with Node.js and Express, providing comprehensive HR management capabilities. It features secure authentication, role-based access control, and integrates with MongoDB Atlas for scalable data storage.

## 🏗 Architecture

### 🔧 Technology Stack

- **Runtime:** Node.js 18.0+
- **Framework:** Express.js 4.18.2
- **Database:** MongoDB Atlas with Mongoose ODM
- **Authentication:** Session-based with express-session
- **Security:** CORS, input validation, bcryptjs hashing
- **Deployment:** Render cloud platform

### 📊 Database Design
MongoDB Collections:
├── users (Employees, HR, Admins)
├── feedback (Peer feedback system)
├── leaves (Leave requests and approvals)
├── skills (Employee competencies)
├── recognition (Employee recognition)
├── training (Courses and enrollments)
├── goals (Objectives and key results)
├── surveys (Employee feedback surveys)
├── announcements (Company communications)
└── documents (File management)

## 🎯 Key Features & Advantages

### 🔐 Secure Authentication System
- **Session-based Auth** - Secure cookie-based sessions with configurable expiry
- **Role-Based Access Control** - Three-tier permission system (Admin, HR, Employee)
- **Password Security** - bcryptjs hashing with salt rounds
- **CORS Protection** - Configurable origin whitelisting

### 📈 Scalable Architecture
- **RESTful API Design** - Standard HTTP methods and status codes
- **MongoDB Atlas** - Cloud database with automatic scaling
- **Modular Route Structure** - Organized by feature domains
- **Middleware Pipeline** - Request processing and validation

### 🛡 Enterprise-Grade Security
- **Input Sanitization** - Protection against NoSQL injection
- **XSS Prevention** - Data validation and escaping
- **Session Security** - Secure flags in production
- **Environment Configuration** - Secure credential management

### 🔄 Real-time Capabilities
- **WebSocket Ready** - Architecture prepared for real-time features
- **Live Data Updates** - Efficient data synchronization
- **Webhook Support** - Integration capabilities with other systems

## 🚀 API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | User registration | Public |
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/auth/logout` | User logout | Authenticated |
| GET | `/api/auth/me` | Get current user | Authenticated |

### Employee Management
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/employees` | Get all employees | Admin/HR |
| GET | `/api/employees/:id` | Get employee by ID | Owner/Admin/HR |
| PUT | `/api/employees/:id` | Update employee | Owner/Admin/HR |
| DELETE | `/api/employees/:id` | Delete employee | Admin |

### HR Modules
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET/POST | `/api/feedback` | Feedback management | Varies |
| GET/POST | `/api/leaves` | Leave management | Varies |
| GET/POST | `/api/skills` | Skills inventory | Varies |
| GET/POST | `/api/recognition` | Employee recognition | Varies |
| GET/POST | `/api/training` | Training programs | Varies |
| GET/POST | `/api/goals` | Goal tracking | Varies |
| GET/POST | `/api/surveys` | Employee surveys | Varies |
| GET/POST | `/api/announcements` | Company announcements | Varies |
| GET/POST | `/api/documents` | Document management | Varies |

## 💡 Why This Backend Architecture?

### 🎯 Performance Advantages
- **Non-blocking I/O** - Node.js event loop for high concurrency
- **Database Optimization** - MongoDB indexing and aggregation pipelines
- **Response Caching** - Ready for Redis integration
- **Connection Pooling** - Efficient database connections

### 🔧 Development Advantages
- **TypeScript Ready** - Easy migration to TypeScript
- **Comprehensive Error Handling** - Structured error responses
- **API Versioning** - Prepared for future API versions
- **Logging System** - Morgan logging with rotation

### 📊 Scalability Features
- **Horizontal Scaling** - Stateless architecture for multiple instances
- **Microservices Ready** - Modular design for service decomposition
- **Load Balancing** - Compatible with reverse proxies
- **Database Sharding** - MongoDB Atlas sharding support

## 🛠 Installation & Setup

### Prerequisites
- Node.js 18.0 or higher
- MongoDB Atlas account
- npm or yarn

### Local Development

1. **Clone repository**
   ```bash
   git clone https://github.com/yourusername/talentflow-hr.git
   cd talentflow-hr/backend

2. ***Install dependencies**
npm install
3. ***Start development server**
npm run dev

4. ***Build Configuration**
Build Command: npm install

Start Command: node server.js

Health Check Path: /health

5. ***🤝 Contributing**
Fork the repository

Create feature branch (git checkout -b feature/AmazingFeature)

Commit changes (git commit -m 'Add AmazingFeature')

Push to branch (git push origin feature/AmazingFeature)

Open Pull Request

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

👥 Team
Raviteja Ungrala - Full Stack Developer

Neuzen AI - Project Assessment

🔗 Links
Frontend Repository: https://github.com/ravitejaungrala/talenthr_front

Live Application: https://talenthr-front.onrender.com/
