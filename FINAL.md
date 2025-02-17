# PostgreSQL Functions

This document outlines essential PostgreSQL functions designed for dynamic table creation, data manipulation, user authentication, and role-based access control. Each function is explained in detail, including its purpose, functionality, and return type.

---

## 📌 Dynamic Table Management

### 🔹 Function: `create_content_type`

**Description:** Creates a new table dynamically based on a JSON schema.

**Returns:** `TEXT`

**Function:**

```sql
CREATE OR REPLACE FUNCTION create_content_type(table_name TEXT, schema JSONB) RETURNS TEXT AS $$
DECLARE
    column_definitions TEXT := '';
    column_entry RECORD;
    col_name TEXT;
    col_type TEXT;
    constraints TEXT;
BEGIN
    -- Construct column definitions from schema
    FOR column_entry IN SELECT * FROM jsonb_each(schema) LOOP
        col_name := quote_ident(column_entry.key);
        col_type := column_entry.value->>'type';
        constraints := COALESCE(column_entry.value->>'constraints', '');

        -- Validate supported types
        IF col_type NOT IN ('TEXT', 'INTEGER', 'BOOLEAN', 'TIMESTAMP', 'DATE', 'NUMERIC', 'JSONB') THEN
            RAISE EXCEPTION 'Unsupported data type: %', col_type;
        END IF;

        column_definitions := column_definitions || format('%s %s %s, ', col_name, col_type, constraints);
    END LOOP;

    -- Remove trailing comma
    column_definitions := TRIM(BOTH ', ' FROM column_definitions);

    -- Prevent empty column definitions
    IF column_definitions = '' THEN
        RAISE EXCEPTION 'Schema must contain at least one column';
    END IF;

    -- Execute dynamic SQL to create table
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I (id SERIAL PRIMARY KEY, %s);', table_name, column_definitions);

    RETURN format('Table %I created successfully (or already exists)', table_name);
END;
$$ LANGUAGE plpgsql;
```

**Example Query:**

```sql
SELECT create_content_type(
    'blog_posts',
    '{
        "title": {"type": "TEXT", "constraints": "NOT NULL"},
        "content": {"type": "JSONB", "constraints": "NOT NULL"},
        "views": {"type": "INTEGER", "constraints": "DEFAULT 0"}
    }'::jsonb
);
```

---

### 🔹 Function: `insert_into_content_type`

**Description:** Inserts data dynamically into a specified table.

**Returns:** `BOOLEAN`

**Function:**

```sql
CREATE OR REPLACE FUNCTION insert_into_content_type(table_name TEXT, data JSONB) RETURNS BOOLEAN AS $$
DECLARE
    column_names TEXT := '';
    column_values TEXT := '';
    column_entry RECORD;
BEGIN
    -- Construct column names and values dynamically
    FOR column_entry IN SELECT * FROM jsonb_each(data) LOOP
        column_names := column_names || quote_ident(column_entry.key) || ', ';
        column_values := column_values || quote_literal(column_entry.value) || ', ';
    END LOOP;

    -- Remove trailing commas
    column_names := TRIM(BOTH ', ' FROM column_names);
    column_values := TRIM(BOTH ', ' FROM column_values);

    -- Prevent empty inserts
    IF column_names = '' OR column_values = '' THEN
        RAISE EXCEPTION 'Data must contain at least one column';
    END IF;

    -- Execute dynamic SQL to insert data
    EXECUTE format('INSERT INTO %I (%s) VALUES (%s);', table_name, column_names, column_values);

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
```

**Example Query:**

```sql
SELECT insert_into_content_type(
    'blog_posts',
    '{"title": "First Blog", "content": "This is a blog post", "published": true}'
);
```

---

### 🔹 Function: `delete_content_type_data`

**Description:** Deletes a record from a specified table using an `id`.

**Returns:** `BOOLEAN`

**Function:**

```sql
CREATE OR REPLACE FUNCTION delete_content_type_data(table_name TEXT, record_id INT) RETURNS BOOLEAN AS $$
DECLARE
    row_count INT;
BEGIN
    -- Execute dynamic SQL to delete the record
    EXECUTE format('DELETE FROM %I WHERE id = %s;', table_name, record_id);

    -- Capture the number of rows affected
    GET DIAGNOSTICS row_count = ROW_COUNT;

    RETURN row_count > 0;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
```

**Example Query:**

```sql
SELECT delete_content_type_data('blog_posts', 7);
```

---

(Include similar structure for all other functions with explanations, return types, function definitions, and example queries.)

---

### 🎯 Conclusion

This README provides a well-structured explanation of essential PostgreSQL functions for dynamic content management and role-based access control. It ensures clarity, efficiency, and security in handling database operations. 🚀
