# Hostel Management System

[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=flat-square&logo=java)](https://www.java.com)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3-6DB33F?style=flat-square&logo=spring-boot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![MySQL](https://img.shields.io/badge/MySQL-8.4-4479A1?style=flat-square&logo=mysql)](https://www.mysql.com)
[![Redis](https://img.shields.io/badge/Redis-caching-DC382D?style=flat-square&logo=redis)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-containerized-2496ED?style=flat-square&logo=docker)](https://www.docker.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

A comprehensive **Hostel Management System** designed to streamline accommodation allocation, booking lifecycle management, and fee tracking for university students and administrators.

---

## 🎯 Features

- **Room Allocation**: Automated and manual room assignment for students
- **Booking Management**: Complete lifecycle from booking to checkout
- **Fee Tracking**: Track and manage hostel fees and payments
- **Authentication**: Secure JWT-based authentication
- **Real-time Notifications**: WebSocket-powered live updates
- **Caching**: Redis caching for performance optimization
- **Admin Dashboard**: Comprehensive analytics and management tools
- **Dark Mode**: Full theme support with light/dark modes
- **PDF Generation**: Allocation documents and receipts

---

## 📋 Project Structure

```
hostel-management-system/
├── backend/                    # Spring Boot 3 + Java 21 API
│   └── app/                   # Main application
│       ├── src/               # Source code
│       ├── scripts/           # Database migration scripts
│       ├── pom.xml           # Maven configuration
│       └── Dockerfile        # Container image
├── frontend/                  # React + Vite frontend
│   ├── src/                  # React components & pages
│   ├── public/               # Static assets
│   ├── vite.config.js       # Vite configuration
│   └── Dockerfile           # Container image
├── plans/                    # Project documentation
└── package.json             # Root dependencies
```

---

## 🚀 Quick Start

### Prerequisites

- **Java 21** or higher
- **Node.js 18** or higher
- **MySQL 8.4** or higher (or Docker)
- **Docker & Docker Compose** (optional, for containerized setup)

### Backend Setup

Navigate to the backend directory and follow the setup guide:

```bash
cd backend/app
```

**Option A: Using Docker Compose (Recommended)**

```powershell
docker compose up -d
```

**Option B: Using Existing MySQL**

1. Create the database:
   ```bash
   mysql < scripts/create-database.sql
   ```

2. Run the backend:
   ```powershell
   .\run-with-mysql.ps1
   ```

Backend runs on `http://localhost:8081`

👉 [Backend README](backend/app/README.md) for detailed instructions

### Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

👉 [Frontend README](frontend/README.md) for detailed instructions

---

## 📚 Documentation

### Core Guides

- **[Configuration Guide](backend/CONFIGURATION_GUIDE.md)** - Backend setup & environment variables
- **[Implementation Summary](backend/IMPLEMENTATION_SUMMARY.md)** - Architecture & design decisions
- **[Quick Start Testing](QUICK_START_TESTING.md)** - Testing procedures

### Feature Guides

- **[Redis Caching Guide](REDIS_CACHING_GUIDE.md)** - Performance optimization with Redis
- **[WebSocket Notifications](WEBSOCKET_NOTIFICATIONS_GUIDE.md)** - Real-time updates setup
- **[PDF Allocation](PDF_ALLOCATION_IMPLEMENTATION.md)** - Document generation
- **[Dashboard Analytics](DASHBOARD_ANALYTICS_GUIDE.md)** - Admin analytics features

### Deployment & Operations

- **[Redis Deployment Guide](REDIS_DEPLOYMENT_GUIDE.md)** - Production Redis setup
- **[Redis Deployment Checklist](REDIS_DEPLOYMENT_CHECKLIST.md)** - Pre-deployment verification
- **[Redis Troubleshooting](REDIS_TROUBLESHOOTING_GUIDE.md)** - Common issues & fixes

### Security

- **[Password Reset Security](backend/PASSWORD_RESET_SECURITY_IMPROVEMENTS.md)** - Security improvements

### Design & UI

- **[Design System](frontend/docs/DESIGN_SYSTEM.md)** - Component & styling guidelines
- **[Admin UI Enhancements](frontend/docs/ADMIN_UI_ENHANCEMENTS.md)** - Admin interface details
- **[Logo Setup](LOGO_SETUP.md)** - Branding guidelines

---

## 🏗️ Tech Stack

### Backend
- **Framework**: Spring Boot 3
- **Language**: Java 21
- **Database**: MySQL 8.4
- **ORM**: JPA/Hibernate
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: WebSocket
- **Caching**: Redis
- **Build**: Maven

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **UI Components**: Custom component library
- **Package Manager**: npm

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Database**: MySQL in containers

---

## 🔧 Development Workflow

### Running Both Services

1. **Start the backend** (MySQL + Spring Boot):
   ```bash
   cd backend/app
   docker compose up -d
   .\run-backend.ps1
   ```

2. **Start the frontend** (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application**:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:8081`
   - MySQL: `localhost:3306`

### Environment Configuration

**Backend** (`.env` or environment variables):
```env
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/hostel_db
SPRING_DATASOURCE_USERNAME=hostel_user
SPRING_DATASOURCE_PASSWORD=<password>
```

**Frontend** (`frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:8081
```

---

## 🐳 Docker Deployment

### Using Docker Compose

From the root directory:

```bash
docker compose up -d
```

This starts:
- MySQL database
- Spring Boot backend
- React frontend (with Nginx)

---

## 📊 Key Features Explained

### Room Allocation
Automated algorithm for fair and efficient room assignments based on preferences and availability.

### Fee Management
Track hostel fees, payment status, and generate receipts and allocation documents.

### Real-time Notifications
WebSocket-powered notifications keep users updated on bookings, allocations, and announcements.

### Admin Dashboard
Comprehensive analytics, reporting, and management tools for hostel administrators.

### Theme Support
Full dark mode support with customizable color schemes (green primary, gold accent).

---

## 🤝 Contributing

Contributions are welcome! Please ensure:

1. Code follows the existing style
2. All tests pass
3. Documentation is updated
4. Commit messages are clear

---

## 📞 Support

For issues, questions, or suggestions:

1. Check the [documentation](#-documentation)
2. Review the troubleshooting guides
3. Check existing issues on the repository

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📝 Project Status

**Current Version**: 1.0.0

- ✅ Core allocation system
- ✅ User authentication & authorization
- ✅ Fee management
- ✅ Admin dashboard
- ✅ Real-time notifications
- ✅ Redis caching
- ✅ Docker support
- 🚀 Continuous improvements

---

## 🔗 Quick Links

| Link | Description |
|------|-------------|
| [Backend README](backend/app/README.md) | Backend setup & API documentation |
| [Frontend README](frontend/README.md) | Frontend setup & component guide |
| [Redis Quick Reference](REDIS_QUICK_REFERENCE.md) | Redis commands & tips |
| [Design System](frontend/docs/DESIGN_SYSTEM.md) | UI components & styling |
| [Configuration Guide](backend/CONFIGURATION_GUIDE.md) | Environment setup |

---

**Made with ❤️ for University Hostel Management**
