# Deploying Paperclip on aios

Paperclip runs natively on the `aios` macOS host as a `launchd` user agent. It uses embedded PostgreSQL (no system Postgres needed) and serves the UI on `localhost:3100`.

## Service Details

| Setting | Value |
|---------|-------|
| Host | `aios` (ai_os.local) |
| Service label | `com.mpired.paperclip` |
| Plist | `~/Library/LaunchAgents/com.mpired.paperclip.plist` |
| Working directory | `/Users/martin/Workspace/MPired/paperclip` |
| URL | `http://localhost:3100` |
| API health | `http://localhost:3100/api/health` |
| Database | Embedded PostgreSQL on port 54329 |
| DB data | `~/.paperclip/instances/default/db` |
| DB backups | `~/.paperclip/instances/default/data/backups` |
| Log file | `~/Library/Logs/paperclip.log` |

## Behavior

- **Starts on boot** via `RunAtLoad`
- **Restarts on crash** via `KeepAlive`
- Binds to `127.0.0.1:3100` (localhost only — no remote access)

## Managing the Service

```bash
# Check status
launchctl list | grep paperclip

# Stop
launchctl stop com.mpired.paperclip

# Start
launchctl start com.mpired.paperclip

# Disable (won't start on boot)
launchctl unload ~/Library/LaunchAgents/com.mpired.paperclip.plist

# Re-enable
launchctl load ~/Library/LaunchAgents/com.mpired.paperclip.plist

# View logs
tail -f ~/Library/Logs/paperclip.log
```

## Updating

After merging upstream sync PRs or pulling new changes:

```bash
launchctl stop com.mpired.paperclip
cd ~/Workspace/MPired/paperclip
git pull
pnpm install
pnpm db:migrate
launchctl start com.mpired.paperclip
```

## Accessing Remotely

The server only listens on localhost. To access from another machine, use an SSH tunnel:

```bash
ssh -L 3100:localhost:3100 aios
# Then open http://localhost:3100 in your browser
```
