from fastapi import FastAPI

from .routers import auth, habits, logs

from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(habits.router)
app.include_router(logs.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "Habit Tracker API is running"}