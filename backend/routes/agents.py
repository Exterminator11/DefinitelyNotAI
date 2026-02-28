import json
import re
from fastapi import APIRouter, Body
from agents.crew import visualizer_crew

router = APIRouter()

CREWS = {
    "visualizer": visualizer_crew
}

AVAILABLE_CREWS = list(CREWS.keys())


def extract_json(text: str) -> dict:
    text = str(text).strip()
    
    json_match = re.search(r'\{[\s\S]*\}', text)
    if json_match:
        try:
            return json.loads(json_match.group())
        except:
            pass
    
    if text.startswith('```'):
        text = text.split('```')[1]
        if text.startswith('json'):
            text = text[4:]
        text = text.strip()
        try:
            return json.loads(text)
        except:
            pass
    
    try:
        return json.loads(text)
    except:
        return {"raw": text}


@router.post("/process")
async def process_query(
    query: str = Body(..., embed=True),
    crew: str = Body("visualizer")
):
    if crew not in CREWS:
        return {
            "error": f"Crew '{crew}' not found",
            "available_crews": AVAILABLE_CREWS
        }
    
    result = CREWS[crew].kickoff(inputs={"query": query})
    
    parsed = extract_json(result)
    
    return {
        "crew": crew,
        "query": query,
        "data": parsed
    }


@router.get("/crews")
async def get_crews():
    return {"crews": AVAILABLE_CREWS}
