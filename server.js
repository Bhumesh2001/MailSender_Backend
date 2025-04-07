require('dotenv').config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "https://mailsendr.netlify.app" } });

app.use(express.json());
app.use(cors());

app.use('/', (req, res) => res.send(`<h1>Welcome to the Node js Server</h1>`));
app.use("/api/emails", require("./routes/emailRoutes")(io));

io.on("connection", (socket) => {
    console.log("🔌 Client connected!");
    socket.on("disconnect", () => console.log("❌ Client disconnected"));
});

// server.listen(5000, () => console.log(`🚀 Server running on port 5000`));

module.exports = app;
