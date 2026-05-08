# FastAPI + React Full-Stack Template

![Docker Validation](https://github.com/mobitrendz/react-frontend-template/actions/workflows/docker.yml/badge.svg?branch=develop)
![Frontend Code Quality](https://github.com/mobitrendz/react-frontend-template/actions/workflows/frontend.yml/badge.svg?branch=develop)
![Coverage Percentage](https://img.shields.io/badge/coverage-88.72%25-green)

A modern, high-performance full-stack template featuring a React 19 frontend and a FastAPI backend. This template is pre-configured with a premium design system, multi-page routing, advanced administrative controls, and comprehensive unit testing.

## 🧪 Unit Testing & Coverage

The project maintains high standards for reliability with a comprehensive test suite.

| Category | Coverage |
| :--- | :--- |
| **Statements** | **88.72%** |
| **Lines** | **90.56%** |
| **Functions** | **87.65%** |
| **Branches** | **75.22%** |

### Execution Commands
```bash
npm test          # Watch mode
npm test -- --run # Single run
npm run test:coverage # Generate coverage report
```

## 🚀 Key Features

### 💻 Frontend & User Experience
- **🔒 Secure Authentication**: Robust login/signup flow with JWT persistence and public registration support.
- **🛣 Multi-Page Architecture**: Seamless navigation between Dashboard and Profile using React Router.
- **✅ Advanced Task Management**: Inline editing, priority filtering, and real-time search for tasks.
- **👤 Account Lifecycle**: Secure account deletion with password verification and automated task cleanup (Cascading Delete).
- **🌓 Adaptive Design**: Premium design system with dark mode support, glassmorphism, and micro-animations.

### 🛠 Administrative Controls
- **👥 User Management**: Powerful admin dashboard to manage all system users.
- **⚡ Status Control**: Instant activation/deactivation of user accounts with visual feedback.
- **➕ Admin Creation**: Create new administrative accounts directly from the control center.
- **🔍 Search & Filter**: Sophisticated user searching and role-based filtering.

### ⚙️ Developer Experience
- **🧪 Unit Testing**: Pre-configured testing environment with **Vitest** and **React Testing Library**.
- **🧬 Type-Safe SDK**: Automatically generated API client from FastAPI OpenAPI schema.
- **🌐 Network Ready**: Dynamically configured base URL for easy access from mobile devices or other computers on the local network.
- **🎨 Tailwind CSS 4**: Leveraging the latest CSS-in-JS features for lightning-fast styling.

## 🛠 Tech Stack

- **Frontend**: React 19 (TypeScript)
- **Routing**: React Router 7
- **Testing**: Vitest + JSDOM
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS 4 (Vanilla CSS variables)
- **API Client**: @hey-api/openapi-ts

## 🏁 Getting Started

### Prerequisites
1.  **Node.js**: v18+ recommended.
2.  **Backend**: FastAPI backend running (default: `http://localhost:8000`).

### Installation
1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Generate the API Client** (Sync with backend schema):
    ```bash
    npm run generate-client
    ```
3.  **Start the development server**:
    ```bash
    npm run dev
    ```

### Docker Usage

You can also run the application using Docker:

1.  **Build the image**:
    ```bash
    docker build -t react-frontend .
    ```
2.  **Run the container**:
    ```bash
    docker run -p 8080:80 react-frontend
    ```
    The application will be available at `http://localhost:8080`.

Alternatively, use **Docker Compose**:
```bash
docker-compose up -d
```

## 📂 Project Structure
- `src/client/`: Auto-generated API client and type definitions.
- `src/components/`: Core features (Login, Dashboard, Profile).
- `src/lib/`: Shared utilities (Auth logic, state management).
- `src/test/`: Testing setup and configuration.
- `src/index.css`: Design system and global variables.

---
Built with ❤️ for rapid full-stack development.
