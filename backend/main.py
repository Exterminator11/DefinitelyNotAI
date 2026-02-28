from fastapi import FastAPI
from routes.dashboard import router as dashboard_router
from routes.agents import router as agents_router


app = FastAPI()

@app.get("/api")
async def root():
    return {"message": "Welcome to the FastAPI backend!"}

app.include_router(dashboard_router, prefix="/api")
app.include_router(agents_router, prefix="/api/agents")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5174)