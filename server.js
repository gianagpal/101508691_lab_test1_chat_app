require("dotenv").config();
const path = require("path");
const http = require("http");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");

const User = require("./models/User");
const GroupMessage = require("./models/GroupMessage");
const PrivateMessage = require("./models/PrivateMessage");

const app = express();
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// ===== Middleware =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(path.join(__dirname, "public")));

// ===== Serve HTML pages =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "signup.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.get("/rooms", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "rooms.html"));
});

app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "chat.html"));
});

// ===== API Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);

function verifyToken(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// ===== Message History APIs =====

// Get room messages
app.get("/api/messages/room/:room", async (req, res) => {
  const user = verifyToken(req);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const room = req.params.room;

  try {
    const messages = await GroupMessage.find({ room })
      .sort({ date_sent: 1 })
      .limit(200);

    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get private messages between logged-in user and :username
app.get("/api/messages/private/:username", async (req, res) => {
  const user = verifyToken(req);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const other = req.params.username;

  try {
    const messages = await PrivateMessage.find({
      $or: [
        { from_user: user.username, to_user: other },
        { from_user: other, to_user: user.username }
      ]
    })
      .sort({ date_sent: 1 })
      .limit(200);

    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ===== Socket.IO =====
const ROOMS = ["devops", "cloud computing", "covid19", "sports", "nodeJS", "database", "ai"];

// Socket auth with JWT
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Missing token"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // { id, username }
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  const username = socket.user.username;

  socket.join(`user:${username}`);

  socket.emit("rooms:list", ROOMS);

  socket.on("room:join", (room) => {
    if (!ROOMS.includes(room)) return socket.emit("error:msg", "Invalid room");

    if (socket.currentRoom) socket.leave(socket.currentRoom);

    socket.currentRoom = `room:${room}`;
    socket.currentRoomName = room;

    socket.join(socket.currentRoom);

    socket.emit("room:joined", room);
    socket.to(socket.currentRoom).emit("room:system", `${username} joined ${room}`);
  });

  socket.on("room:leave", () => {
  if (!socket.currentRoom) return;

  const leftRoomName = socket.currentRoomName;

  socket.to(socket.currentRoom).emit("room:system", `${username} left ${leftRoomName}`);

  socket.leave(socket.currentRoom);

  socket.currentRoom = null;
  socket.currentRoomName = null;

  socket.emit("room:left", leftRoomName);
});


  // ROOM MESSAGE 
  socket.on("room:message", async ({ room, message }) => {
    if (!room || !message) return;

    if (!socket.currentRoom || socket.currentRoomName !== room) {
      return socket.emit("error:msg", "Join the room before sending messages.");
    }

    try {
      const doc = await GroupMessage.create({
        from_user: username,
        room,
        message: String(message).trim()
      });

      io.to(socket.currentRoom).emit("room:message", doc);
    } catch (err) {
      socket.emit("error:msg", "Failed to save room message");
    }
  });

  // PRIVATE MESSAGE 
  socket.on("private:message", async ({ to_user, message }) => {
    if (!to_user || !message) return;

    try {
      const exists = await User.findOne({ username: to_user });
      if (!exists) return socket.emit("error:msg", "User not found");

      const doc = await PrivateMessage.create({
        from_user: username,
        to_user,
        message: String(message).trim()
      });

      io.to(`user:${to_user}`).emit("private:message", doc);
      io.to(`user:${username}`).emit("private:message", doc);
    } catch (err) {
      socket.emit("error:msg", "Failed to save private message");
    }
  });

  // TYPING INDICATOR 
  socket.on("private:typing", ({ to_user, isTyping }) => {
    if (!to_user) return;
    io.to(`user:${to_user}`).emit("private:typing", {
      from_user: username,
      isTyping: !!isTyping
    });
  });
});

// ===== Start Server =====
(async () => {
  await connectDB(process.env.MONGO_URI);

  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
})
();

