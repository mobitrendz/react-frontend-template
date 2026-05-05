# FastAPI + React Frontend Template

A modern, high-performance full-stack template featuring a React 19 frontend and a FastAPI backend. This template is pre-configured with a custom design system, authentication, and comprehensive dashboard features.

## 🚀 Features

- **🔒 Authentication**: Secure login/logout flow with persistent JWT token management.
- **📊 Unified Dashboard**: A single-page, responsive dashboard for managing your account and data.
- **✅ Task Management**: Full CRUD functionality (Create, Read, Update, Delete) for managing ToDo lists.
- **🛠 Admin Management**: Advanced user management panel for admins (List, Create, Edit, Delete users).
- **🌓 Dark Mode Support**: Custom-built design system using CSS variables that respects system preferences.
- **🧬 Auto-generated SDK**: Type-safe API client generated automatically from the FastAPI OpenAPI schema.
- **🎨 Modern Styling**: Built with Tailwind CSS 4 for a fast and flexible UI.

## 🛠 Tech Stack

- **Frontend**: React 19 (TypeScript)
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS 4
- **API Client**: @hey-api/openapi-ts (Fetch-based)
- **Icons**: Custom SVG system

## ⚙️ Setup & Installation

### Prerequisites

1.  **Node.js**: Ensure you have Node.js (v18+) installed.
2.  **Backend**: The FastAPI backend should be running at `http://127.0.0.1:8000`.

### Getting Started

1.  **Clone the repository** (or copy this template).
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Generate the API Client** (Run this if the backend schema changes):
    ```bash
    npm run generate-client
    ```
4.  **Start the development server**:
    ```bash
    npm run dev
    ```

## 📂 Project Structure

- `src/client/`: Auto-generated API client and types.
- `src/components/`: Reusable UI components (Dashboard, Login, etc.).
- `src/lib/`: Core utilities like authentication logic.
- `src/index.css`: Global styles and custom design system variables.
- `src/main.tsx`: Application entry point.

## 🔑 Default Credentials

If you are using the default backend configuration:
- **Username**: `sreeraj.dev@icloud.com`
- **Password**: `admin123`

---
Built with ❤️ using FastAPI and React.
