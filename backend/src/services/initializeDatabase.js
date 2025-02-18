import pg from 'pg'
import envConfig from '../config/env.config.js'
import client from '../config/db.config.js'

const { Client } = pg

// Connect to PostgreSQL (without specifying database)
const adminClient = new Client({
  host: envConfig.PG_HOST,
  user: envConfig.PG_USER,
  password: envConfig.PG_PASSWORD,
  port: envConfig.PG_PORT,
  database: 'postgres', // Connect to the default database first
})

async function initializeDatabase() {
  try {
    await adminClient.connect()
    console.log('🚀 Connected to PostgreSQL!')

    // ✅ Ensure database exists
    const res = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = '${String(
        envConfig.PG_DATABASE
      ).toLowerCase()}';`
    )
    if (res.rows.length === 0) {
      console.log(
        `⚠️ Database '${envConfig.PG_DATABASE}' not found. Creating...`
      )
      await adminClient.query(
        `CREATE DATABASE ${String(envConfig.PG_DATABASE).toLowerCase()};`
      )
      console.log(
        `✅ Database '${envConfig.PG_DATABASE}' created successfully!`
      )
    } else {
      console.log(`✅ Database '${envConfig.PG_DATABASE}' already exists.`)
    }

    await adminClient.end()

    // ✅ Connect to the created database

    await client.connect()

    // ✅ Ensure settings table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
      );
    `)

    // ✅ Check if initialization is already done
    const initCheck = await client.query(
      "SELECT value FROM settings WHERE key = 'initialized';"
    )
    if (initCheck.rows.length > 0 && initCheck.rows[0].value === 'true') {
      console.log('✅ Database is already initialized. Skipping setup.')
      // await client.end()
      return
    }

    console.log('🚀 Running database initialization...')

    // ✅ Enable pgcrypto extension
    await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`)

    // ✅ Create Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS roles (
          id SERIAL PRIMARY KEY,
          name TEXT UNIQUE NOT NULL
      );

      

      CREATE TABLE IF NOT EXISTS user_roles (
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          role_id INT REFERENCES roles(id) ON DELETE CASCADE,
          PRIMARY KEY (user_id, role_id)
      );

      
    `)

    console.log('✅ Tables created successfully!')

    // ✅ Create PostgreSQL Functions

    // create dynamic collection or tables
    await client.query(`
      CREATE OR REPLACE FUNCTION create_content_type(table_name TEXT, schema JSONB) RETURNS BOOLEAN AS $$
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
    IF column_definitions = '' THEN
        RAISE EXCEPTION 'Schema must contain at least one column';
    END IF;

    -- Execute dynamic SQL to create table
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I (id SERIAL PRIMARY KEY, %s);', table_name, column_definitions);

    RETURN TRUE; -- Table created successfully
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating table: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
`)

    // alter dynamic table or collection
    await client.query(`
        CREATE OR REPLACE FUNCTION alter_content_type(
    table_name TEXT,
    column_name TEXT,
    column_type TEXT,
    constraints TEXT DEFAULT ''
) RETURNS BOOLEAN AS $$
BEGIN
    -- Validate supported types
    IF column_type NOT IN ('TEXT', 'INTEGER', 'BOOLEAN', 'TIMESTAMP', 'DATE', 'NUMERIC', 'JSONB') THEN
        RAISE EXCEPTION 'Unsupported data type: %', column_type;
    END IF;

    -- Execute dynamic SQL to alter the table and add new column
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS %I %s %s;', table_name, column_name, column_type, constraints);

    RETURN TRUE; -- Column added successfully
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding column: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
`)

    //insert into content type or table
    await client.query(`
      CREATE OR REPLACE FUNCTION insert_into_content_type(table_name TEXT, data JSONB) RETURNS BOOLEAN AS $$
      DECLARE
          column_names TEXT := '';
          column_values TEXT := '';
          column_entry RECORD;
      BEGIN
          FOR column_entry IN SELECT * FROM jsonb_each(data) LOOP
              column_names := column_names || quote_ident(column_entry.key) || ', ';
              column_values := column_values || quote_literal(column_entry.value) || ', ';
          END LOOP;
          column_names := TRIM(BOTH ', ' FROM column_names);
          column_values := TRIM(BOTH ', ' FROM column_values);
          IF column_names = '' OR column_values = '' THEN
              RAISE EXCEPTION 'Data must contain at least one column';
          END IF;
          EXECUTE format('INSERT INTO %I (%s) VALUES (%s);', table_name, column_names, column_values);
          RETURN TRUE;
      EXCEPTION
          WHEN OTHERS THEN
              RETURN FALSE;
      END;
      $$ LANGUAGE plpgsql;
    `)

    // delete data from table
    await client.query(`
      CREATE OR REPLACE FUNCTION delete_content_type_data(table_name TEXT, record_id INT) RETURNS BOOLEAN AS $$
      DECLARE
          row_count INT;
      BEGIN
          EXECUTE format('DELETE FROM %I WHERE id = %s;', table_name, record_id);
          GET DIAGNOSTICS row_count = ROW_COUNT;
          IF row_count > 0 THEN RETURN TRUE; ELSE RETURN FALSE; END IF;
      EXCEPTION WHEN OTHERS THEN RETURN FALSE;
      END;
      $$ LANGUAGE plpgsql;
    `)

    // update content type data
    await client.query(`
      CREATE OR REPLACE FUNCTION update_content_type_data(table_name TEXT, id INT, update_data JSONB) RETURNS BOOLEAN AS $$
      DECLARE
          update_pairs TEXT := '';
          column_entry RECORD;
          row_count INT;
      BEGIN
          FOR column_entry IN SELECT * FROM jsonb_each(update_data) LOOP
              update_pairs := update_pairs || quote_ident(column_entry.key) || ' = ' || quote_literal(column_entry.value) || ', ';
          END LOOP;
          update_pairs := TRIM(BOTH ', ' FROM update_pairs);
          IF update_pairs = '' THEN RETURN FALSE; END IF;
          EXECUTE format('UPDATE %I SET %s WHERE id = %s;', table_name, update_pairs, id);
          GET DIAGNOSTICS row_count = ROW_COUNT;
          RETURN row_count > 0;
      EXCEPTION WHEN OTHERS THEN RETURN FALSE;
      END;
      $$ LANGUAGE plpgsql;
    `)

    // delete table

    await client.query(`
      CREATE OR REPLACE FUNCTION delete_content_type_table(table_name TEXT) RETURNS BOOLEAN AS $$
