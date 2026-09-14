"""Final cleanup: drop the old fixed log columns now that custom_fields has
been verified in production. Irreversible — only run after explicit
confirmation and once the new structure has been confirmed working end to
end (schema.sql should also be updated to match, by hand, alongside this).

Nothing is dropped from habits (`type` stays; `field_definitions` was
purely additive).

    python -m app.migrations.m0003_drop_legacy_log_columns
"""

from sqlalchemy import text

from ..database import engine

LEGACY_LOG_COLUMNS = [
    "completed",
    "lessons_completed",
    "pages_read",
    "exercise_type",
    "weight",
    "reps",
    "sets",
    "miles",
]


def run() -> None:
    drops = ", ".join(f"DROP COLUMN IF EXISTS {col}" for col in LEGACY_LOG_COLUMNS)
    with engine.begin() as conn:
        conn.execute(text(f"ALTER TABLE logs {drops}"))
    print(f"Dropped legacy columns from logs: {', '.join(LEGACY_LOG_COLUMNS)}")


if __name__ == "__main__":
    run()
