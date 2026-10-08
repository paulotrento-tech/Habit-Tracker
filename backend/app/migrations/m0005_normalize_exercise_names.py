"""One-time cleanup: normalize the free-text `exercise` value stored in each
Gym log's custom_fields to a canonical name, using the EXERCISE_NAME_MAP
dictionary below.

Workflow:
  1. Run with no flags. This always prints every distinct `exercise` value
     currently stored under Gym logs, with counts, and nothing is written.
  2. Fill in EXERCISE_NAME_MAP below with alias -> canonical name entries
     based on that output (keys are matched case-insensitively/trimmed).
  3. Re-run with no flags to preview exactly which logs would change, and
     check the "unmapped" list for anything you missed.
  4. Run with --commit to apply.

Values with no entry in EXERCISE_NAME_MAP are left untouched and reported
as unmapped rather than guessed at. Safe to re-run at any time (idempotent
and re-runnable as new aliases show up).

    python -m app.migrations.m0005_normalize_exercise_names            # dry run
    python -m app.migrations.m0005_normalize_exercise_names --commit   # apply
"""

import argparse
import json
from collections import Counter

from sqlalchemy import text

from ..database import engine

# Alias (case-insensitive, trimmed) -> canonical display name.
# Fill this in after the first dry run shows you the actual distinct values.
#
# Intentionally left separate (not merged) despite similar names:
#   - Cable Triceps Elbow / Cable Triceps Bar / Cable Triceps Rope (different attachments/movements)
#   - Cable Rope Curls / Cable Bar Curls (different attachments)
EXERCISE_NAME_MAP: dict[str, str] = {
    "Barbell Bench": "Bar Bench",
    "Cable Row": "Cable Rows",
    "Seated Cable Rows": "Cable Rows",
    "Lat Pull Down": "Lat Pull Downs",
    "One-Arm Cable Rows": "One-Arm Cable Row",
    "One Arm Seated Cable Rows": "One-Arm Cable Row",
    "Hammer Curls": "Dumbbell Hammer Curls",
    "Bent Over Bar Row": "Barbell Row",
    "Bar Incline Bench": "Incline Barbell Bench",
    "Squats": "Bar Squats",
    "Bar Cable Triceps": "Cable Triceps Bar",
}


def _normalized_map() -> dict[str, str]:
    return {alias.strip().lower(): canonical for alias, canonical in EXERCISE_NAME_MAP.items()}


def run(commit: bool) -> None:
    name_map = _normalized_map()

    with engine.begin() as conn:
        logs = conn.execute(text(
            "SELECT id, custom_fields FROM logs "
            "WHERE habit_id IN (SELECT id FROM habits WHERE type = 'gym')"
        )).mappings().all()

        counts = Counter()
        for log in logs:
            value = log["custom_fields"].get("exercise")
            if value is not None:
                counts[value] += 1

        print("Distinct exercise values currently stored (value: count):")
        for value, count in counts.most_common():
            print(f"  {value!r}: {count}")
        print()

        changed, already_canonical, unmapped = [], [], set()
        for log in logs:
            cf = log["custom_fields"]
            value = cf.get("exercise")
            if value is None:
                continue

            canonical = name_map.get(value.strip().lower())
            if canonical is None:
                unmapped.add(value)
            elif canonical != value:
                changed.append((log["id"], value, canonical))
                print(f"log {log['id']}: {value!r} -> {canonical!r}")
                if commit:
                    new_cf = dict(cf)
                    new_cf["exercise"] = canonical
                    conn.execute(
                        text("UPDATE logs SET custom_fields = :cf WHERE id = :id"),
                        {"cf": json.dumps(new_cf), "id": log["id"]},
                    )
            else:
                already_canonical.append(log["id"])

        print()
        print(f"Summary: {len(changed)} changed, {len(already_canonical)} already canonical, "
              f"{len(unmapped)} unmapped distinct value(s)")
        if unmapped:
            print(f"  unmapped values (left untouched): {sorted(unmapped)}")

        print(f"\n{'Committed' if commit else 'Dry run only, nothing written'}.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--commit", action="store_true", help="Actually write changes (default is dry run)")
    args = parser.parse_args()
    run(commit=args.commit)
