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

# Columns unique per case; excluded from filter/column value counts.
COLUMNS_EXCLUDED_FROM_FILTERS = {"id", "case_snug", "record_number", "caption", "brief_description", "summary_of_significance"}


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


def _build_column_value_counts(cursor, column_name, rows, column_index):
    """Build { labels, data } for one column. For COLUMNS use clean_value; else raw value counts."""
    if column_name in COLUMNS:
        counter = Counter()
        for row in rows:
            value = row[column_index]
            for item in clean_value(value):
                if item:
                    counter[item] += 1
    else:
        counter = Counter()
        for row in rows:
            value = row[column_index]
            if value is None:
                counter["N/A"] += 1
            else:
                counter[str(value).strip() or "N/A"] += 1
    sorted_items = sorted(counter.items(), key=lambda x: x[1], reverse=True)
    return {
        "labels": [item[0] for item in sorted_items],
        "data": [item[1] for item in sorted_items],
    }


def get_all_cases(filters=None):
    """
    Return cases, optionally filtered. When filters is None or empty, also return
    columns and date_columns. When filters are present, return only cases.
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    has_filters = filters and len(filters) > 0

    if not has_filters:
        cursor.execute("SELECT * FROM cases")
        rows = cursor.fetchall()
    else:
        # Build WHERE for date columns only (column names from DATE_COLUMNS)
        where_parts = []
        params = []
        for col in DATE_COLUMNS:
            start_key = f"{col}_start"
            end_key = f"{col}_end"
            start_val = filters.get(start_key)
            end_val = filters.get(end_key)
            if start_val:
                where_parts.append(f'"{col}" >= ?')
                params.append(start_val)
            if end_val:
                where_parts.append(f'"{col}" <= ?')
                params.append(end_val)
        sql = "SELECT * FROM cases"
        if where_parts:
            sql += " WHERE " + " AND ".join(where_parts)
        cursor.execute(sql, params)
        rows = cursor.fetchall()

        # Filter list-type columns in Python (cell contains any of selected values)
        list_filters = {
            k: v for k, v in filters.items()
            if k in COLUMNS and isinstance(v, list) and len(v) > 0
        }
        if list_filters:
            column_names = [col[0] for col in cursor.description]
            col_indices = {name: idx for idx, name in enumerate(column_names)}
            filtered_rows = []
            for row in rows:
                keep = True
                for col_name, selected_vals in list_filters.items():
                    idx = col_indices.get(col_name)
                    if idx is None:
                        continue
                    cell_vals = set(clean_value(row[idx]))
                    if not cell_vals.intersection(set(selected_vals)):
                        keep = False
                        break
                if keep:
                    filtered_rows.append(row)
            rows = filtered_rows

    column_names = [col[0] for col in cursor.description]
    cases = [dict(zip(column_names, row)) for row in rows]

    if has_filters:
        conn.close()
        return {"cases": cases}

    columns = {}
    for idx, col_name in enumerate(column_names):
        if col_name.lower() in COLUMNS_EXCLUDED_FROM_FILTERS:
            continue
        if col_name in DATE_COLUMNS:
            continue
        columns[col_name] = _build_column_value_counts(
            cursor, col_name, rows, idx
        )
    date_columns = [c for c in DATE_COLUMNS if c in column_names]
    conn.close()
    return {"cases": cases, "columns": columns, "date_columns": date_columns}
