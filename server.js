require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const emailRoutes = require("./routes/emailRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================
// Middleware
// ==========================
app.use(express.json());

app.use(cors({
    origin: ["http://localhost:5173", "https://mailsendr.netlify.app"],
    methods: ["GET", "POST"],
    credentials: true
}));

// ==========================
// HTTP + Socket Server Setup
// ==========================
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "https://mailsendr.netlify.app"],
        methods: ["GET", "POST"]
    }
});

// ==========================
// Routes
// ==========================
app.use("/api/emails", emailRoutes(io));

// ==========================
// Socket Events
// ==========================
io.on("connection", (socket) => {
    console.log("🔌 Client connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
    });
});

// ==========================
// Start Server
// ==========================
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
