
  dua-companion/
  ├── bin/dua-companion.js     # CLI
  ├── lib/
  │   ├── init.js              # npx dua-companion init
  │   ├── remove.js            # npx dua-companion remove
  │   ├── server.js            # HTTP server on port 5190 + PID management
  │   └── merge-settings.js    # Safe hooks merge
  └── assets/
      └── dua-companion.html   # The UI

  ## What init creates in your project

  All files are kept inside .claude/ — your project root stays clean:

    .claude/
    ├── dua-companion/
    │   └── status.json        # Claude working-state flag (auto-managed)
    └── settings.json          # Hooks added (merged, existing keys untouched)

  ## Usage

  To use it in any new project:
  cd ~/Projects/my-new-project
  node ~/Projects/dua-companion/bin/dua-companion.js init

  Once published to npm it becomes:
  npx dua-companion init

  The server starts automatically on Claude's first tool use — no manual
  npm run dev needed. Port 5190 is dedicated so it works in any project
  regardless of whether a dev server is running.

  ## Removing from a project

  Run this inside the project you want to clean up:

    npx dua-companion remove

  This will:
    1. Delete .claude/dua-companion/ (status.json and any other plugin files)
    2. Strip all dua-companion hooks from .claude/settings.json
    3. Leave everything else in settings.json untouched

  To also stop the background server:

    npx dua-companion stop

  Manual removal (if you prefer):
    1. Delete the .claude/dua-companion/ folder
    2. Open .claude/settings.json and remove any hook entries whose
       command contains the string "dua-companion"
    3. Run: dua-companion stop
