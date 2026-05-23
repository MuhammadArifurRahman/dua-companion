# dua-companion

Islamic dua companion for Claude Code — displays duas while Claude works on your projects.

## Features

- 🕌 Islamic duas display while Claude is working
- ⚡ Automatic startup — no manual configuration needed
- 📁 Clean project root — all files in `.claude/`
- 🔗 One-command setup with git URLs
- 🛠️ Works with any Claude Code project
- 🚫 Easy removal — one command uninstalls completely

## Quick Start

### 1. Initialize an existing project

If you're already in a project directory:

```bash
cd ~/Projects/my-project
npx dua-companion init
```

This will copy all plugin files to `.claude/dua-companion/` in your current project.

### 2. Clone and initialize in one command

If you have a git repository URL:

```bash
npx dua-companion init https://github.com/MuhammadArifurRahman/dua-companion.git
```

This will:
1. Clone the repository into `./dua-companion/`
2. Copy all plugin files to `.claude/dua-companion/`
3. Initialize hooks and show next steps

## How It Works

Once initialized, dua-companion:
- Starts automatically on Claude's first tool use (no manual `start` needed)
- Displays the UI at `http://localhost:5190/dua-companion.html`
- Uses port 5190 — works with any dev server configuration
- Hooks into Claude Code's lifecycle (PreToolUse, PermissionRequest, UserPromptSubmit, Stop)

## Project Structure

```
dua-companion/
├── bin/dua-companion.js     # CLI entry point
├── lib/
│   ├── init.js              # Initialize projects + clone from git
│   ├── remove.js            # Uninstall from projects
│   ├── server.js            # HTTP server on port 5190
│   └── merge-settings.js    # Safe settings.json merging
└── assets/
    └── dua-companion.html   # Web UI
```

## What init creates

All files stay in `.claude/` — your project root stays clean:

```
.claude/
├── dua-companion/
│   └── status.json        # Working state (auto-managed)
└── settings.json          # Hooks added (existing keys untouched)
```

## Commands

### Initialize

```bash
# Current directory
npx dua-companion init

# From git URL (clones + initializes)
npx dua-companion init https://github.com/user/my-project.git
```

### Start/Stop

```bash
# Start the server manually
npx dua-companion start

# Stop the background server
npx dua-companion stop

# Check server status
npx dua-companion status
```

### Remove

```bash
npx dua-companion remove
```

This will:
1. Delete `.claude/dua-companion/`
2. Remove dua-companion hooks from `.claude/settings.json`
3. Leave all other settings untouched

Or stop the server without removing:

```bash
npx dua-companion stop
```

## Installation

Install globally:

```bash
npm install -g dua-companion
```

Or use with npx (no installation needed):

```bash
npx dua-companion init
```

## Supported Git URLs

```bash
# HTTPS
npx dua-companion init https://github.com/user/my-project.git

# SSH
npx dua-companion init git@github.com:user/my-project.git

# GitHub shorthand
npx dua-companion init https://github.com/user/my-project
```

## Requirements

- Node.js 18 or higher
- Git (for cloning repositories)

## License

MIT
