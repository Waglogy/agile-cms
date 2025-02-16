# PostgreSQL Functions

- ### Function for creating dynamic tables based on user's input

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
        col_name := quote_ident(column_entry.key); -- Sanitize column name
        col_type := column_entry.value->>'type'; -- Extract data type
        constraints := COALESCE(column_entry.value->>'constraints', ''); -- Extract constraints

        -- Validate supported types
        IF col_type NOT IN ('TEXT', 'INTEGER', 'BOOLEAN', 'TIMESTAMP', 'DATE', 'NUMERIC', 'JSONB') THEN
            RAISE EXCEPTION 'Unsupported data type: %', col_type;
        END IF;

        column_definitions := column_definitions || format('%s %s %s, ', col_name, col_type, constraints);
    END LOOP;

    -- Remove trailing comma and space safely
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

- this function returns _TEXT_

- ### Query for creating tables

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

- ### Function to insert the data into dynamic tables

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

    RETURN TRUE;  -- Successfully inserted
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;  -- Handle error and return false
END;
$$ LANGUAGE plpgsql;
```

- this function returns _Boolean_

* ### Query for inserting the data

```sql
SELECT insert_into_content_type(
    'blog_posts',
    '{"title": "First Blog", "content": "This is a blog post", "published": true}'
);
```

- ### Function to delete data from dynamic tables

```sql
CREATE OR REPLACE FUNCTION delete_content_type_data(table_name TEXT, record_id INT) RETURNS BOOLEAN AS $$
DECLARE
    row_count INT;
BEGIN
    -- Execute dynamic SQL to delete the record
    EXECUTE format('DELETE FROM %I WHERE id = %s;', table_name, record_id);

    -- Capture the number of rows affected
    GET DIAGNOSTICS row_count = ROW_COUNT;

    -- If at least one row was deleted, return TRUE
    IF row_count > 0 THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE; -- Handle errors gracefully
END;
$$ LANGUAGE plpgsql;
```

- Node: This function returns Boolean.

- Query to execute this function

```sql
    SELECT delete_content_type_data('blog_posts', 7);
```

- ### Function to update dynamic table

```sql
CREATE OR REPLACE FUNCTION update_content_type_data(table_name TEXT, id INT, update_data JSONB) RETURNS BOOLEAN AS $$
DECLARE
    update_pairs TEXT := '';
    column_entry RECORD;
    row_count INT;
BEGIN
    -- Construct SET clause dynamically
    FOR column_entry IN SELECT * FROM jsonb_each(update_data) LOOP
        update_pairs := update_pairs || quote_ident(column_entry.key) || ' = ' || quote_literal(column_entry.value) || ', ';
    END LOOP;

    -- Trim the trailing comma safely
    update_pairs := TRIM(BOTH ', ' FROM update_pairs);

    -- Prevent empty updates
    IF update_pairs = '' THEN
        RETURN FALSE; -- No updates provided
    END IF;

    -- Execute the dynamic SQL update
    EXECUTE format('UPDATE %I SET %s WHERE id = %s;', table_name, update_pairs, id);

    -- Get the number of affected rows
    GET DIAGNOSTICS row_count = ROW_COUNT;

    -- Return TRUE if any rows were updated, else FALSE
    RETURN row_count > 0;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE; -- Handle errors gracefully
END;
$$ LANGUAGE plpgsql;
```

- Node: This function returns Boolean.

- Query to execute this

```sql
SELECT update_content_type_data('blog_posts', 1, '{"title": "Updated Title", "views": 100}');
```

## Initialize The System or the Database

```sql
CREATE OR REPLACE FUNCTION initialize_system(
    p_email TEXT,
    p_password TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    hashed_password TEXT;
    super_admin_role_id INT;
    new_user_id UUID;
    already_initialized BOOLEAN;
BEGIN
    -- Enable pgcrypto extension for password hashing
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    -- Create necessary tables if they don't exist
    CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS user_roles (
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        role_id INT REFERENCES roles(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, role_id)
    );

    CREATE TABLE IF NOT EXISTS permissions (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS role_permissions (
        role_id INT REFERENCES roles(id) ON DELETE CASCADE,
        permission_id INT REFERENCES permissions(id) ON DELETE CASCADE,
        PRIMARY KEY (role_id, permission_id)
    );

    -- Check if system is already initialized
    SELECT EXISTS(SELECT 1 FROM users) INTO already_initialized;
    IF already_initialized THEN
        RAISE NOTICE 'System already initialized. Returning FALSE.';
        RETURN FALSE;
    END IF;

    -- Hash the password securely
    hashed_password := crypt(p_password, gen_salt('bf'));

    -- Insert "Super Admin" role if not exists
    INSERT INTO roles (name) VALUES ('Super Admin')
    ON CONFLICT (name) DO NOTHING;

    -- Get "Super Admin" role ID
    SELECT id INTO super_admin_role_id FROM roles WHERE name = 'Super Admin';

    -- Ensure role was created
    IF super_admin_role_id IS NULL THEN
        RAISE NOTICE 'Failed to create Super Admin role';
        RETURN FALSE;
    END IF;

    -- Insert the first Super Admin user
    INSERT INTO users (email, password_hash)
    VALUES (p_email, hashed_password)
    RETURNING id INTO new_user_id;

    -- Ensure user was created
    IF new_user_id IS NULL THEN
        RAISE NOTICE 'Super Admin user creation failed';
        RETURN FALSE;
    END IF;

    -- Assign "Super Admin" role to the user
    INSERT INTO user_roles (user_id, role_id)
    VALUES (new_user_id, super_admin_role_id);

    RAISE NOTICE 'Super Admin successfully registered!';
    RETURN TRUE;

EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Initialization failed: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
```

- Insert Query
- Returns Bool As well

```sql
SELECT initialize_system('admin@example.com', 'SuperSecurePassword');
```

---

📌 Brief Explanation of initialize_system Function

The initialize_system function is responsible for setting up the system by:
🔹 1. Ensuring pgcrypto is enabled

    It enables the pgcrypto extension, which is needed for password hashing.

🔹 2. Creating required tables (if they don’t exist)

    roles → Stores different user roles (e.g., Super Admin, Content Admin).
    users → Stores registered users with their email and hashed passwords.
    user_roles → Links users to roles (many-to-many relationship).
    permissions → Stores permissions (e.g., "create content", "delete content").
    role_permissions → Links roles to permissions (many-to-many relationship).

🔹 3. Preventing duplicate initialization

    If a user already exists, it stops execution and returns FALSE (system already initialized).

🔹 4. Creating the "Super Admin" Role

    It inserts a "Super Admin" role into the roles table if it does not exist.
    Then, it fetches the id of this role.

🔹 5. Registering the First Super Admin User

    Hashes the provided password using bcrypt (gen_salt('bf')) for security.
    Inserts the new Super Admin user into the users table.
    Fetches the id of the newly created user.

🔹 6. Assigning the "Super Admin" Role to the User

    It assigns the Super Admin role to this user in the user_roles table.

🔹 7. Returning TRUE or FALSE based on success/failure

    If everything works, it returns TRUE (success).
    If something fails (e.g., missing role, failed insert), it returns FALSE and logs a warning.

---
