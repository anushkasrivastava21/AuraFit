# StyleAI Backend

The official backend server for **StyleAI**, a personal AI styling assistant.

This backend provides robust APIs for user authentication, profile management, wardrobe tracking, and AI-powered outfit generation using Google's Gemini AI. It's built with Node.js, Express, PostgreSQL, Redis, and Docker.

## 🚀 Features

*   **Secure Authentication**: JWT-based authentication with access tokens and Redis-backed refresh tokens. Secure password hashing with bcrypt.
*   **User Profiles**: Manage comprehensive styling profiles including age, body type, style preferences, and budget constraints.
*   **Wardrobe Management**: Upload, categorize, and track clothing items. Integrates with **Cloudinary** for scalable image storage and uses Sharp for image optimization.
*   **AI Outfit Generation**: Leverages the **Google Gemini Pro Vision AI** to generate personalized outfit recommendations from the user's digital wardrobe based on mood and occasions.
*   **Outfit Tracking & History**: Save generated outfits, add ratings, notes, and log when they were worn.
*   **Robust Infrastructure**: 
    *   **PostgreSQL** for relational data storage.
    *   **Redis** for token blacklisting and high-performance caching of AI responses.
    *   **Docker Containerization** for reliable local development and database management.
    *   **Winston Logging** for production-ready, structured logging.
*   **Security & Rate Limiting**: Implements Helmet, CORS, and Express Rate Limiter for secure, throttled access.

## 🛠️ Tech Stack

*   **Runtime**: [Node.js](https://nodejs.org/)
*   **Framework**: [Express.js](https://expressjs.com/)
*   **Database**: [PostgreSQL](https://www.postgresql.org/) (via `pg` pooling)
*   **Caching/Sessions**: [Redis](https://redis.io/) (via `ioredis`)
*   **AI Integration**: [Google Generative AI](https://ai.google.dev/) (`@google/generative-ai`)
*   **Image Storage**: [Cloudinary](https://cloudinary.com/) (Multer & Sharp for processing)
*   **Environment**: [Docker Compose](https://docs.docker.com/compose/)

## ⚙️ Getting Started (Local Development)

### Prerequisites

*   **Node.js** (v18+)
*   **Docker** & **Docker Desktop** (Running)

### 1. Installation

Clone the repository and install dependencies:

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory and populate it with your API keys and secrets:

```env
PORT=5000
NODE_ENV=development

# Database (Handled by Docker Compose)
DATABASE_URL=postgresql://postgres:password@localhost:5432/styleai_db

# Redis (Handled by Docker Compose)
REDIS_URL=redis://localhost:6379

# JWT Secrets (Use strong random strings)
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Frontend URL (For CORS)
FRONTEND_URL=http://localhost:5173
```

### 3. Start Database Infrastructure

Start the PostgreSQL database and Redis server using Docker Compose:

```bash
docker compose up -d
```
*Wait a few seconds to ensure the database is fully initialized.*

### 4. Database Migrations & Seeding

Run the migration script to create the database tables, and the seed script to populate it with test users:

```bash
npm run migrate
npm run seed
```

### 5. Start the Server

Start the backend application in development mode:

```bash
npm run dev
```

The server should now be running at `http://localhost:5000`.

## 📂 Project Structure

```text
/
├── config/           # Centralized configuration (Redis, Logger, Env validation)
├── db/               # PostgreSQL connection pool and SQL migrations
├── middleware/       # Custom middleware (JWT auth, Multer upload handling)
├── routes/           # Express Route controllers (auth, profile, wardrobe, outfits)
├── services/         # Core business logic and external API integrations
├── scripts/          # Database tools (migrate, seed) and verification scripts
├── logs/             # Generated Winston log files
├── .env              # Environment variables
├── docker-compose.yml# Docker infrastructure definition
└── server.js         # Main application entry point
```

## 🧪 Verification

Run the built-in verification script to perform a system health check:

```bash
npm run verify
```
This ensures that the folders exist, the API routes are loadable, and connections to PostgreSQL and Redis are successful.

## 📝 License
This project is for the Geminathon Hackathon.