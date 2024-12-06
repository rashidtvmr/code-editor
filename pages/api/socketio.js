// pages/api/socketio.js

import { Server } from "socket.io";
import memoryStore from "../../server/memoryStore";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: "/api/socketio",
      addTrailingSlash: false,
    });

    io.on("connection", (socket) => {
      let userId;
      let currentFile = "index.html";

      // Client sends their name upon joining
      socket.on("join", ({ name }) => {
        userId = socket.id;
        memoryStore.cursors[userId] = {
          name,
          file: currentFile,
          cursor: { lineNumber: 1, column: 1 },
        };

        // Send current state to this user
        socket.emit("init", {
          files: Object.keys(memoryStore.files),
          content: memoryStore.files[currentFile],
          file: currentFile,
          cursors: memoryStore.cursors,
        });

        // Notify others about new user
        socket.broadcast.emit("user-joined", { userId, name });
        io.emit("cursor-update", memoryStore.cursors);
      });

      // Handle file creation
      socket.on("create-file", (fileName, callback) => {
        if (memoryStore.files[fileName]) {
          callback({ success: false, message: "File already exists." });
        } else {
          memoryStore.files[fileName] = ""; // Initialize with empty content
          io.emit("file-created", fileName);
          callback({ success: true });
        }
      });

      // Handle file switching
      socket.on("change-file", (fileName) => {
        currentFile = fileName;
        if (memoryStore.cursors[userId]) {
          memoryStore.cursors[userId].file = fileName;
        }
        socket.emit("file-content", {
          file: fileName,
          content: memoryStore.files[fileName],
        });
        io.emit("cursor-update", memoryStore.cursors);
      });

      // Handle code changes
      socket.on("editor-change", ({ file, code }) => {
        if (memoryStore.files[file] !== undefined) {
          memoryStore.files[file] = code;
          socket.broadcast.emit("editor-change", { file, code });
        }
      });

      // Handle cursor movements
      socket.on("cursor-move", (cursor) => {
        if (memoryStore.cursors[userId]) {
          memoryStore.cursors[userId].cursor = cursor;
        }
        socket.broadcast.emit("cursor-update", memoryStore.cursors);
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        delete memoryStore.cursors[userId];
        io.emit("cursor-update", memoryStore.cursors);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
}
