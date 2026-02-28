import os
from crewai import LLM
from dotenv import load_dotenv

load_dotenv()

MODEL = "gpt-oss:120b-cloud"
BASE_URL = "http://localhost:11434"
API_KEY = os.getenv("OLLAMA_API_KEY")

llm = LLM(
    model=f"ollama/{MODEL}",
    base_url=BASE_URL,
    api_key=API_KEY
)