BEGIN
    -- Prevent deletion of critical system tables
    IF table_name IN ('users', 'roles', 'user_roles', 'settings') THEN
        RAISE EXCEPTION 'Deletion of system tables is not allowed!';
    END IF;

    -- Execute dynamic SQL to drop the table
    EXECUTE format('DROP TABLE IF EXISTS %I CASCADE;', table_name);

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error deleting table: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

      `)

    // register super function function
    await client.query(`
      CREATE OR REPLACE FUNCTION register_super_admin(
    p_email TEXT,
    p_password TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    hashed_password TEXT;
    super_admin_role_id INT;
    super_admin_id UUID;
BEGIN
    -- Hash the password (Ensure pgcrypto is enabled)
    hashed_password := crypt(p_password, gen_salt('bf'));

    -- Get the Super Admin role ID
    SELECT id INTO super_admin_role_id FROM roles WHERE name = 'Super Admin';

    -- Ensure role exists
    IF super_admin_role_id IS NULL THEN
        RAISE NOTICE 'Super Admin role not found';
        RETURN FALSE;
    END IF;

    -- Insert the Super Admin user
    INSERT INTO users (email, password_hash, created_at)
    VALUES (p_email, hashed_password, NOW())
    RETURNING id INTO super_admin_id;

    -- Assign the Super Admin role to this user
    INSERT INTO user_roles (user_id, role_id)
    VALUES (super_admin_id, super_admin_role_id);

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
      `)

    // register normal user or content user
    await client.query(`CREATE OR REPLACE FUNCTION register_user(
    p_email TEXT,
    p_password TEXT,
    p_role TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    hashed_password TEXT;
    user_id UUID;
    role_id INT;
BEGIN
    -- Hash the password
    hashed_password := crypt(p_password, gen_salt('bf'));

    -- Insert the user
    INSERT INTO users (email, password_hash, created_at)
    VALUES (p_email, hashed_password, NOW())
    RETURNING id INTO user_id;

    -- Get the role ID
    SELECT id INTO role_id FROM roles WHERE LOWER(name) = LOWER(p_role);
    IF role_id IS NULL THEN
        RAISE NOTICE 'Role not found';
        RETURN FALSE;
    END IF;

    -- Assign role to user
    INSERT INTO user_roles (user_id, role_id) VALUES (user_id, role_id);

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;`)

    // assign role to exixting user

    await client.query(`CREATE OR REPLACE FUNCTION assign_role_to_user(
    p_email TEXT,
    p_role TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID;
    v_role_id INT;
BEGIN
    -- Get the user's ID
    SELECT id INTO v_user_id FROM users WHERE email = p_email;
    IF v_user_id IS NULL THEN
        RETURN FALSE;  -- User does not exist
    END IF;

    -- Get the role's ID
    SELECT id INTO v_role_id FROM roles WHERE name = p_role;
    IF v_role_id IS NULL THEN
        RETURN FALSE;  -- Role does not exist
    END IF;

    -- Remove any existing role assigned to this user
    DELETE FROM user_roles WHERE user_roles.user_id = v_user_id;

    -- Assign the new role to the user
    INSERT INTO user_roles (user_id, role_id) VALUES (v_user_id, v_role_id);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;`)

    // cleck user role
    await client.query(`CREATE OR REPLACE FUNCTION get_user_role(p_email TEXT)
RETURNS TABLE(role_name TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT r.name
    FROM users u
    JOIN user_roles ur ON u.id = ur.user_id
    JOIN roles r ON ur.role_id = r.id
    WHERE u.email = p_email;
END;
$$ LANGUAGE plpgsql;`)

    // authenticate user
    await client.query(`CREATE OR REPLACE FUNCTION authenticate_user(
    p_email TEXT,
    p_password TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    stored_hash TEXT;
    auth_success BOOLEAN;
BEGIN
    -- Retrieve the hashed password from the database
    SELECT password_hash INTO stored_hash
    FROM users
    WHERE email = p_email;

    -- If no user found, return FALSE
    IF stored_hash IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Compare provided password with stored hash
    auth_success := (stored_hash = crypt(p_password, stored_hash));

    RETURN auth_success;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;`)

    console.log('✅ Functions created successfully!')

    // ✅ Insert default roles, permissions, and Super Admin
    await client.query(`
      INSERT INTO roles (name) VALUES ('Super Admin'), ('Content Admin') ON CONFLICT (name) DO NOTHING;
    `)

    console.log('🚀 Database initialized successfully!')

    // ✅ Mark initialization as completed
    await client.query(
      `INSERT INTO settings (key, value) VALUES ('initialized', 'true') ON CONFLICT (key) DO NOTHING;`
    )

    // delet collection
    await client.query(
      `CREATE OR REPLACE FUNCTION delete_collection(p_table_name TEXT)
    RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
    DECLARE
        table_exists BOOLEAN;
    BEGIN
        -- Check if table exists
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = p_table_name
        ) INTO table_exists;

        IF NOT table_exists THEN
            RETURN QUERY SELECT FALSE, format('Table "%s" does not exist', p_table_name);
            RETURN;
        END IF;

        -- Execute dynamic SQL to drop the table
        EXECUTE format('DROP TABLE IF EXISTS %I CASCADE;', p_table_name);

        RETURN QUERY SELECT TRUE, format('Table "%s" deleted successfully', p_table_name);
    EXCEPTION
        WHEN OTHERS THEN
            RETURN QUERY SELECT FALSE, format('Error deleting table "%s": %s', p_table_name, SQLERRM);
    END;
    $$ LANGUAGE plpgsql;`
    )

    await client.query(`
        CREATE OR REPLACE FUNCTION get_all_collections()
        RETURNS JSON AS $$
        DECLARE
            result JSON;
        BEGIN
            SELECT json_agg(table_data) INTO result
            FROM (
                SELECT
                    table_name AS collection_name,
                    (SELECT json_agg(
                                json_build_object(
                                    'column_name', column_name,
                                    'data_type', data_type
                                )
                            )
                    FROM information_schema.columns c
                    WHERE c.table_name = t.table_name
                    AND c.table_schema = 'public'
                    ) AS columns
                FROM information_schema.tables t
                WHERE t.table_schema = 'public'
                ORDER BY t.table_name
            ) AS table_data;

            RETURN result;
        END;
        $$ LANGUAGE plpgsql;
      `)
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
  }
}

export default initializeDatabase
