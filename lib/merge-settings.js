'use strict';

const fs   = require('fs');
const path = require('path');

const SENTINEL = 'dua-companion';

function mergeSettings(projectCwd, newHooks) {
  const settingsDir  = path.join(projectCwd, '.claude');
  const settingsPath = path.join(settingsDir, 'settings.json');

  if (!fs.existsSync(settingsDir)) {
    fs.mkdirSync(settingsDir, { recursive: true });
  }

  let existing = {};
  if (fs.existsSync(settingsPath)) {
    try {
      existing = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    } catch {
      console.error('Warning: could not parse existing .claude/settings.json — will merge carefully');
    }
  }

  if (!existing.hooks) existing.hooks = {};

  let alreadyInstalled = false;

  for (const [hookName, entries] of Object.entries(newHooks)) {
    if (!existing.hooks[hookName]) existing.hooks[hookName] = [];

    const existingCommands = existing.hooks[hookName]
      .flatMap(e => (e.hooks || []).map(h => h.command || ''));

    const hasSentinel = existingCommands.some(cmd => cmd.includes(SENTINEL));

    if (hasSentinel) {
      alreadyInstalled = true;
      continue;
    }

    for (const entry of entries) {
      existing.hooks[hookName].push(entry);
    }
  }

  fs.writeFileSync(settingsPath, JSON.stringify(existing, null, 2) + '\n', 'utf8');
  return { alreadyInstalled };
}

module.exports = { mergeSettings };
