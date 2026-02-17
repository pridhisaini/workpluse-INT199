# Deployment Guide — WorkPulse

This project is configured for production using Docker and Docker Compose.

## Prerequisites
- Docker (20.10+)
- Docker Compose (2.0+)

## 1. Environment Configuration
Copy the `.env.example` file to `.env` and update the values:
```bash
cp apps/backend/.env.example .env
# Edit .env with your production credentials
```

## 2. Infrastructure Setup
The `docker-compose.yml` file includes:
- **NestJS API**: The main entry point for requests.
- **BullMQ Worker**: Background job processor.
- **Postgres 16**: Primary relational database.
- **Redis 7**: Cache, Pub/Sub, and Job Queue.

## 3. Starting the System
Run the following command to build and start the containers in detached mode:
```bash
docker compose up -d --build
```

## 4. Monitoring & Health
The API includes a specialized health check endpoint at `/health` that monitors:
- Database connectivity
- Redis connectivity

You can check the status via:
```bash
curl http://localhost:5000/health
```

## 5. Graceful Shutdown
The application is configured to handle `SIGTERM` signals. When stopping the containers, Docker will send a signal to NestJS, allowing it to:
1. Close database connections.
2. Finish processing the current job (in the worker).
3. Safely disconnect Socket.IO clients.

```bash
docker compose stop
```

## 6. Logs
All logs are output in structured JSON format for compatibility with systems like ELK or Datadog.
```bash
docker compose logs -f api
```
