# dua-companion

Islamic dua companion for Claude Code — displays duas while Claude works on your projects.

## Features

- 🕌 Islamic duas display while Claude is working
- ⚡ Automatic startup — no manual configuration needed
- 📁 Clean project root — all files in `.claude/`
- 🛠️ Works with any Claude Code project
- 🚫 Easy removal — one command uninstalls completely

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
- Displays the UI at `http://localhost:5190/dua-companion.html`
- Uses port 5190 — works with any dev server configuration
- Hooks into Claude Code's lifecycle (PreToolUse, PermissionRequest, UserPromptSubmit, Stop)

**Port Sharing:**
- Only one dua-companion instance can run on port 5190 at a time
- If you try to start it in another project while one is running, you'll see:
  ```
  ⚠️  Port 5190 is already in use by dua-companion in:
     /path/to/other-project
  
  You can only run dua-companion in one project at a time.
  Stop the other instance with: dua-companion stop
  ```
- Use `dua-companion stop` to cleanly stop the current instance
- Use `dua-companion status` to see which project is currently running

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
    │   ├── server.js        # HTTP server (starts automatically)
    │   ├── dua-companion.html # Web UI interface
    │   └── status.json      # Working state (auto-managed)
    │
    └── settings.json        # Claude Code config
                            # dua-companion hooks added here
                            # your other settings preserved
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

**"Port 5190 is already in use" error**
- Another dua-companion instance is running in a different project
- Check which project: `dua-companion status`
- Stop it: `dua-companion stop`
- Then start a new instance in your project

**Files not created in `.claude/`**
- Make sure you're in your project directory: `pwd`
- Run `dua-companion init` again
- Check file permissions: `ls -la .claude/`

**Server not starting**
- Check port status: `dua-companion status`
- If running elsewhere, stop it first: `dua-companion stop`
- Manually start: `dua-companion start`

**Hooks not working in Claude Code**
- Verify hooks exist: `cat .claude/settings.json | grep dua-companion`
- Check server is running: `dua-companion status`
- The UI should appear automatically on first tool use
- Try reopening the project in Claude Code

## Requirements

- Node.js 18 or higher
- Git (for cloning repositories)
- Claude Code (any version)

## License

MIT
