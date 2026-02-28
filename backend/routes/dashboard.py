from fastapi import APIRouter, Request
from utils.dashboard_utils.analyse_data import (
    COLUMNS,
    DATE_COLUMNS,
    get_chart_data,
    get_temporal_analysis,
    get_case_details,
    get_all_cases,
)

router = APIRouter()


def _parse_filters_from_query(request: Request):
    """Build filters dict from query params. List columns: comma-separated -> list; date: _start/_end -> string."""
    params = request.query_params
    if not params:
        return None
    filters = {}
    for key, value in params.items():
        if not value:
            continue
        if key.endswith("_start") or key.endswith("_end"):
            filters[key] = value.strip()
        elif key in COLUMNS:
            filters[key] = [v.strip() for v in value.split(",") if v.strip()]
        else:
            continue
    if not filters:
        return None
    return filters


@router.get("/dashboard")
async def get_dashboard():
    chart_data = get_chart_data()
    temporal_data = get_temporal_analysis()
    
    return {
        "chart_data": chart_data,
        "temporal_data": temporal_data
    }


@router.get("/cases")
async def get_cases(request: Request):
    filters = _parse_filters_from_query(request)
    return get_all_cases(filters)


@router.get("/case/{case_id}")
async def get_case(case_id: int):
    return get_case_details(case_id)