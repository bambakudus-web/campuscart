# Task 1: Development Environment Setup — CampusCart

**Project:** CampusCart — a buy/sell/trade marketplace for KsTU students
**Intern:** Harruna Abdul Kudus (Codveda Full-Stack Development Internship)

## Objective
Set up a full-stack development environment with Node.js, npm, a code editor, Git, and a database, ready to build the CampusCart project used across all three internship levels.

## 1. Install Node.js and npm

```bash
# Check if Node.js is already installed
node -v
npm -v

# On Ubuntu/Debian/WSL
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node -v      # e.g. v20.x.x
npm -v       # e.g. 10.x.x
```

Yarn is optional — npm ships with Node and is used throughout this project:

```bash
npm install -g yarn   # optional
yarn -v
```

## 2. Code Editor — VS Code

Downloaded and installed VS Code from https://code.visualstudio.com/. Extensions used for this project:
- ESLint
- Prettier — Code formatter
- REST Client (for quick endpoint testing without leaving the editor)
- MySQL (by Weijan Chen) — for browsing the database

## 3. Git and GitHub Setup

```bash
# Install Git
sudo apt-get install git

# Configure identity
git config --global user.name "Harruna Abdul Kudus"
git config --global user.email "your-email@example.com"

# Initialize the repo
cd campuscart
git init
git add .
git commit -m "Initial commit: project structure"

# Connect to GitHub (SSH)
git remote add origin git@github.com:bambakudus-web/campuscart.git
git branch -M main
git push -u origin main
```

Basic Git commands practiced:

| Command | Purpose |
|---|---|
| `git status` | check what's changed |
| `git add .` | stage changes |
| `git commit -m "message"` | save a snapshot |
| `git push` | send commits to GitHub |
| `git pull` | fetch latest changes |
| `git log --oneline` | view commit history |
| `git branch feature-x` | create a new branch |
| `git checkout feature-x` | switch branches |

## 4. Database — MySQL

```bash
# Install MySQL Server
sudo apt-get install mysql-server

# Start the service
sudo service mysql start

# Log in
mysql -u root -p

# Inside the MySQL shell
CREATE DATABASE campuscart_db;
CREATE USER 'campuscart_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON campuscart_db.* TO 'campuscart_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

The schema used by the API is defined in `../task2-rest-api/schema.sql`.

## 5. Basic Terminal Commands Practiced

| Command | Purpose |
|---|---|
| `pwd` | print working directory |
| `ls -la` | list files, including hidden |
| `cd folder-name` | change directory |
| `mkdir project-name` | create a folder |
| `touch file.js` | create an empty file |
| `cat file.txt` | print file contents |
| `rm -rf folder` | delete a folder recursively |
| `npm init -y` | scaffold a package.json |
| `npm install express` | install a dependency |
| `node server.js` | run a Node script |

## Environment Summary

| Tool | Version installed |
|---|---|
| Node.js | v20.x |
| npm | v10.x |
| Git | v2.4x |
| MySQL | v8.x |
| Editor | VS Code |

Environment is ready — proceeding to Task 2: building the REST API.
