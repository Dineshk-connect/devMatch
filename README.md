# DevMatch Backend – Real-Time Developer Match & Messaging API

This is the backend service for **DevMatch**, a real-time networking platform for developers.  
It provides APIs for authentication, profile management, matchmaking logic, and real-time messaging using Socket.io.

---

## ⚙️ Tech Stack
- **Node.js**
- **Express.js**
- **MongoDB + Mongoose**
- **Socket.io**
- **JWT Authentication**
- **BCrypt**

---

## 🚀 Features
- **User Authentication**  
  Secure signup, login, token validation, and protected routes.

- **Developer Profiles**  
  Store skills, bio, experience, interests, and match preferences.

- **Match System**  
  Logic for swipe/match interactions between developers.

- **Real-Time Chat**  
  Bidirectional messaging with Socket.io.

- **Activity Updates**  
  Online status, new matches, and message notifications.

- **Clean API Architecture**  
  Modular controllers, routes, and middleware.

## 🔧 Environment Variables
Create a `.env` file:
PORT=5000
MONGO_URL=your_mongodb_uri
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173

## ▶️ Running the Server

```bash
npm install
npm start




