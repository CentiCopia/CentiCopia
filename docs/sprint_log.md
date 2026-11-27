# CentiCopia — Sprint Log

The running record of CentiCopia's iterations. Planning lives on the
XP/Scrum board; this log is what actually happened, iteration by
iteration. One section per iteration: goal, dates, cards pulled in,
what finished, what carried over, and retro notes.

Seeded from the planning board on 2026-11-24.

---

## Iteration 1 — Build the Basic application ✅ Finished

- **Dates:** 2026-10-19 → 2026-10-23
- **Goal:** Build the Basic application.

### Finished

- **Data stored completely locally** (3 pts) — all data lives on the
  user's device, under their control, not in the cloud. This is the
  foundation every other card builds on.
- **Create accounts of different types with starting amounts**
  (8 pts) — Checking, Savings, Credit Card, Gift Card, Loan, etc.

### Notes

- Dependency chain established on the board: local storage is the
  root; Accounts, Categories, and Parties build on it.

---

## Week 2 — Should be able to add transactions ✅ Finished

- **Dates:** 2026-11-26 → 2026-11-28 (finished ahead of schedule;
  originally planned 2026-11-30 → 2026-12-05)
- **Goal:** Should be able to add transactions.

### Finished

- **Name matching** (5 pts) — shared duplicate / near-match checking
  for Parties, Accounts, and Categories. The account form blocks exact
  duplicates and warns on near matches.
- **Reset the app's data** (2 pts) — in-app button with typed verification;
  backup/export offered but optional.
- **Offline use** (8 pts) — installable PWA with a hand-written service
  worker and build-time precache; verified on iPhone Safari 17+ from
  `https://centicopia.pages.dev/`, including offline reload. Storage
  uses SQLite's OPFS SAHPool VFS, so it does not depend on COOP/COEP.

### Retro

(to fill in)

---

## Iteration 3 🔄 Active

- **Dates:** not set yet
- **Goal:** not set yet

### Pulled in

- **Parties** (8 pts) — add and remove parties: where money comes from
  or goes to. Only a unique name is required, so a party can be added
  on the fly; the shared name-matching rule applies.
- **Categories** (8 pts) — categorize spending; every transaction
  starts in the default category, and users can add and remove their
  own categories. Category names use the shared name-matching rule.

### Still ahead (in dependency order)

- **Add a transaction** (3 pts) — depends on Accounts ✅, local
  storage ✅, and Parties (this iteration).
- **Transfer between accounts** (5 pts), **Filter system** (8 pts),
  **Regular giving subtracted from tithe** (3 pts),
  **Export / save / sync data** (5 pts),
  **Optional extra data protection** (5 pts).

### Retro

(to fill in at the end of the iteration)
