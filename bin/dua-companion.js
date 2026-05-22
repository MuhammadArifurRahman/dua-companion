#!/usr/bin/env node
'use strict';

const [,, command, ...args] = process.argv;

switch (command) {
  case 'init':
    require('../lib/init.js')(args);
    break;
  case 'start':
    require('../lib/server.js').ensureRunning(process.cwd());
    console.log('Server running at http://localhost:5190');
    console.log('UI: http://localhost:5190/dua-companion.html');
    break;
  case 'stop':
    require('../lib/server.js').stop();
    break;
  case 'status':
    require('../lib/server.js').status();
    break;
  default:
    console.log('Usage: dua-companion <init|start|stop|status>');
    if (command) console.log(`Unknown command: ${command}`);
    process.exit(command ? 1 : 0);
}
