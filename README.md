# FastAPI + React Full-Stack Template

![Frontend Code Quality](https://github.com/mobitrendz/react-frontend-template/actions/workflows/frontend.yml/badge.svg?branch=develop)
![Test Coverage](https://github.com/mobitrendz/react-frontend-template/actions/workflows/coverage.yml/badge.svg?branch=develop)
![Coverage Percentage](https://img.shields.io/badge/coverage-74.18%25-yellowgreen)

A modern, high-performance full-stack template featuring a React 19 frontend and a FastAPI backend. This template is pre-configured with a premium design system, multi-page routing, advanced administrative controls, and comprehensive unit testing.

## 🧪 Unit Testing & Quality Assurance

The project maintains high standards for reliability with a comprehensive test suite and automated quality gates.

### Test Coverage Status

| Category       | Coverage   |
| :------------- | :--------- |
| **Statements** | **74.18%** |
| **Lines** | **76.13%** |
| **Functions** | **68.24%** |
| **Branches** | **69.68%** |

### Testing Stack

- **Vitest**: A blazing fast unit test framework powered by Vite.
- **React Testing Library**: Light-weight library for testing React components.
- **JSDOM**: A pure-JavaScript implementation of various web standards for use with Node.js.
- **MSW (Mock Service Worker)**: (Optional) Used for intercepting network requests at the service worker level.

### Execution Commands

```bash
npm test              # Run vitest in interactive watch mode
npm run test:run      # Single run (useful for CI)
npm run test:coverage # Generate comprehensive coverage report in /coverage
```

## 🛡️ Automated Quality Checks

To ensure code consistency and prevent regressions, we use a multi-layered validation system.

### Local Git Hooks (Husky & lint-staged)

Before every commit, the following checks are performed automatically:

1.  **ESLint**: Validates code quality and identifies potential bugs.
2.  **Prettier**: Ensures consistent code formatting across the project.
3.  **Type-Check**: Runs `tsc --noEmit` to verify type safety.

### Pre-commit Framework

We integrate the `pre-commit` framework to mirror the backend's validation philosophy. This ensures that only high-quality, valid code enters the repository.

### CI/CD Synchronization

Our **GitHub Actions** workflow (`frontend.yml`) is pinned to the same Node.js version and uses the exact same `pre-commit` hooks. This eliminates the "it works on my machine" problem by enforcing identical rules in local and CI environments.

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

## 🧬 API Client Generation (@hey-api/openapi-ts)

This project uses `@hey-api/openapi-ts` to automatically generate a type-safe SDK from the FastAPI OpenAPI schema.

### Implementation Steps

1.  **Backend Requirement**: Ensure your FastAPI backend is running (defaults to `http://localhost:8000`).
2.  **Configuration**: The generator is configured in `openapi-ts.config.ts` to fetch `openapi.json` and output the SDK to `src/client/`.
3.  **Generation**: Run the following command whenever your backend endpoints or data models change:
    ```bash
    npm run generate-client
    ```
4.  **Usage**: Import the generated SDK or types in your components:

    ```typescript
    import { readTodosApiV1TodosGet } from "./client/sdk.gen";

    const fetchData = async () => {
      const { data, error } = await readTodosApiV1TodosGet();
      if (data) console.log(data);
    };
    ```

## 📂 Project Structure

- `src/client/`: Auto-generated API client and type definitions.
- `src/components/`: Core features (Login, Dashboard, Profile).
- `src/lib/`: Shared utilities (Auth logic, state management).
- `src/test/`: Testing setup and configuration.
- `src/index.css`: Design system and global variables.

---

Built with ❤️ for rapid full-stack development.
