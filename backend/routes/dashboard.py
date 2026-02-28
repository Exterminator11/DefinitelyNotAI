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
    columns_lower = {c.lower(): c for c in COLUMNS}
    date_cols_lower = {c.lower(): c for c in DATE_COLUMNS}
    for key, value in params.items():
        if not value:
            continue
        key_stripped = key.strip()
        if key_stripped.endswith("_start") or key_stripped.endswith("_end"):
            base = key_stripped[:-6] if key_stripped.endswith("_start") else key_stripped[:-4]
            canonical = date_cols_lower.get(base.lower())
            if canonical:
                suffix = "_start" if key_stripped.endswith("_start") else "_end"
                filters[f"{canonical}{suffix}"] = value.strip()
        else:
            canonical = columns_lower.get(key_stripped.lower())
            if canonical:
                vals = [v.strip() for v in value.split(",") if v.strip()]
                if vals:
                    filters[canonical] = vals
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


@router.get("/diagrams")
async def get_diagrams(request: Request):
    has_query_params = bool(request.query_params)
    filters = _parse_filters_from_query(request)
    if not has_query_params:
        res = get_all_cases(None)
        return {"columns": res["columns"], "date_columns": res["date_columns"]}
    return {
        "chart_data": get_chart_data(filters) if filters else get_chart_data(),
        "temporal_data": get_temporal_analysis(filters) if filters else get_temporal_analysis(),
    }