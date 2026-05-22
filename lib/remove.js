'use strict';

const fs   = require('fs');
const path = require('path');

const SENTINEL = 'dua-companion';

module.exports = function remove() {
  const cwd          = process.cwd();
  const duaDir       = path.join(cwd, '.claude', 'dua-companion');
  const settingsPath = path.join(cwd, '.claude', 'settings.json');

  // 1. Remove .claude/dua-companion/
  if (fs.existsSync(duaDir)) {
    fs.rmSync(duaDir, { recursive: true, force: true });
    console.log('  removed  .claude/dua-companion/');
  } else {
    console.log('  skipped  .claude/dua-companion/ (not found)');
  }

  // 2. Strip hooks from .claude/settings.json
  if (fs.existsSync(settingsPath)) {
    try {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

      if (settings.hooks) {
        for (const hookName of Object.keys(settings.hooks)) {
          settings.hooks[hookName] = settings.hooks[hookName].filter(
            entry => !(entry.hooks || []).some(h => (h.command || '').includes(SENTINEL))
          );
          if (settings.hooks[hookName].length === 0) delete settings.hooks[hookName];
        }
        if (Object.keys(settings.hooks).length === 0) delete settings.hooks;
      }

      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf8');
      console.log('  cleaned  .claude/settings.json (hooks removed)');
    } catch {
      console.error('  warning  could not parse .claude/settings.json — remove hooks manually');
    }
  } else {
    console.log('  skipped  .claude/settings.json (not found)');
  }

  console.log('');
  console.log('dua-companion removed from this project.');
  console.log('To also stop the server: dua-companion stop');
};
