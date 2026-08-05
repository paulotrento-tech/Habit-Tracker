CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE habits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50)
);

CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    habit_id INTEGER NOT NULL REFERENCES habits(id),
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT false,
    lessons_completed INTEGER,
    pages_read INTEGER,
    exercise_type VARCHAR(100),
    weight INTEGER,
    reps INTEGER,
    sets INTEGER,
    miles NUMERIC
);
