/**
 * Test-friendly server setup
 * This module provides the server without top-level await for testing
 */

import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import next from 'next';
import path from 'path';
import fs from 'fs/promises';

// Re-export everything from the main server but without the startup code
export * from './server.js';

// Create a test-friendly server factory
export async function createTestServer() {
  // Import the server module after Next.js is ready  
  const { app, initializeServer } = await import('./server.js');
  await initializeServer();
  return app;
}