// pages/index.js

import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(import("@monaco-editor/react"), { ssr: false });

let socket;

export default function Home() {
  const [files, setFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState("index.html");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [cursors, setCursors] = useState({});
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [creatingFile, setCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [decorations, setDecorations] = useState([]);

  useEffect(() => {
    // Initialize Socket.io client
    socket = io({ path: "/api/socketio" });

    // Handle initial data
    socket.on("init", ({ files, content, file, cursors }) => {
      setFiles(files);
      setCode(content);
      setCurrentFile(file);
      setCursors(cursors);
      updateDecorations(cursors);
    });

    // Handle editor changes from other users
    socket.on("editor-change", ({ file, code }) => {
      if (file === currentFile) {
        setCode(code);
      }
    });

    // Handle receiving new file content
    socket.on("file-content", ({ file, content }) => {
      setCurrentFile(file);
      setCode(content);
    });

    // Handle updates to user cursors
    socket.on("cursor-update", (allCursors) => {
      setCursors(allCursors);
      updateDecorations(allCursors);
    });

    // Handle new file creation
    socket.on("file-created", (fileName) => {
      setFiles((prev) => [...prev, fileName]);
    });

    return () => {
      socket.disconnect();
    };
  }, [currentFile]);

  // Function to handle joining
  function handleJoin() {
    if (!name.trim()) {
      alert("Please enter a valid name.");
      return;
    }
    socket.emit("join", { name });
    setJoined(true);
  }

  // Function to handle code changes
  function handleEditorChange(value) {
    setCode(value);
    socket.emit("editor-change", { file: currentFile, code: value });
  }

  // Function to handle file switching
  function handleFileChange(e) {
    const newFile = e.target.value;
    setCurrentFile(newFile);
    socket.emit("change-file", newFile);
  }

  // Function to handle editor mount
  function handleEditorMount(editor, monaco) {
    editorRef.current = editor;
    monacoRef.current = monaco;
    editor.onDidChangeCursorPosition((e) => {
      socket.emit("cursor-move", e.position);
    });
  }

  // Function to handle cursor decorations
  function updateDecorations(allCursors) {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const newDecorations = [];

    for (let userId in allCursors) {
      const user = allCursors[userId];
      if (user.file === currentFile && user.cursor) {
        newDecorations.push({
          range: new monaco.Range(
            user.cursor.lineNumber,
            user.cursor.column,
            user.cursor.lineNumber,
            user.cursor.column
          ),
          options: {
            className: "foreign-cursor",
            hoverMessage: { value: `**${user.name}**` },
            beforeContentClassName: "foreign-cursor-marker",
          },
        });
      }
    }

    // Update decorations and store decoration IDs
    const newDecorationIds = editor.deltaDecorations(
      decorations,
      newDecorations
    );
    setDecorations(newDecorationIds);
  }

  // Function to determine language based on file extension
  function determineLanguage(filename) {
    if (filename.endsWith(".html")) return "html";
    if (filename.endsWith(".css")) return "css";
    if (filename.endsWith(".jsx")) return "javascript";
    if (filename.endsWith(".tsx")) return "typescript";
    if (filename.endsWith(".ts")) return "typescript";
    if (filename.endsWith(".js")) return "javascript";
    return "javascript";
  }

  // Function to handle creating a new file
  function handleCreateFile(e) {
    e.preventDefault();
    if (!newFileName.trim()) {
      alert("Please enter a valid filename.");
      return;
    }
    socket.emit("create-file", newFileName, (response) => {
      if (response.success) {
        setNewFileName("");
        setCreatingFile(false);
        // Optionally, switch to the new file immediately
        setCurrentFile(newFileName);
        socket.emit("change-file", newFileName);
      } else {
        alert(response.message);
      }
    });
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "#1e1e1e",
        color: "#ffffff",
      }}
    >
      {!joined && (
        <div style={{ margin: "auto", textAlign: "center" }}>
          <h2>Enter your name to join</h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            style={{
              padding: "10px",
              margin: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
          <button
            onClick={handleJoin}
            style={{
              padding: "10px 20px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#4CAF50",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Join
          </button>
        </div>
      )}

      {joined && (
        <>
          <div
            style={{
              display: "flex",
              padding: "10px",
              background: "#2d2d2d",
              alignItems: "center",
            }}
          >
            <select
              value={currentFile}
              onChange={handleFileChange}
              style={{
                padding: "5px",
                marginRight: "10px",
                borderRadius: "5px",
                border: "1px solid #555",
                backgroundColor: "#3c3c3c",
                color: "#fff",
              }}
            >
              {files.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <button
              onClick={() => setCreatingFile(true)}
              style={{
                padding: "5px 10px",
                borderRadius: "5px",
                border: "none",
                backgroundColor: "#007acc",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              + New File
            </button>
          </div>

          {creatingFile && (
            <div
              style={{
                padding: "10px",
                background: "#2d2d2d",
                display: "flex",
                alignItems: "center",
              }}
            >
              <form
                onSubmit={handleCreateFile}
                style={{ display: "flex", alignItems: "center" }}
              >
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="Filename with extension (e.g., app.js)"
                  style={{
                    padding: "5px",
                    marginRight: "10px",
                    borderRadius: "5px",
                    border: "1px solid #555",
                    backgroundColor: "#3c3c3c",
                    color: "#fff",
                  }}
                  required
                />
                <button
                  type="submit"
                  style={{
                    padding: "5px 10px",
                    borderRadius: "5px",
                    border: "none",
                    backgroundColor: "#28a745",
                    color: "#fff",
                    cursor: "pointer",
                    marginRight: "10px",
                  }}
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreatingFile(false);
                    setNewFileName("");
                  }}
                  style={{
                    padding: "5px 10px",
                    borderRadius: "5px",
                    border: "none",
                    backgroundColor: "#dc3545",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </form>
            </div>
          )}

          <div style={{ flex: 1, position: "relative" }}>
            <MonacoEditor
              height="100%"
              language={determineLanguage(currentFile)}
              theme="vs-dark"
              value={code}
              onChange={handleEditorChange}
              onMount={handleEditorMount}
              options={{
                automaticLayout: true,
                minimap: { enabled: false },
                formatOnType: true,
                formatOnPaste: true,
                wordWrap: "on",
                fontSize: 14,
                scrollbar: {
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                },
                cursorStyle: "line",
                fontFamily: "Fira Code, monospace",
              }}
            />
          </div>
        </>
      )}

      <style jsx global>{`
        /* Monaco Editor Cursor Decorations */
        .foreign-cursor {
          border-left: 2px solid #ff0000; /* Customize cursor color */
          position: relative;
        }

        .foreign-cursor-marker {
          content: "";
          border-left: 2px solid #ff0000; /* Same color as border-left */
          position: absolute;
          height: 100%;
          pointer-events: none;
        }

        /* Optional: Hide the default tooltip to prevent conflicts */
        .monaco-editor .cursor-tooltip {
          display: none;
        }
      `}</style>
    </div>
  );
}

function determineLanguage(filename) {
  if (filename.endsWith(".html")) return "html";
  if (filename.endsWith(".css")) return "css";
  if (filename.endsWith(".jsx")) return "javascript";
  if (filename.endsWith(".tsx")) return "typescript";
  if (filename.endsWith(".ts")) return "typescript";
  if (filename.endsWith(".js")) return "javascript";
  return "javascript";
}
