# Centopia — Sprint Log

The running record of Centopia's iterations. Planning lives on the
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

## Week 2 — Should be able to add transactions 🔄 Active

- **Dates:** 2026-11-30 → 2026-12-05
- **Goal:** Should be able to add transactions.

### Finished

- **Name matching** (5 pts) — shared duplicate / near-match checking
  for Parties, Accounts, and Categories. Core helpers are in place and
  the account form warns on a near match.

### Pulled in / Ready

- **Reset the app's data** (2 pts) — reset with a strong verification
  step; backup/export offered but optional.

### Still ahead (blocked, in dependency order)

- **Parties** (8 pts) — required before transactions: every
  transaction carries a Party.
- **Add a transaction** (3 pts) — depends on Accounts ✅, local
  storage ✅, and Parties.
- **Categories** (8 pts), **Transfer between accounts** (5 pts),
  **Filter system** (8 pts), **Regular giving subtracted from
  tithe** (3 pts), **Offline use** (8 pts), **Export / save / sync
  data** (5 pts), **Optional extra data protection** (5 pts).

### Retro

(to fill in at the end of the iteration)
