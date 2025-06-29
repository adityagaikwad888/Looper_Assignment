# Docker Setup Instructions

## Quick Start

### Build and run everything with docker-compose:

```bash
docker-compose up --build
```

### Run in detached mode:

```bash
docker-compose up --build -d
```

### Stop services:

```bash
docker-compose down
```

### View logs:

```bash
# All services
docker-compose logs

# Backend only
docker-compose logs backend

# Frontend only
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f
```

## Access Points

- **Frontend**: http://localhost:3001 (Development server with hot reload)
- **Backend API**: http://localhost:3000

## Development Features

- **Hot Reload**: Frontend changes are automatically reflected
- **Volume Mounting**: Source code changes sync with container
- **Simple Setup**: No build step required, runs dev server directly

## Individual Service Commands

### Backend only:

```bash
cd backend
docker build -t assignment-backend .
docker run -p 3000:3000 assignment-backend
```

### Frontend only:

```bash
cd frontend
docker build -t assignment-frontend .
docker run -p 3001:3001 assignment-frontend
```

## Environment Variables

The docker-compose.yml includes all necessary environment variables pointing to your MongoDB Atlas database. No local MongoDB required!

## Troubleshooting

1. **Port conflicts**: Make sure ports 3001 and 3000 are available
2. **Build issues**: Try `docker-compose down` and `docker-compose up --build --force-recreate`
3. **Logs**: Check `docker-compose logs` for any errors
