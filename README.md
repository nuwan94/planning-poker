# 🎯 Planning Poker - MERN Stack Monorepo

A real-time Planning Poker web application built with the MERN stack (MongoDB, Express.js, React, Node.js) for agile estimation and collaborative story pointing.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Development](#-development)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## ✨ Features

- **Real-time Collaboration**: Vote on stories simultaneously with your team using Socket.IO
- **Voting Timer**: ⏱️ Time-box estimation rounds with configurable countdown timers (NEW!)
- **Multiple Card Decks**: Choose from Fibonacci, T-shirt sizes, Modified Fibonacci, or Powers of 2
- **Room Management**: Create and join rooms with unique IDs
- **Vote Reveal**: Synchronized vote revealing and clearing
- **Story Management**: Add, edit, and manage user stories within rooms
- **Responsive Design**: Works on desktop and mobile devices with Tailwind CSS
- **Modern UI**: Clean, accessible design with Tailwind CSS utility classes
- **TypeScript**: Full type safety across the entire stack
- **Monorepo Architecture**: Shared types and utilities between client and server

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js for the REST API
- **Socket.IO** for real-time WebSocket communication
- **TypeScript** for type safety
- **In-memory storage** (easily replaceable with MongoDB)

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling and design system
- **Vite** for fast development and building
- **Socket.IO Client** for real-time features
- **React Query** for state management and API calls
- **React Router** for navigation
- **Lucide React** for modern icons

### Development Tools
- **ESLint** & **Prettier** for code quality
- **Concurrently** for running multiple processes
- **Nodemon** for development server auto-restart
- **VS Code Tasks** for integrated development workflow

## 📁 Project Structure

```
planning-poker/
├── packages/
│   ├── shared/                 # Shared types, utilities, and constants
│   │   ├── src/
│   │   │   ├── types.ts        # TypeScript interfaces and types
│   │   │   ├── constants.ts    # Card decks, socket events, validation rules
│   │   │   ├── utils.ts        # Shared utility functions
│   │   │   └── index.ts        # Export barrel
│   │   └── package.json
│   │
│   ├── server/                 # Express.js backend API
│   │   ├── src/
│   │   │   ├── index.ts        # Server entry point
│   │   │   ├── routes/         # API routes (rooms, stories)
│   │   │   ├── socket/         # Socket.IO event handlers
│   │   │   └── middleware/     # Express middleware
│   │   └── package.json
│   │
│   └── client/                 # React frontend application
│       ├── src/
│       │   ├── App.tsx         # Main React component
│       │   ├── main.tsx        # React DOM entry point
│       │   ├── pages/          # React pages/routes
│       │   ├── contexts/       # React contexts (Socket)
│       │   └── index.css       # Global styles
│       ├── index.html          # HTML template
│       ├── vite.config.ts      # Vite configuration
│       └── package.json
│
├── .vscode/
│   └── tasks.json              # VS Code tasks for development
├── package.json                # Root package.json with workspaces
├── tsconfig.json               # Root TypeScript configuration
├── .eslintrc.cjs              # ESLint configuration
├── .prettierrc                # Prettier configuration
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd planning-poker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build shared package**
   ```bash
   npm run build --workspace=packages/shared
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

This will start:
- **Backend server** on `http://localhost:5000`
- **Frontend development server** on `http://localhost:3000`

### Environment Variables

Create a `.env` file in `packages/server/` based on `.env.example`:

```bash
cd packages/server
cp .env.example .env
```

### Styling with Tailwind CSS

The client uses Tailwind CSS for styling with custom configurations:

- **Custom color palette** based on primary/secondary themes
- **Planning poker card components** with hover and selection states
- **Responsive design** utilities for mobile-first development
- **Custom animations** for card flips and transitions

The Tailwind configuration includes:
- Custom primary/secondary color scales
- Planning poker specific component classes
- Smooth animations for card interactions

## 💻 Development

### Available Scripts

#### Root Level Commands

```bash
# Start both client and server in development mode
npm run dev

# Build all packages
npm run build

# Lint all packages
npm run lint

# Fix linting issues
npm run lint:fix

# Run type checking
npm run type-check

# Clean all build outputs
npm run clean
```

#### Package-Specific Commands

```bash
# Server development
npm run dev:server

# Client development  
npm run dev:client

# Build specific package
npm run build --workspace=packages/server
npm run build --workspace=packages/client
npm run build --workspace=packages/shared
```

### VS Code Tasks

Use **Ctrl+Shift+P** → **Tasks: Run Task** to access:

- **Start Development Servers**: Runs both client and server
- **Build All Packages**: Builds the entire monorepo
- **Lint All Packages**: Runs ESLint across all packages
- **Type Check All Packages**: Runs TypeScript compiler checks

### Development Workflow

1. **Make changes** to any package
2. **Shared package changes**: Rebuild shared package if you modify types or utilities
   ```bash
   npm run build --workspace=packages/shared
   ```
3. **Server changes**: Server will auto-restart with nodemon
4. **Client changes**: Vite will hot-reload automatically

### Adding New Features

1. **Shared types/utilities**: Add to `packages/shared/src/`
2. **API endpoints**: Add to `packages/server/src/routes/`
3. **Socket events**: Add to `packages/server/src/socket/socketHandlers.ts`
4. **React components**: Add to `packages/client/src/`
5. **Always**: Update types in shared package when adding new features

## 📚 API Documentation

### REST API Endpoints

#### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get room by ID
- `POST /api/rooms` - Create a new room
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room

#### Stories
- `GET /api/stories?roomId=:roomId` - Get stories for a room
- `GET /api/stories/:id` - Get story by ID
- `POST /api/stories` - Create a new story
- `PUT /api/stories/:id` - Update story
- `DELETE /api/stories/:id` - Delete story

### Socket.IO Events

#### Room Events
- `join_room` - Join a planning poker room
- `leave_room` - Leave a room
- `user_joined` - Broadcast when user joins
- `user_left` - Broadcast when user leaves
- `room_updated` - Broadcast room state changes

#### Voting Events
- `start_voting` - Start voting session for a story
- `submit_vote` - Submit a vote
- `vote_submitted` - Broadcast that a vote was submitted (without revealing value)
- `reveal_votes` - Reveal all votes
- `votes_revealed` - Broadcast revealed votes
- `clear_votes` - Clear all votes and start over

## 🚀 Deployment

### Production Build

```bash
# Build all packages for production
npm run build

# Start production server
npm start
```

### Environment Setup

**Production environment variables:**

```bash
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-domain.com
MONGODB_URI=mongodb://your-mongodb-uri
JWT_SECRET=your-jwt-secret
```

### Deployment Options

1. **Traditional VPS/Server**
   - Build the project
   - Copy `dist` folders to server
   - Set up reverse proxy (nginx)
   - Configure environment variables

2. **Container Deployment (Docker)**
   - Create Dockerfiles for server and client
   - Use multi-stage builds
   - Deploy to container platforms

3. **Cloud Platforms**
   - **Server**: Deploy to Heroku, Railway, DigitalOcean App Platform
   - **Client**: Deploy to Vercel, Netlify, AWS S3 + CloudFront

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests and linting**
   ```bash
   npm run lint
   npm run type-check
   npm run build
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Style

- Use **TypeScript** for all new code
- Follow **ESLint** and **Prettier** configurations
- Add proper **JSDoc comments** for public APIs
- Ensure **type safety** - avoid `any` types
- Write **descriptive commit messages**

### Testing

- Add unit tests for utility functions
- Add integration tests for API endpoints
- Test Socket.IO events and real-time features
- Ensure cross-browser compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Tailwind CSS** for the excellent utility-first CSS framework
- **Socket.IO** for real-time communication capabilities
- **Vite** for fast development experience
- **TypeScript** for bringing type safety to JavaScript

---

**Happy Planning! 🎯**

For questions or support, please open an issue in the repository.