import sqlite3
import os
import pandas as pd
from crewai.tools import tool

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "setup", "ai_litigation.db")

DATA_BUFFER_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data_buffer.csv")


@tool("execute_sql")
def execute_sql(query: str) -> str:
    """Execute a SQL query against the ai_litigation.db database and return the results as a formatted string."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute(query)
        rows = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description] if cursor.description else []
        
        if not rows:
            return "No results found."
        
        df = pd.DataFrame(rows, columns=columns)
        df.to_csv(DATA_BUFFER_PATH, index=False)
        
        header = " | ".join(columns)
        result_lines = [header]
        for row in rows[:10]:
            result_lines.append(" | ".join(str(v) for v in row))
        
        result_str = "\n".join(result_lines)
        return f"Results ({len(rows)} rows):\n{result_str}\n\nData saved to data_buffer.csv"
    
    except Exception as e:
        return f"Error executing query: {str(e)}"
    
    finally:
        conn.close()


@tool("get_schema")
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
            "Jurisdiction_Type_Text": "TEXT"
        }
    }
    
    lines = ["Database Schema:", "=" * 50]
    for table, cols in schema.items():
        lines.append(f"\nTable: {table}")
        for col, dtype in cols.items():
            lines.append(f"  - {col}: {dtype}")
    
    return "\n".join(lines)
