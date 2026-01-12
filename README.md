# IndoCafe Restaurant Management System

## Project Structure

This project is organized as a monorepo:

- **client/**: Frontend application (React, Vite, Tailwind CSS)
- **server/**: Backend API (Node.js, Express, MongoDB)

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (Local or Atlas)

## Getting Started

1.  **Clone the repository**

2.  **Install Dependencies**
    Run this command from the root directory to install dependencies for both client and server:

    ```bash
    npm run install-all
    ```

3.  **Environment Setup**
    - **Client:** Copy `client/.env.example` to `client/.env`
    - **Server:** Copy `server/.env.example` to `server/.env` and update the `MONGO_URI` if needed.

4.  **Run Development Servers**
    Start both client and server concurrently:
    ```bash
    npm run dev
    ```

    - Client: http://localhost:5173
    - Server: http://localhost:5000

## Development Workflow

- **Linting:** `npm run lint` (Checks both client and server)
- **Formatting:** VS Code is configured to format on save using Prettier.
- **Staff Onboarding**: Admin ability to create Outlet Managers; Managers creating operational staff.
- **Kitchen Dashboard**: Real-time order management for kitchen staff.
- **Waiter Dashboard**: Table management and order status tracking.

## Architecture

- **Frontend:** React with Context API for state management.
- **Backend:** Express.js with Controller-Service-Repository pattern.
- **Database:** MongoDB with Mongoose ODM.
