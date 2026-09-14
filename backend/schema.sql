CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE habits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    field_definitions JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    habit_id INTEGER NOT NULL REFERENCES habits(id),
    date DATE NOT NULL,
    custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb
);
