# Real-Time Chatroom Application

A full-stack real-time chatroom application built with TypeScript, Express, WebSockets, and vanilla JavaScript frontend.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [WebSocket Protocol](#websocket-protocol)
- [Environment Variables](#environment-variables)
- [Design Decisions](#design-decisions)
- [Shortcuts & Trade-offs](#shortcuts--trade-offs)
- [Future Improvements](#future-improvements)

## ✨ Features

### Authentication & User Management
- ✅ User signup with validation (first name, last name, email, password)
- ✅ User login with JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Token-based authentication for API and WebSocket connections

### Chatroom Management
- ✅ Create chatrooms (any authenticated user)
- ✅ List all available chatrooms
- ✅ Join existing chatrooms
- ✅ Leave chatrooms
- ✅ Track participants in each room

### Real-Time Messaging
- ✅ Send and receive messages instantly via WebSockets
- ✅ Message persistence (stored in memory)
- ✅ Chat history retrieval when joining a room
- ✅ Real-time notifications (user joined/left)
- ✅ Message metadata (sender, timestamp, content)

### Additional Features
- ✅ Structured error handling and logging (Winston)
- ✅ Environment-based configuration
- ✅ CORS support
- ✅ Modern, responsive UI
- ✅ Graceful shutdown handling

## 🏗️ Architecture

### Backend Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ├─── HTTP/REST ───┐
       │                 │
       └─── WebSocket ───┤
                         │
                    ┌────▼────┐
                    │ Express │
                    │  Server │
                    └────┬────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ┌────▼────┐    ┌─────▼─────┐   ┌─────▼──────┐
   │  Routes │    │ WebSocket │   │ Middleware │
   │         │    │  Service  │   │            │
   └────┬────┘    └─────┬─────┘   └─────┬──────┘
        │                │                │
   ┌────▼────────────────▼────────────────▼────┐
   │           Controllers & Models            │
   └────────────────┬──────────────────────────┘
                    │
              ┌─────▼─────┐
              │  Database │
              │ (In-Memory)│
              └───────────┘
```

### Key Components

1. **Express Server** (`src/server.ts`, `src/app.ts`)
   - HTTP server for REST API
   - Static file serving for frontend
   - Middleware integration

2. **WebSocket Service** (`src/services/websocketService.ts`)
   - Real-time bidirectional communication
   - JWT authentication for WebSocket connections
   - Room-based message broadcasting

3. **Models** (`src/models/`)
   - User: Authentication and user management
   - Chatroom: Room creation and participant management
   - Message: Message creation and retrieval

4. **Database Service** (`src/services/database.ts`)
   - In-memory data storage using Maps
   - CRUD operations for users, chatrooms, and messages

5. **Middleware** (`src/middleware/`)
   - JWT authentication
   - Error handling
   - Request logging

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **TypeScript** - Type-safe JavaScript
- **Express** - Web framework
- **ws** - WebSocket library
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **Winston** - Logging
- **dotenv** - Environment configuration

### Frontend
- **Vanilla JavaScript** - No framework dependencies
- **HTML5 & CSS3** - Modern, responsive UI
- **WebSocket API** - Real-time communication

## 📁 Project Structure

```
chatroom/
├── src/
│   ├── controllers/          # Request handlers
│   │   ├── authController.ts
│   │   ├── chatroomController.ts
│   │   └── messageController.ts
│   ├── middleware/           # Express middleware
│   │   ├── authMiddleware.ts
│   │   └── errorHandler.ts
│   ├── models/               # Data models
│   │   ├── User.ts
│   │   ├── Chatroom.ts
│   │   └── Message.ts
│   ├── routes/               # API routes
│   │   ├── authRoutes.ts
│   │   ├── chatroomRoutes.ts
│   │   └── messageRoutes.ts
│   ├── services/             # Business logic
│   │   ├── database.ts
│   │   └── websocketService.ts
│   ├── types/                # TypeScript types
│   │   └── index.ts
│   ├── utils/                # Utilities
│   │   └── logger.ts
│   ├── app.ts                # Express app setup
│   └── server.ts             # Server entry point
├── public/                   # Frontend files
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── logs/                     # Log files (auto-generated)
├── .env                      # Environment variables
├── .env.example              # Environment template
├── .gitignore
├── tsconfig.json             # TypeScript config
├── nodemon.json              # Nodemon config
├── package.json
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone or extract the project**
   ```bash
   cd chatroom
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

### Running the Application

#### Development Mode (with hot reload)
```bash
npm run dev
```

#### Production Mode
```bash
npm run build
npm start
```

### Accessing the Application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api
- **WebSocket**: ws://localhost:3000/ws
- **Health Check**: http://localhost:3000/health

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Register a new user.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token"
  },
  "message": "User created successfully"
}
```

#### POST `/api/auth/login`
Login an existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** Same as signup

### Chatroom Endpoints

**All chatroom endpoints require authentication via Bearer token in Authorization header.**

#### POST `/api/chatrooms`
Create a new chatroom.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "roomName": "General Discussion"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "roomId": "uuid",
    "roomName": "General Discussion",
    "createdBy": "user_uuid",
    "participants": ["user_uuid"],
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Chatroom created successfully"
}
```

#### GET `/api/chatrooms`
Get all chatrooms.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "roomId": "uuid",
      "roomName": "General Discussion",
      "createdBy": "user_uuid",
      "participants": ["user_uuid"],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET `/api/chatrooms/:roomId`
Get a specific chatroom.

#### POST `/api/chatrooms/:roomId/join`
Join a chatroom.

#### POST `/api/chatrooms/:roomId/leave`
Leave a chatroom.

### Message Endpoints

#### GET `/api/messages/:roomId?limit=50`
Get messages for a chatroom.

**Query Parameters:**
- `limit` (optional): Number of recent messages to retrieve

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "messageId": "uuid",
      "senderId": "user_uuid",
      "roomId": "room_uuid",
      "content": "Hello, world!",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## 🔌 WebSocket Protocol

### Connection

Connect to WebSocket with JWT token:
```javascript
const ws = new WebSocket('ws://localhost:3000/ws?token=YOUR_JWT_TOKEN');
```

### Message Types

#### Client → Server

**Join Room:**
```json
{
  "type": "join",
  "payload": {
    "roomId": "room_uuid"
  }
}
```

**Leave Room:**
```json
{
  "type": "leave",
  "payload": {
    "roomId": "room_uuid"
  }
}
```

**Send Message:**
```json
{
  "type": "message",
  "payload": {
    "content": "Hello, everyone!"
  }
}
```

#### Server → Client

**Chat History:**
```json
{
  "type": "history",
  "payload": {
    "messages": [/* array of messages */]
  }
}
```

**New Message:**
```json
{
  "type": "message",
  "payload": {
    "messageId": "uuid",
    "senderId": "user_uuid",
    "senderName": "John Doe",
    "roomId": "room_uuid",
    "content": "Hello!",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**User Joined:**
```json
{
  "type": "user_joined",
  "payload": {
    "userId": "user_uuid",
    "userName": "John Doe",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**User Left:**
```json
{
  "type": "user_left",
  "payload": {
    "userId": "user_uuid",
    "userName": "John Doe",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error:**
```json
{
  "type": "error",
  "payload": {
    "message": "Error description"
  }
}
```

## 🔐 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 3000 | No |
| `NODE_ENV` | Environment (development/production) | development | No |
| `JWT_SECRET` | Secret key for JWT signing | - | Yes |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d | No |
| `CORS_ORIGIN` | Allowed CORS origin | * | No |

## 💡 Design Decisions

### 1. In-Memory Database
**Decision:** Use Maps for data storage instead of a real database.

**Reasoning:**
- Simplifies setup (no database installation required)
- Faster development for MVP
- Easy to replace with real database later
- Sufficient for demonstration purposes

**Trade-off:** Data is lost on server restart.

### 2. JWT Authentication
**Decision:** Use JWT for both REST API and WebSocket authentication.

**Reasoning:**
- Stateless authentication
- Easy to implement and scale
- Industry standard
- Works seamlessly with WebSocket connections

### 3. WebSocket for Real-Time Communication
**Decision:** Use native `ws` library instead of Socket.IO.

**Reasoning:**
- Lightweight and performant
- Direct WebSocket protocol
- No unnecessary abstractions
- Sufficient for the requirements

### 4. TypeScript
**Decision:** Use TypeScript for the entire backend.

**Reasoning:**
- Type safety reduces bugs
- Better IDE support and autocomplete
- Easier to maintain and refactor
- Required by assignment

### 5. Modular Architecture
**Decision:** Separate concerns into controllers, models, services, and routes.

**Reasoning:**
- Clean code organization
- Easy to test and maintain
- Scalable architecture
- Follows best practices

### 6. Vanilla JavaScript Frontend
**Decision:** No frontend framework (React, Vue, etc.).

**Reasoning:**
- Assignment focuses on backend
- Minimal dependencies
- Faster to implement
- Demonstrates core JavaScript skills

## ⚡ Shortcuts & Trade-offs

### Shortcuts Taken

1. **In-Memory Storage**
   - No persistent database
   - Data lost on restart
   - Not suitable for production

2. **Basic Input Validation**
   - Simple validation rules
   - Could use libraries like Joi or Yup
   - No sanitization for XSS attacks

3. **No Unit Tests**
   - Time constraint
   - Would add Jest tests in production

4. **Simple Error Messages**
   - Generic error responses
   - Could be more specific for debugging

5. **No Rate Limiting**
   - Vulnerable to abuse
   - Would add express-rate-limit in production

6. **No Message Pagination**
   - All messages loaded at once
   - Could impact performance with large chat histories

7. **Basic Frontend**
   - Minimal UI/UX
   - No advanced features (typing indicators, read receipts, etc.)

### Production Improvements

1. **Database Integration**
   - PostgreSQL or MongoDB
   - Proper schema design
   - Migrations and seeding

2. **Testing**
   - Unit tests (Jest)
   - Integration tests
   - E2E tests (Playwright)

3. **Security Enhancements**
   - Rate limiting
   - Input sanitization
   - HTTPS enforcement
   - Helmet.js for security headers
   - CSRF protection

4. **Performance Optimization**
   - Message pagination
   - Lazy loading
   - Caching (Redis)
   - Database indexing

5. **Monitoring & Logging**
   - Application monitoring (New Relic, DataDog)
   - Error tracking (Sentry)
   - Analytics

6. **DevOps**
   - Docker containerization
   - CI/CD pipeline
   - Load balancing
   - Auto-scaling

7. **Features**
   - File/image sharing
   - Typing indicators
   - Read receipts
   - User presence (online/offline)
   - Private messaging
   - Message editing/deletion
   - Emoji reactions
   - Search functionality

## 🔮 Future Improvements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Message pagination and infinite scroll
- [ ] File and image sharing
- [ ] User profiles with avatars
- [ ] Private messaging
- [ ] Typing indicators
- [ ] Read receipts
- [ ] Message reactions (emoji)
- [ ] Search functionality
- [ ] User presence (online/offline status)
- [ ] Push notifications
- [ ] Mobile app (React Native)
- [ ] Admin panel
- [ ] Room permissions and moderation
- [ ] Message encryption

## 📝 Notes

- This is a demonstration project built in under 24 hours
- Focus is on backend architecture and real-time functionality
- Frontend is minimal but functional
- All requirements from the assignment are implemented
- Code is production-ready in terms of structure but would need enhancements for actual production use

## 👤 Author

Gourav Ojha

## 📄 License

MIT