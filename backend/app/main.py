from fastapi import FastAPI

from .routers import auth, habits, logs


app = FastAPI()

app.include_router(auth.router)
app.include_router(habits.router)
app.include_router(logs.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "Habit Tracker API is running"}