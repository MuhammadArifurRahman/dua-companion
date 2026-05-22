'use strict';

const fs   = require('fs');
const path = require('path');
const { mergeSettings } = require('./merge-settings.js');

module.exports = function init() {
  const cwd        = process.cwd();
  const serverScript = path.join(__dirname, 'server.js');
  const statusPath   = path.join(cwd, 'status.json');
  const htmlSrc      = path.join(__dirname, '..', 'assets', 'dua-companion.html');
  const htmlDest     = path.join(cwd, 'dua-companion.html');

  // 1. status.json
  if (!fs.existsSync(statusPath)) {
    fs.writeFileSync(statusPath, '{"done": false, "needsInput": false}\n', 'utf8');
    console.log('  created  status.json');
  } else {
    console.log('  exists   status.json (kept)');
  }

  // 2. dua-companion.html
  let html = fs.readFileSync(htmlSrc, 'utf8');
  html = html.replace(
    'run npm run dev to enable detection',
    'run: npx dua-companion start'
  );
  fs.writeFileSync(htmlDest, html, 'utf8');
  console.log('  copied   dua-companion.html');

  // 3. Hooks
  const q = (s) => `'${s.replace(/'/g, "'\\''")}'`;

  const hooks = {
    PreToolUse: [{
      matcher: '',
      hooks: [{
        type: 'command',
        command: `node ${q(serverScript)} --ensure-running ${q(statusPath)} && printf '{"done":false,"needsInput":false}' > ${q(statusPath)}`
      }]
    }],
    PermissionRequest: [{
      matcher: '',
      hooks: [{
        type: 'command',
        command: `printf '{"done":false,"needsInput":true}' > ${q(statusPath)}`
      }]
    }],
    UserPromptSubmit: [{
      matcher: '',
      hooks: [{
        type: 'command',
        command: `printf '{"done":false,"needsInput":false}' > ${q(statusPath)} && xdg-open 'http://localhost:5190/dua-companion.html' 2>/dev/null || open 'http://localhost:5190/dua-companion.html' 2>/dev/null &`
      }]
    }],
    Stop: [{
      matcher: '',
      hooks: [{
        type: 'command',
        command: `printf '{"done":true,"needsInput":false}' > ${q(statusPath)}`
      }]
    }]
  };

  const { alreadyInstalled } = mergeSettings(cwd, hooks);

  if (alreadyInstalled) {
    console.log('  skipped  .claude/settings.json (dua-companion hooks already present)');
  } else {
    console.log('  updated  .claude/settings.json (hooks added)');
  }

  console.log('');
  console.log('dua-companion initialized!');
  console.log('');
  console.log('  UI:    http://localhost:5190/dua-companion.html');
  console.log('  Start: npx dua-companion start');
  console.log('         (or it starts automatically when Claude runs its first tool)');
  console.log('');
  console.log('Open Claude Code in this directory and send your first prompt.');
};
