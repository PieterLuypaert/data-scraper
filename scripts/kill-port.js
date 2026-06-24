#!/usr/bin/env node
/**
 * Kill the process listening on the API port (default 3001).
 * Cross-platform replacement for kill-port.ps1 — used by npm run start:clean.
 */
const { execSync } = require('child_process');

const port = Number(process.env.PORT) || 3001;

function killWindows() {
  try {
    const out = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    const pids = new Set();
    for (const line of out.split('\n')) {
      if (!line.includes('LISTENING')) continue;
      const parts = line.trim().split(/\s+/);
      const pid = parseInt(parts[parts.length - 1], 10);
      if (pid > 0) pids.add(pid);
    }
    for (const pid of pids) {
      console.log(`Stopping PID ${pid} on port ${port}...`);
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'inherit' });
    }
    if (pids.size === 0) console.log(`Port ${port} is free.`);
  } catch {
    console.log(`Port ${port} is free.`);
  }
}

function killUnix() {
  try {
    const out = execSync(`lsof -ti tcp:${port}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    const pids = out.trim().split('\n').filter(Boolean);
    for (const pid of pids) {
      console.log(`Stopping PID ${pid} on port ${port}...`);
      execSync(`kill -9 ${pid}`, { stdio: 'inherit' });
    }
    if (pids.length === 0) console.log(`Port ${port} is free.`);
  } catch {
    console.log(`Port ${port} is free.`);
  }
}

if (process.platform === 'win32') {
  killWindows();
} else {
  killUnix();
}
