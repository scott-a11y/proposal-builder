# Quick Start: Using the Rebuild Process

This guide helps you understand how the new PR blocking and rebuild process works.

---

## What Changed?

Three new mechanisms are now in place to ensure quality during the rebuild:

### 1. 🛡️ CODEOWNERS (`.github/CODEOWNERS`)
**What it does**: Requires @scott-a11y to approve ALL pull requests  
**Why**: Prevents unauthorized or out-of-scope changes during rebuild  
**How to use**: Nothing required - GitHub automatically requests review

### 2. 📋 Rebuild Process (`REBUILD_PROCESS.md`)
**What it does**: Defines 6-week phased rebuild plan with acceptance criteria  
**Why**: Provides structured approach instead of incremental patches  
**How to use**: Read this document BEFORE creating any PR

### 3. ⚠️ Contributing Policy (`CONTRIBUTING.md`)
**What it does**: Makes it clear that only rebuild-related PRs are accepted  
**Why**: Sets expectations for all contributors  
**How to use**: Read the warning section at the top

---

## For Contributors

### ❌ These PRs Will Be REJECTED:
- Bug fixes that don't follow the rebuild plan
- New features added to existing codebase
- Incremental improvements or patches
- Documentation that doesn't relate to rebuild

### ✅ These PRs Will Be REVIEWED:
- Changes that implement a specific phase from `REBUILD_PROCESS.md`
- Critical security fixes (with prior approval)
- Documentation updates related to rebuild
- Changes that follow the PR template in `REBUILD_PROCESS.md`

### How to Create a Valid PR:

1. **Read the rebuild plan**: `REBUILD_PROCESS.md`
2. **Choose a phase**: Pick an unclaimed phase (1-5)
3. **Coordinate**: Comment on the rebuild issue to claim work
4. **Follow the template**: Use the PR template from `REBUILD_PROCESS.md`
5. **Include checklist**: Map your changes to acceptance criteria
6. **Provide evidence**: Screenshots, test results, staging URL
7. **Wait for review**: @scott-a11y will review and approve/request changes

---

## For the Repository Owner (@scott-a11y)

### Next Steps to Activate Full Protection:

1. **Enable Branch Protection** (in GitHub Settings):
   ```
   Settings → Branches → Add branch protection rule
   Branch name pattern: main
   
   Enable:
   ☑ Require a pull request before merging
   ☑ Require approvals: 1
   ☑ Dismiss stale pull request approvals when new commits are pushed
   ☑ Require review from Code Owners
   ☑ Require conversation resolution before merging
   ☑ Require linear history (optional)
   ☑ Include administrators (optional but recommended)
   ```

2. **Review the Rebuild Plan**:
   - Open `REBUILD_PROCESS.md`
   - Adjust timeline if needed
   - Modify phases based on priorities
   - Approve or edit the architecture decision

3. **Communicate to Stakeholders**:
   - Announce rebuild plan in GitHub Discussions
   - Set expectations with users
   - Notify any active contributors

4. **Prepare for Phase 1**:
   - Create `rebuild/v1` branch
   - Set up staging environment (if desired)
   - Review and approve Phase 1 plan

### How to Review PRs During Rebuild:

Use this checklist for every PR:

- [ ] PR title follows format: `Rebuild Phase N: [Description]`
- [ ] PR references `REBUILD_PROCESS.md` and specific phase
- [ ] Acceptance criteria checklist is complete
- [ ] All automated tests pass
- [ ] Manual testing evidence provided (screenshots/videos)
- [ ] No scope creep or unrelated changes
- [ ] Migration notes included (if applicable)
- [ ] Documentation is updated
- [ ] Staging deployment works (if applicable)
- [ ] No console errors demonstrated

**If any item is missing**: Request changes with specific feedback

**If all items pass**: Approve and merge

---

## For Copilot Agents / Bots

If you are an automated system (Copilot Agent, Dependabot, etc.):

1. **Read** `REBUILD_PROCESS.md` to understand the current phase
2. **Only create PRs** that align with the active phase
3. **Use the PR template** provided in `REBUILD_PROCESS.md`
4. **Do NOT** create PRs for:
   - Incremental bug fixes
   - Dependency updates (unless critical security)
   - Code style changes
   - Refactoring unrelated to rebuild

5. **Always include**:
   - Which phase your PR addresses
   - Acceptance criteria checklist
   - Test results
   - How it fits the rebuild plan

---

## Blocking a Non-Compliant PR

If someone opens a PR that doesn't follow the rebuild plan:

### Template Response:
```markdown
Thank you for your contribution! However, this repository is currently undergoing a systematic rebuild.

**This PR does not align with the official rebuild plan.**

Please review:
- [REBUILD_PROCESS.md](./REBUILD_PROCESS.md) - Official rebuild phases
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Current contribution policy
- [FREEZE.md](./FREEZE.md) - Freeze status and rationale

### To proceed:
1. Review the rebuild plan
2. Identify which phase your change addresses
3. Follow the PR template in REBUILD_PROCESS.md
4. Coordinate with @scott-a11y before resubmitting

### Actions Required:
- [ ] Close this PR
- [ ] Review rebuild documentation
- [ ] Open new PR following the rebuild plan (if applicable)

**Labels**: `out-of-scope`, `rebuild-required`, `needs-response`
```

---

## FAQ

**Q: When will the freeze be lifted?**  
A: When all phases in `REBUILD_PROCESS.md` are complete and verified stable.

**Q: Can I contribute during the rebuild?**  
A: Yes! Follow the phases in `REBUILD_PROCESS.md` and coordinate with the maintainer.

**Q: What if I found a critical bug?**  
A: Report it as an issue with the `urgent` label. Critical security fixes may be accepted outside the rebuild plan.

**Q: Why can't we just fix things incrementally?**  
A: 70+ incremental changes were made without resolving root causes. A systematic rebuild is more reliable.

**Q: How long will this take?**  
A: Estimated 6 weeks based on the phased plan. May adjust based on complexity and resources.

**Q: What happens to existing PRs?**  
A: They will be reviewed for alignment with the rebuild plan. Non-compliant PRs will be closed with guidance.

---

## Summary

- ✅ CODEOWNERS ensures human review
- ✅ REBUILD_PROCESS.md provides structured plan
- ✅ CONTRIBUTING.md sets clear expectations
- ✅ Only rebuild-aligned PRs will be merged
- ✅ Branch protection recommended for full enforcement

**Read** → **Plan** → **Coordinate** → **Execute** → **Review** → **Merge**

---

**Questions?** Open a GitHub Discussion or comment on the rebuild issue.
