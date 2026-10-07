# Move this project to another computer

The repository contains the current source and an AES-256-GCM encrypted backup of available local environment files, databases and runtime uploads. The key is separate and is NOT stored on GitHub. Copy `Project-Transfer-Key-2026-10-07.txt` from the original computer's Documents folder to a safe place before handing over the computer.

## Restore after cloning

1. Sign in to GitHub as the repository owner and clone this repository.
2. Install Python and run `python -m pip install cryptography`.
3. From the repository root, run:

   `python transfer/restore_state.py --key-file "PATH/Project-Transfer-Key-2026-10-07.txt"`

Use `--check-only` to verify the backup without writing files. Existing files with identical content are allowed. Different existing files are protected; `--overwrite` explicitly replaces them.

4. Reinstall project dependencies (`npm ci` or `pip install -r requirements.txt`), then follow the project README/package scripts. Node packages and Python virtual environments are rebuilt, not copied.
5. Review machine-specific paths, API URLs and credentials in the restored configuration. Authentication tokens may have expired.

SQLite databases were copied using SQLite's backup API, incorporating active WAL data. Backups describe files on THIS computer on 2026-10-07; a newer production server database is not included. External PostgreSQL/Redis databases and service accounts require their existing server connection or a separate server export. Telegram bot copies should not poll the same token simultaneously.

If `transfer-drafts/` appears after restoring, it contains additional unfinished local worktree copies. The current source in the root remains the selected latest main version.
