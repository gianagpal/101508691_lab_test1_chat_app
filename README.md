# Lab Test 1 - Real-Time Chat Application

**Name:** Gia Nagpal
**Student ID:** 101508691  
**Course:** COMP 3133  
---

## Overview

This project is a real-time chat application built using:

- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.io
- JWT Authentication
- Bootstrap 5
- jQuery & Fetch API

The application supports:

- User authentication (Signup/Login)
- Room-based group chat
- Private 1-to-1 messaging
- Typing indicator (private chat)
- MongoDB message persistence
- Proper route separation and clean architecture

---

## Technologies Used

### Backend
- Express.js
- Mongoose
- Socket.io
- JSON Web Token (JWT)
- bcryptjs
- dotenv

### Frontend
- HTML5
- Bootstrap 5
- jQuery
- Fetch API

---

## Project Structure



---

## How to Run

### 1. Install dependencies

```npm install```


### 2. Create `.env` file

`PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/chat_app_labtest
JWT_SECRET=secret_key`


### 3. Start MongoDB locally

Make sure MongoDB service is running.

### 4. Run the application

```npm run dev```


### 5. Open in browser

http://localhost:4000/login


---

## Features Implemented

### 1. User Authentication
- Signup stores user data in MongoDB
- Username uniqueness validation
- Password hashing using bcrypt
- JWT-based login authentication
- Session stored in localStorage

---

### 2. Room-Based Chat
- Predefined chat rooms (e.g., devops, cloud computing, ai, etc.)
- Users can join and leave rooms
- Real-time message broadcasting using Socket.io
- Messages stored in MongoDB (GroupMessage collection)
- When a user leaves, other users see a system message

---

### 3. Private Messaging (1-to-1)
- Users can select another user from the list
- Messages stored in MongoDB (PrivateMessage collection)
- Chat history loaded on page refresh
- Typing indicator implemented for private chat

---

### 4. Message Persistence
All messages are stored in MongoDB:

- Users Collection
- GroupMessages Collection
- PrivateMessages Collection

---

### 5. Clean Architecture
- Routes separated into:
  - `auth.routes.js`
  - `users.routes.js`
- JWT middleware used for protected APIs
- Proper validation in Mongoose schemas
- Indexed username for uniqueness

---

## Application Screenshots

### Signup Page
User creates account stored in MongoDB.

<img width="1919" height="964" alt="image" src="https://github.com/user-attachments/assets/6137e06b-57e2-4b61-b95f-bcbdd8b4fe1c" />


---

### Login Page
User logs in and receives JWT token.

<img width="1918" height="956" alt="image" src="https://github.com/user-attachments/assets/6c35a02d-f42c-448c-ad10-f4f029af753f" />


---

### Room Selection
User selects a predefined room or private chat.

<img width="1919" height="908" alt="image" src="https://github.com/user-attachments/assets/9614ba73-d38d-43de-8dea-1e44470b2a28" />

---

### Room Chat
Two users chatting in same room with real-time updates.

<img width="1900" height="905" alt="image" src="https://github.com/user-attachments/assets/39ac70ef-9fb1-4102-8d45-45a531d22b24" />

---

### Join and Leave Room alert
System tells evryone in the room who has joined or left. 
<img width="1852" height="873" alt="image" src="https://github.com/user-attachments/assets/b6a9e13e-c19f-4c43-8d45-96af7940047e" />


---

### Typing Indicator (Private Chat)
Typing indicator shown during 1-to-1 chat.

<img width="1802" height="860" alt="image" src="https://github.com/user-attachments/assets/acee59c1-4466-4925-a8b2-312522ffec77" />


---

### MongoDB Collections

#### Users
<img width="1757" height="931" alt="image" src="https://github.com/user-attachments/assets/43114e6c-a92e-45b6-aaa4-0340c0b63131" />


#### Group Messages
<img width="1772" height="928" alt="image" src="https://github.com/user-attachments/assets/3c7f55a5-80d6-46c9-a996-6ad977a648b3" />


#### Private Messages
<img width="1763" height="932" alt="image" src="https://github.com/user-attachments/assets/1b119d29-e2a0-4313-817a-43cdaf0dae7f" />



---

## Security Notes

- `.env` file is excluded from Git using `.gitignore`
- JWT secret stored securely in environment variables
- Passwords hashed using bcrypt
- Sensitive data not committed to repository

---

## Conclusion

This chat application demonstrates:

- Real-time communication with Socket.io
- Secure authentication using JWT
- MongoDB data persistence
- Clean Express routing structure
- Frontend-backend integration
- Proper Git workflow with multiple commits

The application fulfills all lab test requirements.



