# Planning Poker MERN Stack Monorepo

This is a monorepo for a Planning Poker web application built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Project Structure
- `packages/server` - Express.js API backend with Socket.io for real-time communication
- `packages/client` - React frontend application with TypeScript
- `packages/shared` - Shared types, utilities, and constants used by both client and server
- Root level contains monorepo configuration and shared development tooling

## Development Guidelines
- Use TypeScript for type safety across the entire stack
- Follow established patterns for API routes and React components
- Implement real-time features using Socket.io for planning poker sessions
- Use shared types between client and server for consistency
- Follow the existing project structure when adding new features