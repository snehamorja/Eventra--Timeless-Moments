# 🎉 Eventra - Timeless Moments

**Eventra - Timeless Moments** is a comprehensive, full-stack web application designed to simplify the planning and processing of various events, including weddings, concerts, festivals, and sports tournaments. 

It provides an intuitive experience for users to explore event packages, make customized bookings, and manage requests. Simultaneously, it offers a secure, dedicated admin dashboard for administrators to monitor the system, manage data, and process booking approvals.

---

## 🚀 Key Features

### 👤 User Portal
- **Authentication**: Secure user registration, login, and session management using JWT.
- **Event Browsing**: Explore diverse event types (Weddings, Concerts, Festivals, Sports).
- **Customized Bookings**: Submit detailed booking inquiries including budget constraints, guest counts, and dates.
- **Personal Dashboard**: Track the status of historical and active bookings, manage profiles, and download invoices.

### 🛠️ Admin Control Center
- **Secure Access**: Protected dashboard exclusive to SuperAdmin users.
- **Inquiry Management**: Review, approve, or reject user booking requests efficiently.
- **Full Data Control**: Perform CRUD (Create, Read, Update, Delete) operations on event catalogues and platform data.
- **Analytics Overview**: Monitor system-wide activity, revenue streams, and user engagement metrics.

> 🔐 **Note:** The platform enforces strict role-based access control. SuperAdmins are confined to the Admin Dashboard for security purposes, while standard users cannot access administrative domains.

---

## 🧑‍💻 Technology Stack

### Frontend
- **Framework:** React.js
- **Styling:** Vanilla CSS3, modern responsive UI
- **API Communication:** Axios
- **Routing:** React Router DOM

### Backend
- **Framework:** Django
- **API:** Django REST Framework (DRF)
- **Security:** JSON Web Tokens (JWT) for stateless authentication

### Database
- **Development:** SQLite
- **Production-Ready:** PostgreSQL

---

## 📁 System Architecture

```text
Eventra-Project/
│
├── event_system/          # Django backend workspace
│   ├── main/              # Core application logic, models, and views
│   ├── event_system/      # Project configuration and routing
│   ├── manage.py          # Django entry point
│   └── requirements.txt   # Python dependencies
│
├── frontend/              # React.js frontend workspace
│   ├── public/            # Static assets
│   ├── src/               # React components, pages, and API hooks
│   └── package.json       # Node.js dependencies
│
└── README.md
```

---

## ⚙️ Installation & Setup Guide

### 1. Backend Setup (Django)
Open a terminal and navigate to the project root:

```bash
# Navigate to backend directory
cd event_system

# Create and activate a Virtual Environment
python -m venv venv
venv\Scripts\activate   # On Windows
# source venv/bin/activate # On Mac/Linux

# Install required dependencies
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate

# Start the development server
python manage.py runserver
```

### 2. Frontend Setup (React.js)
Open a **new** terminal window and navigate to the project root:

```bash
# Navigate to frontend directory
cd frontend

# Install Node modules
npm install

# Start the React development server
npm run dev
```

> **Usage:** Once both servers are running, you can access the frontend web application in your browser (typically at `http://localhost:5173` or `http://localhost:3000`).

---

## 👩‍💻 Author

**Sneha Morja**
* GitHub: [@snehamorja](https://github.com/snehamorja)