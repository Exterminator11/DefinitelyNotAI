from crewai import Task
from ..agents.data_artist import data_artist

visualization_task = Task(
    description="""Transform the data for frontend charting.

The data has been fetched and saved to data_buffer.csv.
Read the CSV file and transform the data into JSON format for Chart.js or Recharts.

Output format for bar/line charts:
{"labels": ["label1", "label2", ...], "data": [value1, value2, ...]}

Output format for pie/donut charts:
{"labels": ["label1", "label2", ...], "data": [value1, value2, ...]}

IMPORTANT:
- Return ONLY valid JSON
- No code blocks, no markdown, no explanations
- Labels should be strings, data should be numbers""",
    agent=data_artist,
    expected_output="JSON format: {\"labels\": [...], \"data\": [...]} ready for Chart.js/Recharts"
)
