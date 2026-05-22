
  dua-companion/
  ├── bin/dua-companion.js     # CLI
  ├── lib/
  │   ├── init.js              # npx dua-companion init
  │   ├── server.js            # HTTP server on port 5190 + PID management
  │   └── merge-settings.js    # Safe hooks merge
  └── assets/
      └── dua-companion.html   # The UI

  To use it in any new project:
  cd ~/Projects/my-new-project
  node ~/Projects/dua-companion/bin/dua-companion.js init
  
  Once published to npm it becomes:
  npx dua-companion init
  
  The server starts automatically on Claude's first tool use — no manual npm run dev needed. Port 5190 is dedicated so it works in any project regardless of
  whether a dev server is running.