'use strict';

const fs         = require('fs');
const path       = require('path');
const crypto     = require('crypto');
const { execSync } = require('child_process');
const { mergeSettings } = require('./merge-settings.js');

// Generate unique port based on project path hash
function generatePort(projectPath) {
  const hash = crypto.createHash('md5').update(projectPath).digest('hex');
  const hashNum = parseInt(hash.substring(0, 8), 16);
  const port = 5200 + (hashNum % 800); // Range: 5200-5999
  return port;
}

module.exports = function init(args) {
  const gitUrl = args && args[0];
  let cwd = process.cwd();

  // If git URL provided, clone it
  if (gitUrl && (gitUrl.startsWith('http') || gitUrl.startsWith('git@'))) {
    const repoName = gitUrl.split('/').pop().replace('.git', '');
    const targetDir = path.join(cwd, repoName);

    if (fs.existsSync(targetDir)) {
      console.error(`Error: Directory ${repoName} already exists`);
      process.exit(1);
    }

    console.log(`Cloning ${gitUrl}...`);
    try {
      execSync(`git clone ${gitUrl} ${targetDir}`, { stdio: 'inherit' });
      cwd = targetDir;
    } catch (err) {
      console.error('Failed to clone repository');
      process.exit(1);
    }
  }

  const duaDir         = path.join(cwd, '.claude', 'dua-companion');
  const statusPath     = path.join(duaDir, 'status.json');
  const configPath     = path.join(duaDir, 'config.json');
  const serverDestPath = path.join(duaDir, 'server.js');
  const uiSourcePath   = path.join(__dirname, '..', 'assets', 'dua-companion.html');
  const uiDestPath     = path.join(duaDir, 'dua-companion.html');

  // 1. Create .claude/dua-companion directory and copy plugin files
  if (!fs.existsSync(duaDir)) {
    fs.mkdirSync(duaDir, { recursive: true });
  }

  // Copy server.js (needed for hooks)
  const serverSourcePath = path.join(__dirname, 'server.js');
  fs.copyFileSync(serverSourcePath, serverDestPath);
  console.log('  created  .claude/dua-companion/server.js');

  // Copy HTML UI (needed for web interface)
  if (fs.existsSync(uiSourcePath)) {
    fs.copyFileSync(uiSourcePath, uiDestPath);
    console.log('  created  .claude/dua-companion/dua-companion.html');
  }

  // Generate unique port for this project
  const port = generatePort(cwd);
  const projectName = path.basename(cwd);

  // Create config.json with port and project name
  fs.writeFileSync(configPath, JSON.stringify({ port, projectName }, null, 2) + '\n', 'utf8');
  console.log(`  created  .claude/dua-companion/config.json (port ${port})`);

  // Create status.json (needed for state tracking)
  if (!fs.existsSync(statusPath)) {
    fs.writeFileSync(statusPath, `{"done": false, "needsInput": false, "projectName": "${projectName}"}\n`, 'utf8');
    console.log('  created  .claude/dua-companion/status.json');
  } else {
    // Update existing status.json to include project name if missing
    try {
      const existing = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
      if (!existing.projectName) {
        existing.projectName = projectName;
        fs.writeFileSync(statusPath, JSON.stringify(existing) + '\n', 'utf8');
      }
    } catch { /* keep as-is if parse fails */ }
    console.log('  exists   .claude/dua-companion/status.json (kept)');
  }

  // 2. Hooks - reference the copied server.js in .claude/dua-companion
  const q = (s) => `'${s.replace(/'/g, "'\\''")}'`;

  // Create a helper script to extract port from config.json
  const getPortScript = `node -e "const c=require('fs').readFileSync(${q(configPath)});console.log(JSON.parse(c).port)"`;

  const hooks = {
    PreToolUse: [{
      matcher: '',
      hooks: [{
        type: 'command',
        command: `node ${q(serverDestPath)} --ensure-running ${q(statusPath)} && printf '{"done":false,"needsInput":false,"projectName":"${projectName}"}' > ${q(statusPath)}`
      }]
    }],
    PermissionRequest: [{
      matcher: '',
      hooks: [{
        type: 'command',
        command: `printf '{"done":false,"needsInput":true,"projectName":"${projectName}"}' > ${q(statusPath)}`
      }]
    }],
    UserPromptSubmit: [{
      matcher: '',
      hooks: [{
        type: 'command',
        command: `printf '{"done":false,"needsInput":false,"projectName":"${projectName}"}' > ${q(statusPath)} && PORT=$(${getPortScript}) && xdg-open "http://localhost:\$PORT/dua-companion.html" 2>/dev/null || open "http://localhost:\$PORT/dua-companion.html" 2>/dev/null &`
      }]
    }],
    Stop: [{
      matcher: '',
      hooks: [{
        type: 'command',
        command: `printf '{"done":true,"needsInput":false,"projectName":"${projectName}"}' > ${q(statusPath)}`
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
  console.log(`  Project directory: ${cwd}`);
  console.log(`  UI:               http://localhost:${port}/dua-companion.html`);
  console.log('  Start:            dua-companion start');
  console.log('                    (or it starts automatically when Claude runs its first tool)');
  console.log('');
  console.log('Open Claude Code in this directory and send your first prompt.');
};
