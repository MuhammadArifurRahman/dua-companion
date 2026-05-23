'use strict';

const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const os     = require('os');
const cp     = require('child_process');

const PORT     = 5190;
const PID_FILE = path.join(os.homedir(), '.dua-companion.pid');

// Try to find assets in .claude/dua-companion (when copied), then fall back to original location
let ASSETS = path.join(__dirname, 'assets');
if (!fs.existsSync(ASSETS)) {
  ASSETS = path.join(__dirname, '..', 'assets');
}

// ── PID helpers ──────────────────────────────────────────────────────────────

function readPid() {
  try { return parseInt(fs.readFileSync(PID_FILE, 'utf8').trim(), 10); }
  catch { return null; }
}

function writePid(pid) {
  fs.writeFileSync(PID_FILE, String(pid), 'utf8');
}

function removePid() {
  try { fs.unlinkSync(PID_FILE); } catch { /* already gone */ }
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
      // Port taken by something else — write our PID anyway so --ensure-running is happy
      writePid(process.pid);
    }
  });

  server.listen(PORT, '0.0.0.0', () => {
    writePid(process.pid);
  });

  process.on('SIGTERM', () => { removePid(); process.exit(0); });
  process.on('SIGINT',  () => { removePid(); process.exit(0); });
}

// ── Public API ───────────────────────────────────────────────────────────────

function ensureRunning(statusJsonPath) {
  const pid = readPid();

  if (pid && processAlive(pid)) {
    return; // already up
  }

  removePid();

  const child = cp.spawn(
    process.execPath,
    [__filename, '--serve', statusJsonPath],
    { detached: true, stdio: 'ignore' }
  );
  child.unref();
  // PID file will be written by the child once it starts listening
}

function stop() {
  const pid = readPid();
  if (!pid) { console.log('dua-companion server is not running.'); return; }
  try {
    process.kill(pid, 'SIGTERM');
    removePid();
    console.log('Server stopped.');
  } catch {
    removePid();
    console.log('Server was not running (stale PID removed).');
  }
}

function status() {
  const pid = readPid();
  if (pid && processAlive(pid)) {
    console.log(`Running (PID ${pid}) at http://localhost:${PORT}`);
  } else {
    removePid();
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
