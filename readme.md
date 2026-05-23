# dua-companion

Islamic dua companion for Claude Code — displays duas while Claude works on your projects.

## Before You Start

**All plugin files stay in `.claude/` folder** — your project root stays clean. The `.claude/` directory is Claude Code's configuration folder and won't interfere with your project files.

**Installation takes 30 seconds:**
- From git URL: `npx dua-companion init https://github.com/user/my-project.git`
- Existing project: `npx dua-companion init`

That's it! 🎉

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

## Installing from Git

The most powerful feature: **clone a project and install dua-companion in one command**. No manual folder creation or configuration needed.

### Option 1: Clone from Git URL (Recommended)

This is the simplest way to get a project set up with dua-companion:

```bash
npx dua-companion init https://github.com/user/my-project.git
```

**What happens automatically:**

1. **Clones** the repository → creates `./my-project/` directory in current location
2. **Copies plugin files** → creates `.claude/dua-companion/` inside the cloned project
3. **Adds hooks** → updates `.claude/settings.json` with dua-companion lifecycle hooks
4. **Shows next steps** → ready to open in Claude Code

**Result:**
```
~/my-location/
└── my-project/                (cloned from git)
    └── .claude/
        ├── dua-companion/     (plugin files copied here)
        │   ├── server.js
        │   ├── dua-companion.html
        │   └── status.json
        └── settings.json      (hooks added automatically)
```

### Option 2: Existing Project Directory

If the project is already cloned:

```bash
cd ~/my-project
npx dua-companion init
```

**What happens:**

1. **Copies plugin files** → creates `.claude/dua-companion/`
2. **Adds hooks** → updates `.claude/settings.json`
3. **Ready to use** → open project in Claude Code

### Option 3: Manual Git Clone + Init

If you prefer more control:

```bash
git clone https://github.com/user/my-project.git
cd my-project
npx dua-companion init
```

This is equivalent to Option 1, but you can inspect the repo before initializing.

## Supported Git URLs

```bash
# HTTPS (recommended)
npx dua-companion init https://github.com/user/my-project.git

# SSH (if you have SSH keys configured)
npx dua-companion init git@github.com:user/my-project.git

# GitHub shorthand (HTTPS without .git)
npx dua-companion init https://github.com/user/my-project
```

## Installation Checklist

When installing from git, verify these are created:

- [ ] `.claude/dua-companion/server.js` ✓
- [ ] `.claude/dua-companion/dua-companion.html` ✓
- [ ] `.claude/dua-companion/status.json` ✓
- [ ] `.claude/settings.json` contains dua-companion hooks ✓

If any files are missing, run `npx dua-companion init` again in the project directory.

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

**"Directory already exists" error**
- The clone target already exists. Remove it first or use a different directory.

**Files not created in `.claude/`**
- Make sure you ran the command from inside the project directory (or from the directory where you want to clone)
- Run `npx dua-companion init` again

**Server not starting**
- Check if port 5190 is in use: `lsof -i :5190`
- Manually start: `npx dua-companion start`
- Check status: `npx dua-companion status`

**Hooks not working in Claude Code**
- Open a project in Claude Code that has `.claude/settings.json` with dua-companion hooks
- The UI should appear automatically on first tool use

## Requirements

- Node.js 18 or higher
- Git (for cloning repositories)
- Claude Code (any version)

## License

MIT
