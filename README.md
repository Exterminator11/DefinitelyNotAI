# OpenDAIL

OpenDAIL is a web application for analyzing and exploring AI litigation cases from the DAIL database. It combines a FastAPI backend with a React frontend to provide AI-powered querying, interactive charts, and comprehensive case management.

## Features

### AI-Powered Query Interface
- Natural language to SQL conversion using Ollama LLM(Uses gpt oss 120B which is open source)
- Ask questions about case data in plain English
- Automatic SQL query generation and execution
- Results transformed into chart-ready formats

### Interactive Dashboard
- Real-time charts and visualizations using Recharts
- Temporal analysis of case data
- Multiple chart types: bar, line, pie, and donut charts
- Summary statistics and lifecycle analysis

### AI Chat Interface
- Conversational interface for querying case data
- Real-time responses with streaming indicators
- Inline chart rendering from query results
- Natural language interaction with the database

### Case Management
- Browse all cases in a searchable table view
- Advanced filtering by multiple columns
- Date range filtering for temporal queries
- Collapsible filter panel for easy access

### Detailed Case View
- Comprehensive case information display
- Case overview and significance summary
- Metadata: jurisdiction, dates, status, researcher
- Classifications: areas of application, issues, causes of action, algorithms
- Secondary sources with external links

### Diagrams & Statistics
- Generate filtered statistics and visualizations
- Apply multiple filters before processing
- Visual charts based on filtered data
- Empty state handling for no-match queries

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLite** - Lightweight database for case storage
- **Ollama** - Local LLM for natural language processing

### Frontend
- **React Router** - Full-stack React framework
- **Recharts** - Composable charting library
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Reusable component library
- **MUI** - Material UI component library

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Ollama server running locally

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python main.py
```

The backend runs on `http://localhost:5174`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`

## API Endpoints

### Dashboard
- `GET /api/dashboard` - Get chart data and temporal analysis
- `GET /api/cases` - Get all cases with optional filters
- `GET /api/case/{case_id}` - Get detailed case information
- `GET /api/diagrams` - Get filtered diagram data

### Agents
- `POST /api/agents/process` - Process natural language query
- `GET /api/agents/crews` - Get available agent crews

## Project Structure

```
DefinitelyNotAI/
├── backend/
│   ├── agents/
│   │   └── tools/
│   │       └── sql_tools.py    # SQL execution utilities
│   ├── routes/
│   │   ├── agents.py           # AI agent endpoints
│   │   └── dashboard.py       # Dashboard endpoints
│   ├── utils/
│   │   └── dashboard_utils/
│   │       └── analyse_data.py # Data analysis utilities
│   └── main.py                 # FastAPI application
└── frontend/
    ├── app/
    │   ├── api/               # API client functions
    │   ├── components/       # React components
    │   │   ├── ai-elements/  # AI chat components
    │   │   ├── charts/       # Chart components
    │   │   ├── home/         # Home page components
    │   │   └── ui/           # UI components
    │   ├── routes/           # Page routes
    │   └── types/            # TypeScript types
    └── package.json
```

## Usage

1. **Home Dashboard** - View charts and ask AI questions about the data
2. **All Cases** - Browse and filter through all cases
3. **Case Details** - Click on any case to see full details
4. **Diagrams** - Apply filters and generate custom visualizations
5. **Chat** - Have a conversation with the AI about case data


## Use of AI
We used AI coding tools including OpenCode and Cursor alongside writing code ourselves, and leveraged Claude, Gemini, and ChatGPT for research throughout the process.


Demo link - [Demo video OpenDAIL](https://youtu.be/ZZODOC6-SHU)