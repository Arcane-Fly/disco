import React from 'react';

export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Disco MCP Server</h1>
      <p>Next.js frontend is operational.</p>
      <p><a href="/health">Health Check</a></p>
    </main>
  );
}
