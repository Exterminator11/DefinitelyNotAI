import json
import re
import os
import requests
from fastapi import APIRouter, Body
from agents.tools.sql_tools import get_schema, execute_sql

router = APIRouter()

AVAILABLE_CREWS = ["visualizer"]

OLLAMA_BASE_URL = "http://localhost:11434"
MODEL = "gpt-oss:120b-cloud"


def call_llm(prompt: str) -> str:
    """Call Ollama LLM directly."""
    print(f"\n--- Calling LLM with prompt length: {len(prompt)} chars ---")
    print(f"Prompt preview: {prompt[:200]}...")
    response = requests.post(
        f"{OLLAMA_BASE_URL}/api/generate",
        json={"model": MODEL, "prompt": prompt, "stream": False},
        timeout=120,
    )
    response.raise_for_status()
    result = response.json().get("response", "")
    print(f"--- LLM response length: {len(result)} chars ---")
    print(f"LLM response preview: {result[:200]}...")
    return result


def extract_json(text: str) -> dict:
    text = str(text).strip()

    json_match = re.search(r"\{[\s\S]*\}", text)
    if json_match:
        try:
            return json.loads(json_match.group())
        except:
            pass

    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
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


def generate_sql(query: str, schema: str) -> str:
    """Use LLM to generate SQL query from natural language."""
    prompt = f"""You are an expert in SQL and SQLite. 

Database table 'cases' has these columns:
{schema}

IMPORTANT: 
- ALWAYS use the table name 'cases' in your queries
- NEVER use any other table name like 'AI_LITIGATION' or 'ai_litigation'
- When counting by year, use: strftime('%Y', Date_Action_Filed) as year
- When counting by month, use: strftime('%Y-%m', Date_Action_Filed) as month
- Always remove NULL values from results
- Limit results to the most relevant data (e.g., top 20 for bar charts)

User query: {query}

Return ONLY the SQL query - no explanations, no markdown, no code blocks."""

    response = call_llm(prompt)
    return response.strip()


def transform_data(data: dict) -> str:
    """Use LLM to transform SQL results to chart format."""
    print(f">>> transform_data received data: {json.dumps(data)[:300]}...")
    prompt = f"""Transform this data for frontend charting.

Data format:
{json.dumps(data, indent=2)}

Transform into JSON format for Chart.js or Recharts.

Output format for bar/line charts:
{{"labels": ["label1", "label2", ...], "data": [value1, value2, ...]}}

Output format for pie/donut charts:
{{"labels": ["label1", "label2", ...], "data": [value1, value2, ...]}}

CRITICAL INSTRUCTIONS:
- Only use the data provided above - do NOT add any years or values that are not in the data
- If the data shows years 2020, 2021, 2022, 2023, 2024 - do NOT add 2025 or 2026
- Only include labels that actually exist in the data
- Do NOT infer, assume, or hallucinate any missing data points

IMPORTANT:
- Return ONLY valid JSON
- No code blocks, no markdown, no explanations
- Labels should be strings, data should be numbers"""

    response = call_llm(prompt)
    return response.strip()


@router.post("/process")
async def process_query(
    query: str = Body(..., embed=True), crew: str = Body("visualizer")
):
    print(f"\n=== STAGE 1: Received query: {query}")

    if crew not in AVAILABLE_CREWS:
        return {"error": f"Crew '{crew}' not found", "available_crews": AVAILABLE_CREWS}

    # Step 1: Get schema
    print("=== STAGE 2: Getting schema...")
    schema = get_schema()
    print(f"Schema retrieved, length: {len(schema)} chars")

    # Step 2: Generate SQL from query
    print("=== STAGE 3: Generating SQL...")
    sql_query = generate_sql(query, schema)
    print(f"Generated SQL: {sql_query}")

    # Step 3: Execute SQL
    print("=== STAGE 4: Executing SQL...")
    sql_result = execute_sql(sql_query)
    print(f"SQL result: {json.dumps(sql_result)[:500]}...")
    print(f"Full SQL result keys: {sql_result.keys()}")
    if "rows" in sql_result:
        print(f"Number of rows returned: {len(sql_result['rows'])}")
        if sql_result["rows"]:
            print(f"First few rows: {sql_result['rows'][:5]}")

    # Step 4: Transform to chart format
    print("=== STAGE 5: Transforming to chart format...")
    chart_data = transform_data(sql_result)
    print(f"Chart data raw: {chart_data[:500]}...")

    parsed = extract_json(chart_data)
    print(f"Parsed chart data: {parsed}")

    return {
        "crew": crew,
        "query": query,
        "sql_query": sql_query,
        "sql_result": sql_result,
        "data": parsed,
    }


@router.get("/crews")
async def get_crews():
    return {"crews": AVAILABLE_CREWS}
