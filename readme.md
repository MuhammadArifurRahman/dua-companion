# dua-companion

Islamic dua companion for Claude Code — displays duas while Claude works on your projects.

## Features

- 🕌 Islamic duas display while Claude is working
- ⚡ Automatic startup — no manual configuration needed
- 📁 Clean project root — all files in `.claude/`
- 🛠️ Works with any Claude Code project
- 🚫 Easy removal — one command uninstalls completely
- 🔌 Multiple projects run simultaneously with isolated ports
- 📍 Project name displayed in status bar for easy identification
- ✕ Quick close button to exit the UI anytime

## Installation (30 seconds)

All plugin files stay in `.claude/` — your project root stays clean. The `.claude/` directory is Claude Code's configuration folder and won't interfere with your project files.

```bash
# 1. Clone the repository
git clone https://github.com/MuhammadArifurRahman/dua-companion.git
cd dua-companion

# 2. Install globally
npm install -g .

# 3. Go to your project and initialize
cd ~/my-project
dua-companion init
```

That's it! 🎉

## How It Works

Once initialized, dua-companion:
- Starts automatically on Claude's first tool use (no manual `start` needed)
- Assigns each project its own unique port (in the range 5200-5999)
- Displays the UI at the project's unique port (e.g., `http://localhost:5234/dua-companion.html`)
- Hooks into Claude Code's lifecycle (PreToolUse, PermissionRequest, UserPromptSubmit, Stop)

**Per-Project Ports:**
- Each project gets a unique port based on its directory path
- This means you can run multiple dua-companion instances simultaneously in different projects
- The port is stored in `.claude/dua-companion/config.json`
- The status bar shows your project name (📁 project-name) so you always know which project you're viewing

**Example:**
```
Project A → http://localhost:5234/dua-companion.html
Project B → http://localhost:5456/dua-companion.html
```

Both can run at the same time without conflicts!

## UI Design

The dua companion interface is designed for focused reading:

**Viewport Frame Structure:**
- **Status Bar (Top)** — Shows live status, project name, language toggle, and close button
- **Main Content Area** — Centered dua display with Arabic text, transliteration, and translation
- **Navigation Bar (Bottom)** — Previous, Pause/Resume, Next buttons

**Focus Area:**
- The dua card is the focal point of the interface
- All controls (language, close button) are tucked into the frame edges
- Status updates happen silently in the background
- You can close the UI anytime with the ✕ button in the top-right

## Project Structure

```
dua-companion/
├── bin/dua-companion.js     # CLI entry point
├── lib/
│   ├── init.js              # Initialize projects
│   ├── remove.js            # Uninstall from projects
│   ├── server.js            # HTTP server on port 5190
│   └── merge-settings.js    # Safe settings.json merging
└── assets/
    └── dua-companion.html   # Web UI
```

## What `init` Creates

All files stay in `.claude/` — your project root stays clean. The `.claude/` directory is where Claude Code stores all configuration and extensions.

```
my-project/                  (your actual project)
├── src/
├── package.json
├── ... (all your project files)
│
└── .claude/                 (Claude Code configuration — git-ignored)
    ├── dua-companion/       (all dua-companion files here)
    │   ├── config.json      # Project port + name (auto-generated)
    │   ├── server.js        # HTTP server (starts automatically)
    │   ├── dua-companion.html # Web UI interface
    │   ├── status.json      # Working state (auto-managed)
    │   ├── .pid             # Process ID (auto-managed)
    │   └── .metadata.json   # Server metadata (auto-managed)
    │
    └── settings.json        # Claude Code config
                            # dua-companion hooks added here
                            # your other settings preserved
```

**config.json example:**
```json
{
  "port": 5234,
  "projectName": "my-project"
}
```

**Why `.claude/`?**
- ✅ Keeps project root clean
- ✅ Claude Code ignores `.claude/` from git by default
- ✅ Auto-managed by Claude Code system
- ✅ No conflicts with your project files

## Commands

### Initialize an existing project

```bash
cd ~/my-project
dua-companion init
```

This will copy all plugin files to `.claude/dua-companion/` and set up hooks in `.claude/settings.json`.

### Start/Stop

```bash
# Start the server manually
dua-companion start

# Stop the background server
dua-companion stop

# Check server status
dua-companion status
```

### Remove

```bash
dua-companion remove
```

This will:
1. Delete `.claude/dua-companion/`
2. Remove dua-companion hooks from `.claude/settings.json`
3. Leave all other settings untouched

Or stop the server without removing:

```bash
dua-companion stop
```

## Manual Installation (Advanced)

If you prefer not to install globally, you can clone into `.claude/` and run commands locally:

```bash
cd ~/my-project
mkdir -p .claude
cd .claude
git clone https://github.com/MuhammadArifurRahman/dua-companion.git
cd ..
node .claude/dua-companion/bin/dua-companion.js init
```

## Verify Installation

After running `init`, verify these files exist in your project:

```bash
# Check if files were created
ls -la .claude/dua-companion/

# Should show:
# server.js
# dua-companion.html
# status.json

# Check if hooks were added to settings
cat .claude/settings.json | grep -i dua-companion
# Should show hook definitions
```

Or simply open the project in Claude Code — dua-companion starts automatically on first use.

## Troubleshooting

**"dua-companion: command not found"**
- Make sure you ran `npm install -g .` in the dua-companion directory
- Verify: `which dua-companion`

**Can't access the UI at the port shown**
- Get the actual port: `cat .claude/dua-companion/config.json`
- Or run: `dua-companion status`
- Open: `http://localhost:PORT/dua-companion.html` where PORT is from config.json

**Files not created in `.claude/`**
- Make sure you're in your project directory: `pwd`
- Run `dua-companion init` again
- Check file permissions: `ls -la .claude/`

**Server not starting**
- Check status: `dua-companion status`
- Manually start: `dua-companion start`
- If port is in use: `lsof -i :5200-5999` to find which port is taken

**Hooks not working in Claude Code**
- Verify hooks exist: `cat .claude/settings.json | grep dua-companion`
- Check server is running: `dua-companion status`
- The UI should appear automatically on first tool use
- Try reopening the project in Claude Code
- Check that port is correct in `.claude/dua-companion/config.json`

## Requirements

- Node.js 18 or higher
- Git (for cloning repositories)
- Claude Code (any version)

## License

MIT
