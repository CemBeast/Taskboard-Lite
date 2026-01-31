# .gitignore Cheat Sheet

Quick reference for checking and managing `.gitignore` files.

## 📋 Check if .gitignore Exists

### Method 1: List hidden files (Terminal)
```bash
ls -la
# Look for .gitignore in the output
```

### Method 2: Check if file exists
```bash
test -f .gitignore && echo "✅ .gitignore exists" || echo "❌ .gitignore not found"
```

### Method 3: Try to read it
```bash
cat .gitignore
# Shows contents if it exists, error if it doesn't
```

## 📝 View .gitignore Contents

### See the full file
```bash
cat .gitignore
```

### See with line numbers
```bash
cat -n .gitignore
```

### Search for a specific file/pattern
```bash
grep "aiAgent.js" .gitignore
```

## 🔍 Check if a File is Being Ignored

### Method 1: Check specific file
```bash
git check-ignore -v KanbanBoard/aiAgent.js
```

**Output explanation:**
- If ignored: Shows `.gitignore:2:KanbanBoard/aiAgent.js` (the rule and line number)
- If NOT ignored: No output (means file is tracked!)

### Method 2: See all ignored files
```bash
git status --ignored
```

### Method 3: List ignored files in current directory
```bash
git status --ignored --short | grep "!!"
```

## ✏️ Edit .gitignore

### Using nano (beginner-friendly)
```bash
nano .gitignore
# Edit, then press: Ctrl+X → Y → Enter to save
```

### Using vim
```bash
vim .gitignore
# Press 'i' to edit, 'Esc' then ':wq' to save and quit
```

### Using VS Code
```bash
code .gitignore
```

### Using any text editor (macOS)
```bash
open .gitignore
```

## ➕ Add a File to .gitignore

### Append a single file
```bash
echo "KanbanBoard/aiAgent.js" >> .gitignore
```

### Append a pattern
```bash
echo "*.log" >> .gitignore
```

### Add multiple lines at once
```bash
cat >> .gitignore << EOF
# API Keys
config/secrets.json
.env

# Build files
dist/
build/
EOF
```

## 🧪 Test Your .gitignore

### Test if a file would be ignored
```bash
git check-ignore filename.txt
# Returns filename if ignored, nothing if not ignored
```

### Test with explanation
```bash
git check-ignore -v filename.txt
# Shows which rule is ignoring it and from which file
```

### Test multiple files
```bash
git check-ignore file1.txt file2.txt folder/file3.txt
```

## 🚨 Fix: File Already Committed Before .gitignore

If you added a file to `.gitignore` but it was already committed:

### Remove from Git but keep local file
```bash
git rm --cached path/to/file.js
git commit -m "Stop tracking file.js"
```

### Remove folder from Git but keep locally
```bash
git rm -r --cached path/to/folder/
git commit -m "Stop tracking folder"
```

## 🔐 Common Patterns for API Keys

```gitignore
# API Keys and Secrets
*.key
*.pem
.env
.env.local
config/secrets.json
**/apiKeys.js
**/apiKeys.ts

# Specific files
backend/config/keys.js
frontend/src/config/api.js
```

## 📂 Where to Put .gitignore

### Repository root (most common)
```
my-project/
├── .gitignore          ← Here
├── src/
├── package.json
└── README.md
```

### You can also have multiple .gitignore files
```
my-project/
├── .gitignore          ← Root level (applies to whole project)
├── frontend/
│   └── .gitignore      ← Frontend specific
└── backend/
    └── .gitignore      ← Backend specific
```

## 🎯 Quick Verification Checklist

For any sensitive file (like API keys), verify:

```bash
# 1. Check if .gitignore exists
ls -la | grep .gitignore

# 2. Check if file is in .gitignore
grep "yourfile.js" .gitignore

# 3. Check if Git is ignoring it
git check-ignore -v yourfile.js

# 4. Check if it's in Git history
git log --all --full-history -- yourfile.js

# 5. Check current status
git status --ignored
```

## ⚡ Quick Commands

```bash
# View .gitignore
cat .gitignore

# Check if specific file is ignored
git check-ignore -v path/to/file

# See all ignored files
git status --ignored

# Add file to .gitignore
echo "path/to/file" >> .gitignore

# Test .gitignore before committing
git check-ignore -v $(git ls-files -o)
```

## 🎓 Pro Tips

1. **Comment your .gitignore**: Use `#` to explain why files are ignored
   ```gitignore
   # API Keys - Never commit these!
   config/api-keys.js
   ```

2. **Use patterns**: Instead of listing every file
   ```gitignore
   *.log           # Ignores all .log files
   build/          # Ignores entire build directory
   secrets-*.json  # Ignores secrets-dev.json, secrets-prod.json, etc.
   ```

3. **Negate patterns**: Use `!` to NOT ignore something
   ```gitignore
   *.log          # Ignore all logs
   !important.log # But keep this one
   ```

4. **Check before committing**:
   ```bash
   git status --ignored
   git check-ignore -v $(git ls-files -o)
   ```

## 🆘 Common Issues

### "I added to .gitignore but Git still tracks it"
**Solution:** The file was already tracked. Remove it:
```bash
git rm --cached filename
git commit -m "Remove file from tracking"
```

### "My .gitignore isn't working"
**Checks:**
1. Is `.gitignore` in the right location? (Usually repository root)
2. Are you using the correct path? (relative to .gitignore location)
3. Was the file already tracked? (use `git rm --cached`)
4. Check for syntax errors: `git check-ignore -v filename`

### "I need to see .gitignore in Finder/Explorer"
**macOS:**
```bash
# Show hidden files
defaults write com.apple.finder AppleShowAllFiles -bool true
killall Finder
```

**Windows:** File Explorer → View → Show hidden files

**VS Code:** Already shows hidden files by default

---

Save this file for future reference! 📌

