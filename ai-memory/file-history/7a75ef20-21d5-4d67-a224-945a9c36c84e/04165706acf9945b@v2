---
name: feedback-git-push
description: "User sometimes pushes to git themselves — don't assume I need to run the push"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 7a75ef20-21d5-4d67-a224-945a9c36c84e
---

The user occasionally prefers to run `git add`, `git commit`, and `git push` themselves rather than having Claude do it. They have interrupted Claude's git push commands and done it manually.

**Why:** Personal preference / workflow comfort.

**How to apply:** After making code changes and confirming the fix, offer the commit message as text and ask if they want me to commit and push, rather than running it automatically. If they've already pushed, just verify with `git log` and `git status`.
