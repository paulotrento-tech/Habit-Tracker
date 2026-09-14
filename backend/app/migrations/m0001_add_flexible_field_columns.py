"""Run this once to add the new flexible-field columns, additively.

Does not touch any existing column or data:

    python -m app.migrations.m0001_add_flexible_field_columns
"""

from sqlalchemy import text

from ..database import engine


def run() -> None:
    with engine.begin() as conn:
        conn.execute(text(
            "ALTER TABLE habits ADD COLUMN IF NOT EXISTS field_definitions "
            "JSONB NOT NULL DEFAULT '[]'::jsonb"
        ))
        conn.execute(text(
            "ALTER TABLE logs ADD COLUMN IF NOT EXISTS custom_fields "
            "JSONB NOT NULL DEFAULT '{}'::jsonb"
        ))
    print("Added habits.field_definitions and logs.custom_fields (or they already existed).")


if __name__ == "__main__":
    run()
