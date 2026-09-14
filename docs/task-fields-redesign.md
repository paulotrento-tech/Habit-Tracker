I want to redesign how habits and logs store data, moving from fixed per-type columns to a flexible, user-defined field system. Here's the full scope — please do this as a sequence of safe, verifiable steps, not one big destructive change, since I have real logged data I don't want to lose.

## Current state

`logs` has fixed columns for every possible field across all habit types (`lessons_completed`, `pages_read`, `exercise_type`, `weight`, `reps`, `sets`, `miles`), plus a `completed` boolean. The frontend has a hardcoded `switch` statement (`renderLogDetails` in `HabitDetailPage.jsx`) that shows different fields depending on habit type.

## What I want instead

1. Each habit stores its own field definitions — what fields it needs beyond the always-present `date` (e.g., Running: just "miles", a number; Gym-style: "exercise_type", "weight", "reps", "sets"). When I create a habit, I want to define these custom fields myself, rather than picking from a fixed list.
2. Each log entry stores `date` as a real column, plus a flexible field for whatever custom data applies to that habit — no more one column per possible field across all habit types.
3. Remove `completed` entirely, everywhere (schema, backend, frontend) — a log entry existing means it happened; there's no separate concept of "done."
4. The "add a log" form and the log display should both be generated dynamically from the habit's stored field definitions — no hardcoded per-type logic anywhere.

## Do it in this order, and don't skip the safety steps

1. First, run `git status` and push anything currently pending, so we have a clean checkpoint before starting.
2. Add the new structure alongside the old one — don't remove or alter existing columns yet. (e.g., a new JSON/JSONB column on `logs` for custom field data, and a new column on `habits` for its field definitions.)
3. Write a one-time migration script that reads every existing log row and populates the new structure from the old columns, based on each habit's current type (duolingo/reading/exercise/running). Don't touch the old columns yet.
4. Update the backend (`models.py`, `schemas.py`, routers) to read/write the new structure for all new activity, while I verify the old data migrated correctly.
5. Update the frontend: `AddHabitPage` needs a way to define custom fields when creating a habit; `HabitDetailPage`'s log form and display need to be driven by each habit's field definitions instead of the hardcoded switch; remove the "Completed" checkbox and any reference to it.
6. Stop here and let me test everything for real — creating habits, logging entries, and confirming my existing historical logs (Duolingo, Reading, Exercise, Running) still display correctly — before doing anything destructive.
7. Only after I confirm it's all correct, remove the old now-unused columns from `logs` and `habits` as a final cleanup step.

## Out of scope

I do NOT want you to split "Gym" out of "Exercise" as part of this — that's a separate follow-up once this is done.

## Before you start

Please confirm your understanding of this plan back to me before making any changes, and use Plan mode if that's not already how you're operating.
