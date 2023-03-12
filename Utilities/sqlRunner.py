import psycopg2


def sql_runner(conn_json, sql):

    # Connect to the PostgreSQL database
    conn = psycopg2.connect(
        host=conn_json["host"],
        port=conn_json["port"],
        database=conn_json["db"],
        user=conn_json["uid"],
        password=conn_json["pwd"]
    )

    # Open the SQL file and read its contents
    with open(sql, 'r') as f:
        sql = f.read()

    # Create a cursor object to execute SQL queries
    cur = conn.cursor()

    # Execute the SQL query
    cur.execute(sql)

    # Commit the changes to the database
    conn.commit()

    # Close the cursor and database connection
    cur.close()
    conn.close()
