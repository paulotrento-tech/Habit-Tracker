"""Run this once (after your .env is set up) to create the tables in Postgres:

    python -m app.init_db

Later on you may want to switch to Alembic migrations, but for Phase 2 a
one-off create_all() is enough.
"""

from .database import Base, engine
from . import models  # noqa: F401  (import so models register on Base.metadata)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    print("Tables created (or already existed).")


if __name__ == "__main__":
    init_db()