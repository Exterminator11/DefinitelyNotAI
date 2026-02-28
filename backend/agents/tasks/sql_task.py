from crewai import Task
from ..agents.sql_analyst import sql_analyst

sql_task = Task(
    description="""Execute the following user query for data visualization:
{query}

Steps:
1. Get the database schema using get_schema tool
2. Write an optimized SQLite query to answer the user's question
3. Execute the SQL using execute_sql tool
4. Return the SQL query and results with a 5-row sample""",
    agent=sql_analyst,
    expected_output="SQL query executed with results, including a 5-row sample of the data"
)
