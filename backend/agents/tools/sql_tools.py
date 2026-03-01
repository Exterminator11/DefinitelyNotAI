import sqlite3
import os
import json

DB_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "setup",
    "ai_litigation.db",
)

SQL_RESULTS_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "sql_results.json"
)


def get_schema() -> str:
    """Get the schema of the cases table for reference."""
    schema = {
        "cases": {
            "id": "INTEGER PRIMARY KEY",
            "Record_Number": "INTEGER",
            "Case_snug": "TEXT",
            "Caption": "TEXT",
            "Brief_Description": "TEXT",
            "Area_of_Application_List": "TEXT",
            "Area_of_Application_Text": "TEXT",
            "Issue_Text": "TEXT",
            "Issue_List": "TEXT",
            "Cause_of_Action_List": "TEXT",
            "Cause_of_Action_Text": "TEXT",
            "Issue_List_OLD": "TEXT",
            "Issue_Text_OLD": "TEXT",
            "Name_of_Algorithm_List": "TEXT",
            "Name_of_Algorithm_Text": "TEXT",
            "Class_Action_list": "TEXT",
            "Class_Action": "TEXT",
            "Organizations_involved": "TEXT",
            "Jurisdiction_Filed": "TEXT",
            "Date_Action_Filed": "TIMESTAMP",
            "Current_Jurisdiction": "TEXT",
            "Jurisdiction_Type": "TEXT",
            "Jurisdiction_Name": "TEXT",
            "Published_Opinions": "TEXT",
            "Published_Opinions_binary": "BOOLEAN",
            "Status_Disposition": "TEXT",
            "Date_Added": "TIMESTAMP",
            "Last_Update": "TIMESTAMP",
            "Progress_Notes": "TEXT",
            "Researcher": "TEXT",
            "Summary_of_Significance": "TEXT",
            "Summary_Facts_Activity_to_Date": "TEXT",
            "Most_Recent_Activity": "TEXT",
            "Most_Recent_Activity_Date": "TIMESTAMP",
            "Keyword": "TEXT",
            "Jurisdiction_Type_Text": "TEXT",
        }
    }

    lines = ["Database Schema:", "=" * 50]
    for table, cols in schema.items():
        lines.append(f"\nTable: {table}")
        for col, dtype in cols.items():
            lines.append(f"  - {col}: {dtype}")

    return "\n".join(lines)


def execute_sql(query: str) -> dict:
    """Execute a SQL query against the ai_litigation.db database and return results as dict."""
    print(f"\n>>> execute_sql called with query: {query}")
    print(f">>> DB_PATH: {DB_PATH}")
    print(f">>> SQL_RESULTS_FILE: {SQL_RESULTS_FILE}")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        cursor.execute(query)
        rows = cursor.fetchall()
        print("\n\n\n\n")
        print(rows)
        print("\n\n\n\n")
        columns = [desc[0] for desc in cursor.description] if cursor.description else []

        print(f">>> Query returned {len(rows)} rows")

        if not rows:
            return {"columns": [], "rows": [], "message": "No results found."}

        result = {"columns": columns, "rows": [list(row) for row in rows]}

        with open(SQL_RESULTS_FILE, "w") as f:
            json.dump(result, f)

        print(f">>> File written to {SQL_RESULTS_FILE}")
        return result

    except Exception as e:
        import traceback

        traceback.print_exc()
        return {"error": str(e)}

    finally:
        conn.close()


def read_sql_results() -> dict:
    """Read the SQL results from the JSON file."""
    if not os.path.exists(SQL_RESULTS_FILE):
        return {"error": "No data file found"}

    with open(SQL_RESULTS_FILE, "r") as f:
        data = json.load(f)

    return data
