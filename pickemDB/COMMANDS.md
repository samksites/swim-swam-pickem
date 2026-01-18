# Terminal Commands Reference - Swim-Swam Pick'em

This file contains helpful terminal commands for managing the Swim-Swam Pick'em project.

## Database Commands

### PostgreSQL Database Management
```bash
# Connect to PostgreSQL (using credentials from .env)


# Stop sql server
brew services stop postgresql@17

# Start sql server
brew services start postgresql@17

# Login to my db
psql -U samks -d swimswam

---

