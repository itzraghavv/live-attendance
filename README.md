# Live Attendance System

A real-time attendance system built with Bun, WebSockets, and MongoDB.
Teachers can start an attendance session, mark students present/absent in real time, and persist the final attendance to the database. Students can view their own attendance status live.

This project was built to understand state management, WebSockets, authentication, and backend system design in a practical way.

## Features

- JWT-based authentication (Teacher / Student roles)
- Start and manage live attendance sessions
- Real-time updates using WebSockets
- Students can check their own attendance status
- Attendance is persisted to MongoDB when the session ends
- Dockerized setup with MongoDB using Docker Compose

## Tech Stack

- Bun – backend runtime
- WebSockets – real-time communication
- MongoDB – data persistence
- Mongoose – ODM
- JWT – authentication
- Docker & Docker Compose – containerized setup

## Project Structure

```bash
.
├── routes/          # HTTP routes (auth, class, attendance) / Websocket
├── lib/             # auth, db, session logic
├── Dockerfile
├── docker-compose.yml
└── index.ts
```

## Getting Started

1. Clone the repository

   ```bash
   git clone https://github.com/itzraghavv/live-attendance
   cd live-attendance
   ```

2. Environment variables

   Create a .env file:

   ```bash
   PORT=3000
   JWT_SECRET=your_secret_key
   MONGO_URI=mongodb://mongo:27017/attendance
   ```

3. Run with Docker (recommended)

   Make sure Docker is running, then:

   ```bash
   docker compose up --build
   ```

   - App runs on: [http://localhost:3000](http://localhost:3000)

4. Stop the app

   ```bash
   docker compose down
   ```

   To remove database data as well:

   ```bash
   docker compose down -v
   ```

This project was created using `bun init` in bun v1.3.5. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## WebSocket Events (Core)

- `ATTENDANCE_MARKED` (Teacher → Server → Broadcast)
  - Marks a student as present or absent.
- `MY_ATTENDANCE` (Student → Server → Unicast)
  - Student requests their own attendance status.
- `DONE` (Teacher → Server → DB → Broadcast)
  - Ends the session, marks absentees, saves attendance to MongoDB, and broadcasts final stats.

## Why this project?

This project was built to:

- understand real-time systems
- learn WebSocket + HTTP coordination
- practice backend architecture decisions
- move beyond CRUD-only applications
