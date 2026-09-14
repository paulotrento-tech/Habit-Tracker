"""One-time backfill: populate habits.field_definitions and logs.custom_fields
from the old fixed columns, based on each habit's `type`. Old columns are only
read here, never modified or dropped.

Idempotent: only touches habits still at the default `[]` field_definitions
and logs still at the default `{}` custom_fields, so re-running after new
activity has started using the new structure (post cutover) is a no-op for
that data.

Defaults to a dry run (prints what it would do, writes nothing). Pass
--commit to actually apply the updates.

    python -m app.migrations.m0002_backfill_custom_fields          # dry run
    python -m app.migrations.m0002_backfill_custom_fields --commit  # apply
"""

import argparse
import json

from sqlalchemy import text

from ..database import engine

FIELD_DEFINITIONS_BY_TYPE = {
    "duolingo": [
        {"name": "lessons_completed", "label": "Lessons Completed", "type": "integer"},
    ],
    "reading": [
        {"name": "pages_read", "label": "Pages Read", "type": "integer"},
    ],
    "exercise": [
        {"name": "exercise_type", "label": "Exercise Type", "type": "text"},
        {"name": "weight", "label": "Weight", "type": "integer"},
        {"name": "reps", "label": "Reps", "type": "integer"},
        {"name": "sets", "label": "Sets", "type": "integer"},
    ],
    "running": [
        {"name": "miles", "label": "Miles", "type": "float"},
    ],
}


def custom_fields_for_log(habit_type: str, row: dict) -> dict:
    fields: dict = {}
    if habit_type == "duolingo":
        if row["lessons_completed"] is not None:
            fields["lessons_completed"] = row["lessons_completed"]
    elif habit_type == "reading":
        if row["pages_read"] is not None:
            fields["pages_read"] = row["pages_read"]
    elif habit_type == "exercise":
        if row["exercise_type"] is not None:
            fields["exercise_type"] = row["exercise_type"]
        if row["weight"] is not None:
            fields["weight"] = row["weight"]
        if row["reps"] is not None:
            fields["reps"] = row["reps"]
        if row["sets"] is not None:
            fields["sets"] = row["sets"]
    elif habit_type == "running":
        if row["miles"] is not None:
            fields["miles"] = float(row["miles"])
    return fields


def run(commit: bool) -> None:
    with engine.begin() as conn:
        habits = conn.execute(text(
            "SELECT id, type FROM habits WHERE field_definitions = '[]'::jsonb"
        )).mappings().all()

        habit_types = {h["id"]: h["type"] for h in habits}
        skipped_types = set()
        habits_updated = 0

        for habit in habits:
            field_defs = FIELD_DEFINITIONS_BY_TYPE.get(habit["type"])
            if field_defs is None:
                skipped_types.add(habit["type"])
                continue
            habits_updated += 1
            print(f"habit {habit['id']} (type={habit['type']!r}) -> field_definitions={field_defs}")
            if commit:
                conn.execute(
                    text(
                        "UPDATE habits SET field_definitions = :fd "
                        "WHERE id = :id AND field_definitions = '[]'::jsonb"
                    ),
                    {"fd": json.dumps(field_defs), "id": habit["id"]},
                )

        logs = conn.execute(text(
            "SELECT id, habit_id, completed, lessons_completed, pages_read, "
            "exercise_type, weight, reps, sets, miles FROM logs "
            "WHERE custom_fields = '{}'::jsonb"
        )).mappings().all()

        logs_updated = 0
        for log in logs:
            habit_type = habit_types.get(log["habit_id"])
            if habit_type not in FIELD_DEFINITIONS_BY_TYPE:
                continue
            fields = custom_fields_for_log(habit_type, log)
            if not fields:
                continue
            logs_updated += 1
            if commit:
                conn.execute(
                    text(
                        "UPDATE logs SET custom_fields = :cf "
                        "WHERE id = :id AND custom_fields = '{}'::jsonb"
                    ),
                    {"cf": json.dumps(fields), "id": log["id"]},
                )

        print(f"\n{'Committed' if commit else 'Would update'} field_definitions for "
              f"{habits_updated} habits, custom_fields for {logs_updated} logs.")
        if skipped_types:
            print(f"Skipped habit types with no mapping (left as []): {sorted(skipped_types)}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--commit", action="store_true", help="Actually write changes (default is dry run)")
    args = parser.parse_args()
    run(commit=args.commit)
