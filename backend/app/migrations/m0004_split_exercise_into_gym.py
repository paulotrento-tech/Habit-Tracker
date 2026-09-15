"""One-time split: move gym-workout-shaped logs off any `type=exercise`
habit into a new `Gym` habit, and trim the Exercise habit's fields down to
just Exercise Type.

A log is "gym-shaped" if its custom_fields has any of weight/reps/sets.
Everything else stays on Exercise (with exercise_type whitespace-trimmed).
Logs that don't cleanly fit either shape are reported and left untouched.

Idempotent: reuses an existing (user_id, name="Gym", type="gym") habit
instead of creating a duplicate on re-run, and only touches logs still
under the exercise habit.

Defaults to a dry run (prints what it would do, writes nothing). Pass
--commit to actually apply the updates.

    python -m app.migrations.m0004_split_exercise_into_gym            # dry run
    python -m app.migrations.m0004_split_exercise_into_gym --commit   # apply
"""

import argparse
import json

from sqlalchemy import text

from ..database import engine

GYM_FIELD_DEFINITIONS = [
    {"name": "exercise", "label": "Exercise", "type": "text"},
    {"name": "weight", "label": "Weight", "type": "float"},
    {"name": "reps", "label": "Reps", "type": "integer"},
    {"name": "sets", "label": "Sets", "type": "integer"},
]

EXERCISE_FIELD_DEFINITIONS = [
    {"name": "exercise_type", "label": "Exercise Type", "type": "text"},
]


def is_gym_shaped(custom_fields: dict) -> bool:
    return any(k in custom_fields for k in ("weight", "reps", "sets"))


def run(commit: bool) -> None:
    with engine.begin() as conn:
        exercise_habits = conn.execute(text(
            "SELECT id, user_id FROM habits WHERE type = 'exercise'"
        )).mappings().all()

        for habit in exercise_habits:
            logs = conn.execute(
                text("SELECT id, custom_fields FROM logs WHERE habit_id = :habit_id"),
                {"habit_id": habit["id"]},
            ).mappings().all()

            stay, move, unrecognized = [], [], []
            for log in logs:
                cf = log["custom_fields"]
                if is_gym_shaped(cf):
                    move.append(log)
                elif "exercise_type" in cf:
                    stay.append(log)
                else:
                    unrecognized.append(log)

            print(f"habit {habit['id']} (user {habit['user_id']}): "
                  f"{len(stay)} stay, {len(move)} move, {len(unrecognized)} unrecognized")
            if unrecognized:
                print(f"  unrecognized log ids (left untouched): {[r['id'] for r in unrecognized]}")

            for log in stay:
                cf = log["custom_fields"]
                trimmed = cf["exercise_type"].strip()
                if trimmed != cf["exercise_type"]:
                    print(f"  log {log['id']}: trim exercise_type {cf['exercise_type']!r} -> {trimmed!r}")
                    if commit:
                        conn.execute(
                            text("UPDATE logs SET custom_fields = :cf WHERE id = :id"),
                            {"cf": json.dumps({"exercise_type": trimmed}), "id": log["id"]},
                        )

            if not move:
                if commit:
                    conn.execute(
                        text("UPDATE habits SET field_definitions = :fd WHERE id = :id"),
                        {"fd": json.dumps(EXERCISE_FIELD_DEFINITIONS), "id": habit["id"]},
                    )
                continue

            gym_habit = conn.execute(
                text(
                    "SELECT id FROM habits WHERE user_id = :uid AND name = 'Gym' AND type = 'gym'"
                ),
                {"uid": habit["user_id"]},
            ).first()

            if gym_habit:
                gym_habit_id = gym_habit[0]
                print(f"  reusing existing Gym habit {gym_habit_id}")
            else:
                print(f"  would create Gym habit for user {habit['user_id']} "
                      f"with field_definitions={GYM_FIELD_DEFINITIONS}")
                gym_habit_id = None
                if commit:
                    result = conn.execute(
                        text(
                            "INSERT INTO habits (user_id, name, type, field_definitions) "
                            "VALUES (:uid, 'Gym', 'gym', :fd) RETURNING id"
                        ),
                        {"uid": habit["user_id"], "fd": json.dumps(GYM_FIELD_DEFINITIONS)},
                    )
                    gym_habit_id = result.scalar_one()

            for log in move:
                cf = log["custom_fields"]
                new_cf = {"exercise": cf.get("exercise_type")}
                for key in ("weight", "reps", "sets"):
                    if key in cf:
                        new_cf[key] = cf[key]
                if commit:
                    conn.execute(
                        text(
                            "UPDATE logs SET habit_id = :habit_id, custom_fields = :cf "
                            "WHERE id = :id"
                        ),
                        {"habit_id": gym_habit_id, "cf": json.dumps(new_cf), "id": log["id"]},
                    )

            if commit:
                conn.execute(
                    text("UPDATE habits SET field_definitions = :fd WHERE id = :id"),
                    {"fd": json.dumps(EXERCISE_FIELD_DEFINITIONS), "id": habit["id"]},
                )

        print(f"\n{'Committed' if commit else 'Dry run only, nothing written'}.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--commit", action="store_true", help="Actually write changes (default is dry run)")
    args = parser.parse_args()
    run(commit=args.commit)
