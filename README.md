# React 19 + FastAPI Frontend Template

![Frontend Code Quality](https://github.com/mobitrendz/react-frontend-template/actions/workflows/frontend.yml/badge.svg?branch=develop)
![Test Coverage](https://github.com/mobitrendz/react-frontend-template/actions/workflows/coverage.yml/badge.svg?branch=develop)
![Coverage Percentage](https://img.shields.io/badge/coverage-91.56%25-brightgreen)

A modern, high-performance full-stack template featuring a React 19 frontend and a FastAPI backend. Optimized for **2026 industry standards**, this template is pre-configured with a premium design system, TanStack Query orchestration, and comprehensive unit testing.

### 🔗 Related Repositories
- **Backend Template**: [FastAPI Backend Template](https://github.com/mobitrendz/fastapi-backend-template)

## 🛠 Tech Stack

- **Frontend**: React 19 (TypeScript)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router 7
- **UI Components**: shadcn/ui + Lucide Icons
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS 4
- **Validation**: Zod
- **Testing**: Vitest + RTL

## 🏗️ 2026 Modern Standards

This template goes beyond basic boilerplate by implementing high-performance patterns:

- **🔄 Server State Orchestration**: Powered by **TanStack Query** for automatic caching, background revalidation, and built-in loading/error management.
- **🛡️ Fail-Safe Environment**: **Zod-validated** configuration ensures the app never starts with missing or invalid environment variables.
- **🎨 Premium UI Framework**: Built on **shadcn/ui** and **Tailwind CSS 4**, featuring glassmorphism, adaptive dark mode, and Lucide-powered iconography.
- **🧬 Contract-First SDK**: Type-safe API client generated directly from your FastAPI OpenAPI schema.

## 🚀 Key Features

### 💻 Frontend & User Experience
- **🔒 Secure Authentication**: Robust login/signup flow with JWT persistence and public registration support.
- **🛣 Multi-Page Architecture**: Seamless navigation between Dashboard and Profile using React Router 7.
- **✅ Advanced Task Management**: Inline editing, priority filtering, and real-time search for tasks.
- **👤 Account Lifecycle**: Secure account deletion with password verification and automated task cleanup.
- **🌓 Adaptive Design**: Premium dark-mode design system with modern micro-animations.

### 🛠 Administrative Controls
- **👥 User Management**: Powerful admin dashboard to manage all system users.
- **⚡ Status Control**: Instant activation/deactivation of user accounts with visual feedback.
- **➕ Admin Creation**: Create new administrative accounts directly from the control center.
- **🔍 Search & Filter**: Sophisticated user searching and role-based filtering.

## 🧪 Unit Testing & Quality Assurance

The project maintains high standards for reliability with a comprehensive test suite and automated quality gates.

### Test Coverage Status

| Category       | Coverage   |
| :------------- | :--------- |
| **Statements** | **91.56%** |
| **Lines** | **93.07%** |
| **Functions** | **88.58%** |
| **Branches** | **84.77%** |

### Testing Stack

- **Vitest**: A blazing fast unit test framework powered by Vite.
- **React Testing Library**: The industry standard for testing component behavior.
- **JSDOM**: Modern browser environment simulation.

```bash
npm test              # Run vitest in interactive watch mode
npm run test:run      # Single run (useful for CI)
npm run test:coverage # Generate comprehensive coverage report in /coverage
```

## 🛡️ Automated Quality Checks

### CI/CD API Guardrails
Our **GitHub Actions** workflow (`frontend.yml`) includes an automated **API Sync Check**. If the backend schema changes without a corresponding frontend SDK update (`npm run generate-client`), the CI pipeline will fail, preventing broken contracts from reaching production.

### Local Git Hooks
Before every commit, **Husky** and **lint-staged** run ESLint, Prettier, and TypeScript type-checks to ensure only high-quality code enters the repository.

## 🏁 Getting Started

### Prerequisites

1.  **Node.js**: v22.14.0+ recommended.
2.  **Backend**: FastAPI backend running (default: `http://localhost:8000`).

### Installation

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Configure Environment**:
    ```bash
    cp .env.example .env
    ```
3.  **Generate the API Client**:
    ```bash
    npm run generate-client
    ```
4.  **Start the development server**:
    ```bash
    npm run dev
    ```

## 🧬 API Integration (@hey-api/openapi-ts)

This project uses `@hey-api/openapi-ts` to generate a type-safe SDK. We've enhanced this with **TanStack Query** support for a declarative data-fetching experience.

### Usage Example

```typescript
import { useQuery } from "@tanstack/react-query";
import { readTodosApiV1TodosGet } from "./client/sdk.gen";

const { data, isLoading, error } = useQuery({
  queryKey: ['todos'],
  queryFn: () => readTodosApiV1TodosGet(),
});
```


## 📂 Project Structure

- `src/client/`: Auto-generated API client and TanStack Query hooks.
- `src/components/ui/`: shadcn/ui primitives (Button, Input, Card, etc.).
- `src/lib/`: Shared utilities (Auth logic, error handling, env validation).
- `src/env.ts`: Zod-validated environment schema.
- `src/index.css`: Tailwind 4 design system.

---

Built with ❤️ for rapid full-stack development. Refer to [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## 📋 Release Notes
See the full [Release Notes](./RELEASE_NOTES.md) for a detailed history of changes.

## ⚖️ License
This project is licensed under the MIT License.

## 💡 Inspiration
This project is heavily inspired by the official [full-stack-fastapi-template](https://github.com/fastapi/full-stack-fastapi-template) in the FastAPI repository. It builds upon those foundational concepts, incorporating modern toolchain upgrades, enhanced observability, and AI-optimized developer workflows.
