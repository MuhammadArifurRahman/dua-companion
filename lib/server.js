'use strict';

const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const os     = require('os');
const cp     = require('child_process');

// Per-project configuration — port and metadata stored in .claude/dua-companion
function getPort(statusJsonPath) {
  const configPath = path.join(path.dirname(statusJsonPath), 'config.json');
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return config.port || 5190;
  } catch {
    return 5190; // fallback
  }
}

function getPidFile(statusJsonPath) {
  return path.join(path.dirname(statusJsonPath), '.pid');
}

function getMetadataFile(statusJsonPath) {
  return path.join(path.dirname(statusJsonPath), '.metadata.json');
}

// Try to find assets in .claude/dua-companion (when copied), then fall back to original location
let ASSETS = path.join(__dirname, 'assets');
if (!fs.existsSync(ASSETS)) {
  ASSETS = path.join(__dirname, '..', 'assets');
}

// ── PID helpers (per-project) ───────────────────────────────────────────────

function readPid(statusJsonPath) {
  const pidFile = getPidFile(statusJsonPath);
  try { return parseInt(fs.readFileSync(pidFile, 'utf8').trim(), 10); }
  catch { return null; }
}

function writePid(statusJsonPath, pid) {
  const pidFile = getPidFile(statusJsonPath);
  fs.writeFileSync(pidFile, String(pid), 'utf8');
}

function removePid(statusJsonPath) {
  const pidFile = getPidFile(statusJsonPath);
  try { fs.unlinkSync(pidFile); } catch { /* already gone */ }
}

function writeMetadata(statusJsonPath, pid, projectPath, port) {
  const metadataFile = getMetadataFile(statusJsonPath);
  try {
    fs.writeFileSync(metadataFile, JSON.stringify({ pid, projectPath, port, timestamp: Date.now() }, null, 2), 'utf8');
  } catch { /* ignore write failures */ }
}

function readMetadata(statusJsonPath) {
  const metadataFile = getMetadataFile(statusJsonPath);
  try { return JSON.parse(fs.readFileSync(metadataFile, 'utf8')); }
  catch { return null; }
}

function removeMetadata(statusJsonPath) {
  const metadataFile = getMetadataFile(statusJsonPath);
  try { fs.unlinkSync(metadataFile); } catch { /* already gone */ }
}

function processAlive(pid) {
  try { process.kill(pid, 0); return true; }
  catch { return false; }
}

// ── Serve mode ───────────────────────────────────────────────────────────────

function serve(statusJsonPath) {
  // Try to find HTML in current directory first (when in .claude/dua-companion), then in assets
  let htmlPath = path.join(__dirname, 'dua-companion.html');
  if (!fs.existsSync(htmlPath)) {
    htmlPath = path.join(ASSETS, 'dua-companion.html');
  }

  const projectPath = path.dirname(path.dirname(statusJsonPath)); // get project root from .claude/status.json
  const PORT = getPort(statusJsonPath);

  const server = http.createServer((req, res) => {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    };

    const url = req.url.split('?')[0];

    if (url === '/' || url === '') {
      res.writeHead(302, { ...cors, Location: '/dua-companion.html' });
      return res.end();
    }

    if (url === '/status.json') {
      try {
        const data = fs.readFileSync(statusJsonPath, 'utf8');
        res.writeHead(200, { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store, no-cache' });
        return res.end(data);
      } catch {
        res.writeHead(500, cors);
        return res.end('{"error":"status.json not found"}');
      }
    }

    if (url === '/dua-companion.html') {
      try {
        const html = fs.readFileSync(htmlPath, 'utf8');
        res.writeHead(200, { ...cors, 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(html);
      } catch {
        res.writeHead(500, cors);
        return res.end('dua-companion.html not found');
      }
    }

    res.writeHead(404, cors);
    res.end('Not found');
  });

  server.on('error', err => {
    if (err.code === 'EADDRINUSE') {
      const metadata = readMetadata(statusJsonPath);
      if (metadata && metadata.projectPath) {
        console.error(`\n⚠️  Port ${PORT} is already in use by dua-companion in:\n   ${metadata.projectPath}\n`);
      } else {
        console.error(`\n⚠️  Port ${PORT} is already in use.\n`);
      }
      console.error('Stop the other instance with: dua-companion stop\n');
      process.exit(1);
    }
  });

  server.listen(PORT, '0.0.0.0', () => {
    writePid(statusJsonPath, process.pid);
    writeMetadata(statusJsonPath, process.pid, projectPath, PORT);
    console.log(`dua-companion running on http://localhost:${PORT}`);
  });

  process.on('SIGTERM', () => { removePid(statusJsonPath); removeMetadata(statusJsonPath); process.exit(0); });
  process.on('SIGINT',  () => { removePid(statusJsonPath); removeMetadata(statusJsonPath); process.exit(0); });
}

// ── Public API ───────────────────────────────────────────────────────────────

function ensureRunning(statusJsonPath) {
  const pid = readPid(statusJsonPath);

  if (pid && processAlive(pid)) {
    return; // already up
  }

  removePid(statusJsonPath);

  const child = cp.spawn(
    process.execPath,
    [__filename, '--serve', statusJsonPath],
    { detached: true, stdio: 'ignore' }
  );
  child.unref();
  // PID file will be written by the child once it starts listening
}

function stop(statusJsonPath) {
  const pid = readPid(statusJsonPath);
  if (!pid) { console.log('dua-companion server is not running.'); return; }
  try {
    process.kill(pid, 'SIGTERM');
    removePid(statusJsonPath);
    removeMetadata(statusJsonPath);
    console.log('Server stopped.');
  } catch {
    removePid(statusJsonPath);
    removeMetadata(statusJsonPath);
    console.log('Server was not running (stale PID removed).');
  }
}

function status(statusJsonPath) {
  const pid = readPid(statusJsonPath);
  if (pid && processAlive(pid)) {
    const metadata = readMetadata(statusJsonPath);
    const PORT = getPort(statusJsonPath);
    if (metadata && metadata.projectPath) {
      console.log(`Running (PID ${pid}) at http://localhost:${PORT}`);
      console.log(`Project: ${metadata.projectPath}`);
    } else {
      console.log(`Running (PID ${pid}) at http://localhost:${PORT}`);
    }
  } else {
    removePid(statusJsonPath);
    removeMetadata(statusJsonPath);
    console.log('Not running. Start with: dua-companion start');
  }
}

module.exports = { ensureRunning, stop, status };

// ── Entry point when spawned as child ────────────────────────────────────────

if (require.main === module) {
  const [,, flag, statusPath] = process.argv;
  if (flag === '--serve' && statusPath) {
    serve(statusPath);
  } else if (flag === '--ensure-running' && statusPath) {
    ensureRunning(statusPath);
  }
}
