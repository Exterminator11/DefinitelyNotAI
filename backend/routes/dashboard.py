from fastapi import APIRouter
from utils.dashboard_utils.analyse_data import get_chart_data, get_temporal_analysis, get_case_details, get_all_cases

router = APIRouter()


@router.get("/dashboard")
async def get_dashboard():
    chart_data = get_chart_data()
    temporal_data = get_temporal_analysis()
    
    return {
        "chart_data": chart_data,
        "temporal_data": temporal_data
    }


@router.get("/cases")
async def get_cases():
    return get_all_cases()


@router.get("/case/{case_id}")
async def get_case(case_id: int):
    return get_case_details(case_id)