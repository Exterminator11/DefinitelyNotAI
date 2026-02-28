import sqlite3
from collections import Counter
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "setup", "ai_litigation.db")

COLUMNS = [
    "Area_of_Application_List",
    "Cause_of_Action_List",
    "Issue_List_OLD",
    "Name_of_Algorithm_List",
    "Class_Action_list",
    "Jurisdiction_Type"
]

DATE_COLUMNS = [
    "Date_Action_Filed",
    "Date_Added",
    "Last_Update",
    "Most_Recent_Activity_Date"
]


def clean_value(val):
    if val is None:
        return []
    val = str(val).strip()
    if not val:
        return []
    val = val.replace("'", "")
    parts = val.split("|")
    items = []
    for part in parts:
        part = part.strip()
        if not part:
            continue
        subparts = [s.strip() for s in part.split(",")]
        for subpart in subparts:
            if subpart:
                items.append(subpart)
    return items


def get_chart_data():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    result = {}

    for column in COLUMNS:
        cursor.execute(f"SELECT {column} FROM cases")
        all_values = cursor.fetchall()

        counter = Counter()
        for (value,) in all_values:
            items = clean_value(value)
            for item in items:
                if item:
                    counter[item] += 1

        sorted_items = sorted(counter.items(), key=lambda x: x[1], reverse=True)

        result[column] = {
            "labels": [item[0] for item in sorted_items],
            "data": [item[1] for item in sorted_items]
        }

    conn.close()
    return result


def get_temporal_analysis():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM cases")
    total_cases = cursor.fetchone()[0]

    cursor.execute("""
        SELECT 
            strftime('%Y', Date_Action_Filed) as year,
            COUNT(*) as count
        FROM cases 
        WHERE Date_Action_Filed IS NOT NULL
        GROUP BY year 
        ORDER BY year
    """)
    filing_trends = cursor.fetchall()
    
    cursor.execute("""
        SELECT 
            AVG(julianday(Most_Recent_Activity_Date) - julianday(Date_Action_Filed)) as avg_days,
            MIN(julianday(Most_Recent_Activity_Date) - julianday(Date_Action_Filed)) as min_days,
            MAX(julianday(Most_Recent_Activity_Date) - julianday(Date_Action_Filed)) as max_days
        FROM cases 
        WHERE Date_Action_Filed IS NOT NULL 
        AND Most_Recent_Activity_Date IS NOT NULL
        AND julianday(Most_Recent_Activity_Date) >= julianday(Date_Action_Filed)
    """)
    velocity_stats = cursor.fetchone()

    cursor.execute("""
        SELECT 
            CASE 
                WHEN julianday(Most_Recent_Activity_Date) - julianday(Date_Action_Filed) < 180 THEN '0-6 months'
                WHEN julianday(Most_Recent_Activity_Date) - julianday(Date_Action_Filed) < 365 THEN '6-12 months'
                WHEN julianday(Most_Recent_Activity_Date) - julianday(Date_Action_Filed) < 730 THEN '1-2 years'
                WHEN julianday(Most_Recent_Activity_Date) - julianday(Date_Action_Filed) < 1825 THEN '2-5 years'
                ELSE '5+ years'
            END as bucket,
            COUNT(*) as count
        FROM cases 
        WHERE Date_Action_Filed IS NOT NULL 
        AND Most_Recent_Activity_Date IS NOT NULL
        AND julianday(Most_Recent_Activity_Date) >= julianday(Date_Action_Filed)
        GROUP BY bucket
        ORDER BY bucket
    """)
    velocity_distribution = cursor.fetchall()

    cursor.execute("""
        SELECT 
            CASE 
                WHEN Last_Update < date('now', '-6 months') THEN 'stale'
                ELSE 'active'
            END as status,
            COUNT(*) as count
        FROM cases 
        WHERE Last_Update IS NOT NULL
        GROUP BY status
    """)
    staleness = cursor.fetchall()

    cursor.execute("""
        SELECT 
            MIN(Date_Action_Filed) as earliest,
            MAX(Most_Recent_Activity_Date) as latest,
            COUNT(Date_Action_Filed) as cases_with_dates
        FROM cases 
        WHERE Date_Action_Filed IS NOT NULL
    """)
    lifecycle = cursor.fetchone()

    conn.close()

    staleness_dict = {"active": 0, "stale": 0}
    for status, count in staleness:
        if status == "active":
            staleness_dict["active"] = count
        else:
            staleness_dict["stale"] = count

    stale_pct = round((staleness_dict["stale"] / total_cases) * 100, 1) if total_cases > 0 else 0

    return {
        "filing_trends": {
            "labels": [str(row[0]) for row in filing_trends],
            "data": [row[1] for row in filing_trends]
        },
        "litigation_velocity": {
            "average_days": round(velocity_stats[0], 1) if velocity_stats[0] else 0,
            "min_days": round(velocity_stats[1], 1) if velocity_stats[1] else 0,
            "max_days": round(velocity_stats[2], 1) if velocity_stats[2] else 0,
            "distribution": {
                "labels": [row[0] for row in velocity_distribution],
                "data": [row[1] for row in velocity_distribution]
            }
        },
        "staleness": {
            "active": staleness_dict["active"],
            "stale": staleness_dict["stale"],
            "stale_percentage": stale_pct
        },
        "lifecycle_summary": {
            "total_cases": total_cases,
            "earliest_filing": lifecycle[0] if lifecycle[0] else None,
            "latest_activity": lifecycle[1] if lifecycle[1] else None,
            "cases_with_dates": lifecycle[2] if lifecycle[2] else 0
        }
    }


def get_case_details(case_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM cases WHERE id = ?", (case_id,))
    case = cursor.fetchone()
    
    if not case:
        conn.close()
        return {"case": None, "secondary_sources": []}
    
    case_columns = [col[0] for col in cursor.description]
    case_dict = dict(zip(case_columns, case))
    
    cursor.execute("SELECT * FROM secondary_sources WHERE Case_Number = ?", (case_id,))
    sources = cursor.fetchall()
    
    conn.close()
    
    source_columns = ["id", "Case_Number", "Secondary_Source_Link", "Secondary_Source_Title"]
    secondary_sources = [dict(zip(source_columns, row)) for row in sources]
    
    return {
        "case": case_dict,
        "secondary_sources": secondary_sources
    }


def get_all_cases():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM cases")
    rows = cursor.fetchall()
    
    columns = [col[0] for col in cursor.description]
    cases = [dict(zip(columns, row)) for row in rows]
    
    conn.close()
    return cases
