#!/usr/bin/env node
'use strict';

const path = require('path');
const [,, command, ...args] = process.argv;

// Get the status.json path for the current project
const statusJsonPath = path.join(process.cwd(), '.claude', 'dua-companion', 'status.json');

switch (command) {
  case 'init':
    require('../lib/init.js')(args);
    break;
  case 'start':
    require('../lib/server.js').ensureRunning(statusJsonPath);
    // Read port from config
    try {
      const fs = require('fs');
      const configPath = path.join(process.cwd(), '.claude', 'dua-companion', 'config.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      console.log(`Server running at http://localhost:${config.port}`);
      console.log(`UI: http://localhost:${config.port}/dua-companion.html`);
    } catch {
      console.log('Server started (port info unavailable)');
    }
    break;
  case 'stop':
    require('../lib/server.js').stop(statusJsonPath);
    break;
  case 'status':
    require('../lib/server.js').status(statusJsonPath);
    break;
  case 'remove':
  case 'uninstall':
    require('../lib/remove.js')(args);
    break;
  default:
    console.log('Usage: dua-companion <init|start|stop|status|remove>');
    if (command) console.log(`Unknown command: ${command}`);
    process.exit(command ? 1 : 0);
}
