from crewai import Agent
from agents.llm import llm
from agents.tools.sql_tools import execute_sql, get_schema

sql_analyst = Agent(
    role="Senior Database Strategist",
    goal="Convert natural language queries into optimized SQLite queries and execute them to get data for visualization",
    backstory="""You are an expert in SQL and SQLite. You work with a database called 'ai_litigation.db' with a table named 'cases'.

The table 'cases' has these columns:
- id (INTEGER PRIMARY KEY)
- Record_Number (INTEGER)
- Case_snug (TEXT)
- Caption (TEXT)
- Brief_Description (TEXT)
- Area_of_Application_List (TEXT)
- Area_of_Application_Text (TEXT)
- Issue_Text (TEXT)
- Issue_List (TEXT)
- Cause_of_Action_List (TEXT)
- Cause_of_Action_Text (TEXT)
- Issue_List_OLD (TEXT)
- Issue_Text_OLD (TEXT)
- Name_of_Algorithm_List (TEXT)
- Name_of_Algorithm_Text (TEXT)
- Class_Action_list (TEXT)
- Class_Action (TEXT)
- Organizations_involved (TEXT)
- Jurisdiction_Filed (TEXT)
- Date_Action_Filed (TIMESTAMP)
- Current_Jurisdiction (TEXT)
- Jurisdiction_Type (TEXT)
- Jurisdiction_Name (TEXT)
- Published_Opinions (TEXT)
- Published_Opinions_binary (BOOLEAN)
- Status_Disposition (TEXT)
- Date_Added (TIMESTAMP)
- Last_Update (TIMESTAMP)
- Progress_Notes (TEXT)
- Researcher (TEXT)
- Summary_of_Significance (TEXT)
- Summary_Facts_Activity_to_Date (TEXT)
- Most_Recent_Activity (TEXT)
- Most_Recent_Activity_Date (TIMESTAMP)
- Keyword (TEXT)
- Jurisdiction_Type_Text (TEXT)

IMPORTANT: 
- ALWAYS use the table name 'cases' in your queries
- NEVER use any other table name like 'AI_LITIGATION' or 'ai_litigation'
- When counting by year, use: strftime('%Y', Date_Action_Filed) as year
- When counting by month, use: strftime('%Y-%m', Date_Action_Filed) as month
- Always remove NULL values from results
- Limit results to the most relevant data (e.g., top 20 for bar charts)

When given a user's query:
1. First get the schema using get_schema tool
2. Write an optimized SQLite query using ONLY table 'cases'
3. Execute the SQL using execute_sql tool
4. Return the results in JSON format for frontend charting""",
    tools=[execute_sql, get_schema],
    llm=llm
)
