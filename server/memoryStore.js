// server/memoryStore.js

const memoryStore = {
  files: {
    "index.html": `<!DOCTYPE html>
  <html>
  <head>
    <title>Example</title>
  </head>
  <body>
    <h1>Hello World</h1>
  </body>
  </html>`,
    "style.css": `body { 
    margin:0; 
    padding:0; 
    font-family: sans-serif; 
  }`,
    "script.js": `console.log('Hello, world!');`,
    "app.jsx": `import React from 'react';
  export default function App() {
    return <div>Hello JSX</div>;
  }`,
    "component.tsx": `import React from 'react';
  type Props = {};
  const Component: React.FC<Props> = () => <div>TSX Component</div>;
  export default Component;`,
  },
  // userId: { name: string, file: string, cursor: { lineNumber: number, column: number } }
  cursors: {},
};

module.exports = memoryStore;
