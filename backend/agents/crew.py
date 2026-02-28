from crewai import Agent, Crew, Task, Process
from agents.llm import llm
from agents.agents.sql_analyst import sql_analyst
from agents.agents.data_artist import data_artist
from agents.tasks.sql_task import sql_task
from agents.tasks.visualization_task import visualization_task

visualizer_crew = Crew(
    agents=[sql_analyst, data_artist],
    tasks=[sql_task, visualization_task],
    process=Process.sequential,
    llm=llm,
    verbose=True
)
