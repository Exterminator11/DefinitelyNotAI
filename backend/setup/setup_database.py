import pandas as pd
import sqlite3
import re
import os

excel_file = "/Users/rachitdas/Desktop/DefinitelyNotAI/Case_Table_2026-Feb-21_1952.xlsx"
secondary_source_file = "/Users/rachitdas/Desktop/DefinitelyNotAI/Secondary_Source_Coverage_Table_2026-Feb-21_2058.xlsx"
db_name = 'ai_litigation.db'

def map_caspio_to_sql(caspio_type):
    """Maps the custom platform data types to standard SQLite types."""
    caspio_type = str(caspio_type).lower()
    if 'autonumber' in caspio_type:
        return 'INTEGER PRIMARY KEY'
    elif 'integer' in caspio_type:
        return 'INTEGER'
    elif 'date/time' in caspio_type:
        return 'TIMESTAMP'
    elif 'yes/no' in caspio_type:
        return 'BOOLEAN'
    else:
        return 'TEXT'

def extract_and_build():
    print(f"Opening {excel_file}...")

    # Passing sheet_name=None extracts ALL sheets into a dictionary
    sheets_dict = pd.read_excel(excel_file, sheet_name=None)

    schema_df = None
    data_df = None

    # Dynamically identify the sheets based on their names
    for sheet_name, df in sheets_dict.items():
        if 'Field Names' in sheet_name or 'Labels' in sheet_name:
            print(f"Found schema sheet: {sheet_name}")
            schema_df = df
        else:
            print(f"Found data sheet: {sheet_name}")
            data_df = df

    if schema_df is None or data_df is None:
        print("Error: Could not identify the schema or data sheets.")
        return

    # Build the CREATE TABLE SQL command dynamically
    columns_sql = []
    for _, row in schema_df.iterrows():
        col_name = str(row['Name']).strip()
        clean_col_name = re.sub(r'[^a-zA-Z0-9_]', '', col_name) 
        sql_type = map_caspio_to_sql(row['DataType'])
        columns_sql.append(f"{clean_col_name} {sql_type}")

    # Build the column definitions string first to avoid the backslash error
    columns_joined = ",\n    ".join(columns_sql)
    create_table_query = f"CREATE TABLE IF NOT EXISTS cases (\n    {columns_joined}\n);"

    # Connect to the SQLite database
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()

    print("Building database schema...")
    cursor.execute("DROP TABLE IF EXISTS cases;")
    cursor.execute(create_table_query)

    # Clean column names in the data sheet so they match the schema
    print("Loading extracted data into SQL...")
    data_df.columns = [re.sub(r'[^a-zA-Z0-9_]', '', str(col)) for col in data_df.columns]

    # Insert data
    data_df.to_sql('cases', conn, if_exists='append', index=False)

    cursor.execute("SELECT COUNT(*) FROM cases;")
    record_count = cursor.fetchone()[0]

    print(f"Success! {record_count} records inserted into {db_name}.")

    conn.commit()
    conn.close()


def extract_secondary_sources():
    print(f"Opening {secondary_source_file}...")
    
    df = pd.read_excel(secondary_source_file, sheet_name='Secondary_Source_Coverage_Table')
    
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    
    print("Creating secondary_sources table...")
    cursor.execute("DROP TABLE IF EXISTS secondary_sources;")
    cursor.execute("""
        CREATE TABLE secondary_sources (
            id INTEGER PRIMARY KEY,
            Case_Number INTEGER,
            Secondary_Source_Link TEXT,
            Secondary_Source_Title TEXT
        );
    """)
    
    df.columns = [re.sub(r'[^a-zA-Z0-9_]', '', str(col)) for col in df.columns]
    
    print("Loading secondary sources data into SQL...")
    df.to_sql('secondary_sources', conn, if_exists='append', index=False)
    
    cursor.execute("SELECT COUNT(*) FROM secondary_sources;")
    record_count = cursor.fetchone()[0]
    
    print(f"Success! {record_count} secondary source records inserted.")
    
    conn.commit()
    conn.close()


if __name__ == "__main__":
    extract_and_build()
    extract_secondary_sources()
