/**
 * server.js — Custom Node.js server that combines Next.js + Socket.io.
 * Run with: node server.js (dev) or NODE_ENV=production node server.js (prod)
 */

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  /** @type {import('socket.io').Server} */
  // CORS: never fall back to "*" — use localhost for dev if env var is not set
  const allowedOrigin =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigin,
      methods: ["GET", "POST"],
    },
  });

  // Attach io instance to globalThis so API routes can emit events
  global.io = io;

  io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Visitor joins their conversation room
    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`[Socket] ${socket.id} joined room: ${conversationId}`);
    });

    // Owner joins dashboard room to receive all conversation events
    socket.on("join_dashboard", () => {
      socket.join("dashboard");
      console.log(`[Socket] Owner joined dashboard room`);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT} [${dev ? "dev" : "prod"}]`);
  });
});
