import pg from 'pg'
import envConfig from '../config/env.config.js'
// import client from '../config/db.config.js'

const { Client, Pool } = pg


async function initializeDatabase(db_name) {
  const adminClient = new Client({
    host: envConfig.PG_HOST,
    user: envConfig.PG_USER,
    password: `${envConfig.PG_PASSWORD}`,
    port: envConfig.PG_PORT,
    database: 'postgres',
  });
  const client = new Pool({
    host: envConfig.PG_HOST,
    user: envConfig.PG_USER,
    password: `${envConfig.PG_PASSWORD}`,
    port: envConfig.PG_PORT,
    database: String(db_name).toLowerCase(),
  })
  try {
    await adminClient.connect()
    console.log('🚀 Connected to PostgreSQL!')

    // ✅ Ensure database exists
    const res = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = '${String(
        db_name
      ).toLowerCase()}';`
    )
    if (res.rows.length === 0) {
      console.log(`⚠️ Database '${db_name}' not found. Creating...`)
      await adminClient.query(
        `CREATE DATABASE ${String(db_name).toLowerCase()};`
      )
      console.log(`✅ Database '${db_name}' created successfully!`)
    } else {
      console.log(`✅ Database '${db_name}' already exists.`)
    }

    await adminClient.end()
    // console.log(`this is  a:`, a)

    // ✅ Connect to the created database
    await client.connect()

    // console.log()
    await client.query(`CREATE SCHEMA IF NOT EXISTS agile_cms;`)
    await client.query(`SET search_path TO agile_cms;`)

    // app.locals.client = client

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
      return client
    }

    console.log('🚀 Running database initialization...')

    // ✅ Enable pgcrypto extension
    await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`)
    // ✅ Create logs table
    await client.query(`
  CREATE TABLE IF NOT EXISTS agile_cms.logs (
    id SERIAL PRIMARY KEY,
    action_type TEXT NOT NULL, -- 'create', 'edit', 'delete'
    user_email TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id INT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
`)

    // ✅ Add column comments to logs table
    await client.query(`
  COMMENT ON COLUMN agile_cms.logs.id IS 'Primary key for the log entry';
  COMMENT ON COLUMN agile_cms.logs.action_type IS 'Type of action (create, edit, delete)';
  COMMENT ON COLUMN agile_cms.logs.user_email IS 'Email of the user who performed the action';
  COMMENT ON COLUMN agile_cms.logs.table_name IS 'Name of the affected table';
  COMMENT ON COLUMN agile_cms.logs.record_id IS 'ID of the affected record';
  COMMENT ON COLUMN agile_cms.logs.details IS 'Additional JSONB details about the action';
  COMMENT ON COLUMN agile_cms.logs.created_at IS 'Timestamp when the action occurred';
`)

    // ✅ Log insertion function
    await client.query(`
  CREATE OR REPLACE FUNCTION agile_cms.insert_log_entry(
    p_action_type TEXT,
    p_user_email TEXT,
    p_table_name TEXT,
    p_record_id INT,
    p_details JSONB
  ) RETURNS VOID AS $$
  BEGIN
    INSERT INTO agile_cms.logs(action_type, user_email, table_name, record_id, details)
    VALUES (p_action_type, p_user_email, p_table_name, p_record_id, p_details);
  END;
  $$ LANGUAGE plpgsql;
`)

    await client.query(`
  CREATE TABLE IF NOT EXISTS agile_cms.content_versions (
  id SERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id INT NOT NULL,
  version INT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
`)

    await client.query(`
  CREATE OR REPLACE FUNCTION agile_cms.save_content_version(
  p_table TEXT,
  p_id INT,
  p_data JSONB,
  p_version INT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO agile_cms.content_versions(table_name, record_id, version, data)
  VALUES (p_table, p_id, p_version, p_data);
END;
$$ LANGUAGE plpgsql;
`)
    // ✅ Create Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
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
        
        CREATE OR REPLACE FUNCTION agile_cms.create_content_type(
  tbl_name   TEXT,
  schema_def JSONB
) RETURNS TEXT AS $$
DECLARE
  col_defs    TEXT;
  col_name    TEXT;
  column_def  JSONB;
  is_mult     BOOLEAN;
BEGIN
  -- 1) Build the comma-separated list of user-defined "col_name col_type"
  SELECT
    string_agg(
      format('%I %s', js.key, js.value->>'type'),
      ', '
    )
  INTO col_defs
  FROM jsonb_each(schema_def) AS js(key, value);

  -- 2) Create the table with an auto-incrementing id PK + your columns
  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS agile_cms.utbl_%I (
       %I SERIAL PRIMARY KEY
       %s
     )',
    tbl_name,
    tbl_name || '_id',
    CASE
      WHEN col_defs <> '' THEN ', ' || col_defs
      ELSE ''
    END
  );

  -- 3) Loop to COMMENT on each user-defined column's is_multiple flag
  FOR col_name, column_def IN
    SELECT js.key, js.value
    FROM jsonb_each(schema_def) AS js(key, value)
  LOOP
    is_mult := COALESCE((column_def->>'is_multiple')::BOOLEAN, FALSE);

    EXECUTE format(
      'COMMENT ON COLUMN agile_cms.%I.%I IS %L',
      tbl_name,
      col_name,
      format('is_multiple=%s', is_mult)
    );
  END LOOP;

  RETURN 'created';
END;
$$ LANGUAGE plpgsql;


`)

    // alter dynamic table or collection
    await client.query(`CREATE OR REPLACE FUNCTION agile_cms.alter_content_type(
  p_action TEXT,
  p_table_name TEXT,
  p_column_name TEXT DEFAULT NULL,
  p_column_type TEXT DEFAULT NULL,
  p_constraints TEXT DEFAULT NULL,
  p_new_name TEXT DEFAULT NULL,
  p_comment TEXT DEFAULT NULL
) RETURNS TEXT AS $$
BEGIN
  IF p_action = 'add' THEN
    EXECUTE format(
      'ALTER TABLE agile_cms.%I ADD COLUMN IF NOT EXISTS %I %s %s',
      p_table_name, p_column_name, p_column_type, COALESCE(p_constraints, '')
    );

    IF p_comment IS NOT NULL THEN
      EXECUTE format(
        'COMMENT ON COLUMN agile_cms.%I.%I IS %L',
        p_table_name, p_column_name, p_comment
      );
    END IF;

    RETURN 'Column added';

  ELSIF p_action = 'drop' THEN
    EXECUTE format(
      'ALTER TABLE agile_cms.%I DROP COLUMN IF EXISTS %I',
      p_table_name, p_column_name
    );
    RETURN 'Column dropped';

  ELSIF p_action = 'rename' THEN
    EXECUTE format(
      'ALTER TABLE agile_cms.%I RENAME COLUMN %I TO %I',
      p_table_name, p_column_name, p_new_name
    );
    RETURN 'Column renamed';

  ELSIF p_action = 'type' THEN
    EXECUTE format(
      'ALTER TABLE agile_cms.%I ALTER COLUMN %I TYPE %s %s',
      p_table_name, p_column_name, p_column_type, COALESCE(p_constraints, '')
    );
    RETURN 'Column type changed';

  ELSIF p_action = 'comment' THEN
    EXECUTE format(
      'COMMENT ON COLUMN agile_cms.%I.%I IS %L',
      p_table_name, p_column_name, p_comment
    );
    RETURN 'Comment added';

  ELSE
    RETURN 'Invalid action';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
    RETURN 'Failed: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;

`)

    await client.query(`
      CREATE OR REPLACE FUNCTION agile_cms.create_content_type(
  tbl_name   TEXT,
  schema_def JSONB
) RETURNS TEXT AS $$
DECLARE
  col_defs    TEXT := '';
  col_name    TEXT;
  column_def  JSONB;
  col_type    TEXT;
  constraints TEXT;
  is_mult     BOOLEAN;
BEGIN
  -- 1) Loop through fields and build SQL column definitions
  FOR col_name, column_def IN
    SELECT key, value FROM jsonb_each(schema_def)
  LOOP
    col_type := column_def->>'type';
    constraints := COALESCE(column_def->>'constraints', '');
    col_defs := col_defs || format('%I %s %s, ', col_name, col_type, constraints);
  END LOOP;

  -- 2) Trim trailing comma and whitespace
  col_defs := rtrim(col_defs, ', ');

  -- 3) Append system versioning/status columns
  col_defs := col_defs || ',
    status        TEXT DEFAULT ''draft'',
    version       INT DEFAULT 1,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW(),
    published_at  TIMESTAMPTZ
  ';

  -- 4) Create the dynamic table
  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS agile_cms.utbl_%I (
       %I SERIAL PRIMARY KEY,
       %s
     )',
    tbl_name,
    tbl_name || '_id',
    col_defs
  );

  -- 5) Comment on columns for is_multiple
  FOR col_name, column_def IN
    SELECT key, value FROM jsonb_each(schema_def)
  LOOP
    is_mult := COALESCE((column_def->>'is_multiple')::BOOLEAN, FALSE);
    EXECUTE format(
      'COMMENT ON COLUMN agile_cms.%I.%I IS %L',
      tbl_name,
      col_name,
      format('is_multiple=%s', is_mult)
    );
  END LOOP;

  RETURN 'created';
END;
$$ LANGUAGE plpgsql;


`)

    //insert into content type or table
    await client.query(`CREATE OR REPLACE FUNCTION agile_cms.insert_into_content_type(
  p_table_name TEXT,
  p_data       JSONB
) RETURNS JSONB AS $$
DECLARE
  v_cols     TEXT := '';
  v_vals     TEXT := '';
  col_name   TEXT;
  col_val    JSONB;
  v_result   JSONB;
BEGIN
  -- 1) Add default system fields if missing
  IF NOT p_data ? 'status' THEN
    p_data := p_data || jsonb_build_object('status', 'draft');
  END IF;
  IF NOT p_data ? 'version' THEN
    p_data := p_data || jsonb_build_object('version', 1);
  END IF;

  -- 2) Build comma-separated list of keys and values
  FOR col_name, col_val IN
    SELECT key, value FROM jsonb_each(p_data)
  LOOP
    v_cols := v_cols || quote_ident(col_name) || ', ';

    v_vals := v_vals || 
      CASE
        WHEN jsonb_typeof(col_val) = 'string' THEN quote_literal(trim(both '"' from col_val::TEXT))
        WHEN jsonb_typeof(col_val) = 'null' THEN 'NULL'
        ELSE col_val::TEXT
      END
    || 
      CASE
        WHEN (
          SELECT data_type = 'jsonb'
          FROM information_schema.columns
          WHERE table_name = p_table_name AND column_name = col_name
          LIMIT 1
        )
        THEN '::jsonb'
        ELSE ''
      END
    || ', ';
  END LOOP;

  -- 3) Trim trailing commas
  v_cols := rtrim(v_cols, ', ');
  v_vals := rtrim(v_vals, ', ');

  IF v_cols = '' THEN
    RAISE EXCEPTION 'Data must contain at least one column';
  END IF;

  -- 4) Insert and return the full row
  EXECUTE format(

    'INSERT INTO agile_cms.%I AS t (%s) VALUES (%s)
       RETURNING to_jsonb(t)',

    p_table_name,
    v_cols,
    v_vals
  )
  INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;
`)

    // delete data from table
    await client.query(`
      CREATE OR REPLACE FUNCTION agile_cms.delete_content_type_data(table_name TEXT, record_id INT) RETURNS BOOLEAN AS $$
      DECLARE
          row_count INT;
      BEGIN
          EXECUTE format('DELETE FROM agile_cms.%I WHERE id = %s;', table_name, record_id);
          GET DIAGNOSTICS row_count = ROW_COUNT;
          IF row_count > 0 THEN RETURN TRUE; ELSE RETURN FALSE; END IF;
      EXCEPTION WHEN OTHERS THEN RETURN FALSE;
      END;
      $$ LANGUAGE plpgsql;
    `)

    await client.query(`CREATE OR REPLACE FUNCTION agile_cms.publish_content_type_row(
  p_table TEXT,
  p_id    INT
) RETURNS BOOLEAN AS $$
DECLARE
  current_version INT;
BEGIN
  -- Get current version of the target row
  EXECUTE format('SELECT version FROM agile_cms.%I WHERE id = %L', p_table, p_id)
  INTO current_version;

  -- Archive any other published rows
  EXECUTE format(
    'UPDATE agile_cms.%I SET status = ''archived'' WHERE status = ''published'' AND id != %L',
    p_table, p_id
  );

  -- Promote this row to published
  EXECUTE format(
    'UPDATE agile_cms.%I SET status = ''published'', published_at = NOW(), version = %s WHERE id = %s',
    p_table, current_version + 1, p_id
  );

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error publishing: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
`)

    await client.query(`CREATE OR REPLACE FUNCTION agile_cms.get_collection_by_status(
  p_table TEXT,
  p_status TEXT
) RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  EXECUTE format(
    'SELECT json_agg(t) FROM agile_cms.%I t WHERE status = %L',
    p_table, p_status
  ) INTO result;
  RETURN result; 
END;
$$ LANGUAGE plpgsql;
`)

    // update content type data
    await client.query(`
      CREATE OR REPLACE FUNCTION agile_cms.update_content_type_data(table_name TEXT, id INT, update_data JSONB) RETURNS BOOLEAN AS $$
      DECLARE
          update_pairs TEXT := '';
          column_entry RECORD;
          row_count INT;
          result JSONB;
          current_version INT;
      BEGIN
          -- Get current version
          EXECUTE format('SELECT version FROM %I WHERE id = %s', table_name, id) INTO current_version;
          IF current_version IS NULL THEN
              RETURN FALSE;
          END IF;

          -- Build update pairs
          FOR column_entry IN SELECT * FROM jsonb_each(update_data) LOOP
              IF column_entry.key != 'version' THEN  -- Skip version in update pairs
                  update_pairs := update_pairs || quote_ident(column_entry.key) || ' = ' || 
                      CASE 
                          WHEN jsonb_typeof(column_entry.value) = 'string' THEN quote_literal(trim(both '"' from column_entry.value::TEXT))
                          WHEN jsonb_typeof(column_entry.value) = 'null' THEN 'NULL'
                          ELSE column_entry.value::TEXT
                      END || ', ';
              END IF;
          END LOOP;
          
          -- Add version increment and updated_at
          update_pairs := update_pairs || 'version = ' || (current_version + 1) || ', updated_at = NOW()';
          
          -- Get current data for versioning
          EXECUTE format('SELECT to_jsonb(t) FROM %I t WHERE id = %s', table_name, id) INTO result;
          
          -- Save version
          PERFORM agile_cms.save_content_version(table_name, id, result, current_version);
          
          -- Execute update
          EXECUTE format('UPDATE %I SET %s WHERE id = %s', table_name, update_pairs, id);
          
          GET DIAGNOSTICS row_count = ROW_COUNT;
          RETURN row_count > 0;
      EXCEPTION WHEN OTHERS THEN 
          RAISE NOTICE 'Error updating: %', SQLERRM;
          RETURN FALSE;
      END;
      $$ LANGUAGE plpgsql;
    `)
    
    // this is the conflictted code block, commenting if needed!!
    /*
    // update content type data
    await client.query(`
      CREATE OR REPLACE FUNCTION agile_cms.update_content_type_data(table_name TEXT, id INT, update_data JSONB) RETURNS BOOLEAN AS $$
      DECLARE
          update_pairs TEXT := '';
          column_entry RECORD;
          row_count INT;
          result JSONB;
          current_version INT;
      BEGIN
          -- Get current version
          EXECUTE format('SELECT version FROM %I WHERE id = %s', table_name, id) INTO current_version;
          IF current_version IS NULL THEN
              RETURN FALSE;
          END IF;

          -- Build update pairs
          FOR column_entry IN SELECT * FROM jsonb_each(update_data) LOOP
              IF column_entry.key != 'version' THEN  -- Skip version in update pairs
                  update_pairs := update_pairs || quote_ident(column_entry.key) || ' = ' || 
                      CASE 
                          WHEN jsonb_typeof(column_entry.value) = 'string' THEN quote_literal(trim(both '"' from column_entry.value::TEXT))
                          WHEN jsonb_typeof(column_entry.value) = 'null' THEN 'NULL'
                          ELSE column_entry.value::TEXT
                      END || ', ';
              END IF;
          END LOOP;
 <<<<<<< dev/bhupesh-frontend-backend
          
          -- Add version increment and updated_at
          update_pairs := update_pairs || 'version = ' || (current_version + 1) || ', updated_at = NOW()';
          
          -- Get current data for versioning
          EXECUTE format('SELECT to_jsonb(t) FROM %I t WHERE id = %s', table_name, id) INTO result;
          
          -- Save version
          PERFORM agile_cms.save_content_version(table_name, id, result, current_version);
          
          -- Execute update
          EXECUTE format('UPDATE %I SET %s WHERE id = %s', table_name, update_pairs, id);
          
 =======
          update_pairs := TRIM(BOTH ', ' FROM update_pairs);
          IF update_pairs = '' THEN RETURN FALSE; END IF;
          EXECUTE format('UPDATE agile_cms.%I SET %s WHERE id = %s;', table_name, update_pairs, id);
 >>>>>>> master
          GET DIAGNOSTICS row_count = ROW_COUNT;
          RETURN row_count > 0;
      EXCEPTION WHEN OTHERS THEN 
          RAISE NOTICE 'Error updating: %', SQLERRM;
          RETURN FALSE;
      END;
      $$ LANGUAGE plpgsql;
    `)
    */

    await client.query(`
    CREATE OR REPLACE FUNCTION agile_cms.rollback_content_type_row(
  p_table TEXT,
  p_id INT,
  p_version INT
) RETURNS BOOLEAN AS $$
DECLARE
  snapshot JSONB;
  update_pairs TEXT := '';
  column_entry RECORD;
  row_count INT;
BEGIN
  SELECT data INTO snapshot
  FROM agile_cms.content_versions
  WHERE table_name = p_table AND record_id = p_id AND version = p_version
  ORDER BY created_at DESC
  LIMIT 1;

  IF snapshot IS NULL THEN
    RETURN FALSE;
  END IF;

  FOR column_entry IN SELECT * FROM jsonb_each(snapshot) LOOP
    -- 🚫 Skip primary key or system columns
    IF column_entry.key IN ('id', 'created_at') THEN
      CONTINUE;
    END IF;

    IF column_entry.value IS NULL THEN
      update_pairs := update_pairs || quote_ident(column_entry.key) || ' = NULL, ';
    ELSE
      update_pairs := update_pairs || quote_ident(column_entry.key) || ' = ' ||
        CASE
          WHEN jsonb_typeof(column_entry.value) = 'string'
            THEN quote_literal(trim(both '"' from column_entry.value::TEXT))
          WHEN jsonb_typeof(column_entry.value) = 'null'
            THEN 'NULL'
          ELSE column_entry.value::TEXT
        END || ', ';
    END IF;
  END LOOP;

  update_pairs := TRIM(BOTH ', ' FROM update_pairs);

  EXECUTE format('UPDATE %I SET %s WHERE id = %s', p_table, update_pairs, p_id);
  GET DIAGNOSTICS row_count = ROW_COUNT;

  RETURN row_count > 0;

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Rollback error: %', SQLERRM;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;


      `)
    // delete table

    await client.query(`
      CREATE OR REPLACE FUNCTION agile_cms.delete_content_type_table(table_name TEXT) RETURNS BOOLEAN AS $$
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

    // register super user function
    await client.query(`
      CREATE OR REPLACE FUNCTION agile_cms.register_super_admin(
        p_firstname TEXT,
        p_lastname TEXT,
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

    -- Insert the Super Admin user with firstname and lastname
    INSERT INTO users (email, password_hash, first_name, last_name, created_at)
    VALUES (p_email, hashed_password, p_firstname, p_lastname, NOW())
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
    await client.query(`CREATE OR REPLACE FUNCTION agile_cms.register_user(
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

    await client.query(`CREATE OR REPLACE FUNCTION agile_cms.assign_role_to_user(
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
    await client.query(`CREATE OR REPLACE FUNCTION agile_cms.get_user_role(p_email TEXT)
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
    await client.query(`CREATE OR REPLACE FUNCTION agile_cms.authenticate_user(
    p_email TEXT,
    p_password TEXT
) RETURNS JSON AS $$
DECLARE
    user_json JSON;
    stored_hash TEXT;
BEGIN
    -- Retrieve the user details along with the hashed password
    SELECT json_build_object(
        'id', id,
        'email', email,
        'first_name', first_name,
        'last_name', last_name
    ), password_hash
    INTO user_json, stored_hash
    FROM users
    WHERE email = p_email;

    -- If no user found, return NULL
    IF user_json IS NULL THEN
        RETURN 'false';
    END IF;

    -- Compare provided password with stored hash
    IF NOT (stored_hash = crypt(p_password, stored_hash)) THEN
        RETURN 'false';
    END IF;

    RETURN user_json;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error: %', SQLERRM;
        RETURN NULL;
END;
$$ LANGUAGE plpgsql;
`)

    // find user to check in the db for login
    await client.query(`CREATE OR REPLACE FUNCTION agile_cms.find_user(p_email TEXT) 
RETURNS BOOLEAN AS $$
DECLARE
    user_exists BOOLEAN;
BEGIN
    -- Check if user exists
    SELECT EXISTS (SELECT 1 FROM users WHERE email = p_email) INTO user_exists;
    
    RETURN user_exists;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error finding user: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
`)

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
            WHERE table_schema = 'agile_cms'
            AND table_name = p_table_name
        ) INTO table_exists;

        IF NOT table_exists THEN
            RETURN QUERY SELECT FALSE, format('Table "%s" does not exist', p_table_name);
            RETURN;
        END IF;

        -- Execute dynamic SQL to drop the table
        EXECUTE format('DROP TABLE IF EXISTS agile_cms.%I CASCADE;', p_table_name);

        RETURN QUERY SELECT TRUE, format('Table "%s" deleted successfully', p_table_name);
    EXCEPTION
        WHEN OTHERS THEN
            RETURN QUERY SELECT FALSE, format('Error deleting table "%s": %s', p_table_name, SQLERRM);
    END;
    $$ LANGUAGE plpgsql;`
    )

    // get all collections
    await client.query(`
       CREATE OR REPLACE FUNCTION agile_cms.get_all_collections()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(coll_obj ORDER BY coll_obj->>'collection_name')  
  INTO result
  FROM (
    SELECT json_build_object(
      'collection_name', t.table_name,
      'columns', (
        SELECT json_agg(
                 json_build_object(
                   'column_name', c.column_name,
                   'data_type',   c.data_type
                 )
                 ORDER BY c.ordinal_position
               )
        FROM information_schema.columns c
        WHERE c.table_schema = 'agile_cms'
          AND c.table_name  = t.table_name
      )
    ) AS coll_obj
    FROM information_schema.tables t
    WHERE t.table_schema = 'agile_cms'
  ) sub;

  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

      `)

    await client.query(
      `
              CREATE OR REPLACE FUNCTION agile_cms.get_all_users()  
              RETURNS TABLE(id UUID, first_name TEXT, last_name TEXT, email TEXT, role TEXT) AS $$  
              BEGIN  
                  RETURN QUERY  
                  SELECT u.id, u.first_name, u.last_name, u.email, r.name AS role  
                  FROM users u  
                  LEFT JOIN user_roles ur ON u.id = ur.user_id  
                  LEFT JOIN roles r ON ur.role_id = r.id  
                  ORDER BY u.created_at DESC;  
              END;  
              $$ LANGUAGE plpgsql;
          
          `
    )
    // get collection by name
    await client.query(
      `
         CREATE OR REPLACE FUNCTION agile_cms.get_collection_by_name(p_table_name TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT COALESCE(
           json_agg(
             json_build_object(
               'column_name', column_name,
               'data_type',   data_type
             )
           ),
           '[]'::json
         )
    INTO result
    FROM information_schema.columns
   WHERE lower(table_name) = lower(p_table_name)
     AND table_schema      = 'agile_cms';
  RETURN result;
END;
$$ LANGUAGE plpgsql;
        `
    )

    // delete attribute(column )from a table
    await client.query(
      `
            CREATE OR REPLACE FUNCTION agile_cms.delete_attribute_from_collection(
    p_table_name TEXT,
    p_column_name TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    -- Check if column exists before attempting to drop
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = p_table_name AND column_name = p_column_name
    ) THEN
        EXECUTE format('ALTER TABLE agile_cms.%I DROP COLUMN %I;', p_table_name, p_column_name);
        RETURN TRUE;
    ELSE
        RETURN FALSE;  -- Column does not exist
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error deleting column: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

        `
    )

    // get collection data
    await client.query(
      `
CREATE OR REPLACE FUNCTION agile_cms.get_collection_data(
  p_table_name TEXT,
  p_limit INT DEFAULT 10,
  p_offset INT DEFAULT 0
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    EXECUTE format(
      'SELECT json_agg(t) FROM (
         SELECT * FROM agile_cms.%I LIMIT %s OFFSET %s
       ) t',
       p_table_name, p_limit, p_offset
    )
    INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

        
        `
    )

    // psql function to create function and table
    await client.query(`

-- 1. images table
CREATE TABLE IF NOT EXISTS agile_cms.images (
  image_id    SERIAL        PRIMARY KEY,
  title       TEXT          NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 2. utbl_image_galleries table
CREATE TABLE IF NOT EXISTS agile_cms.utbl_image_galleries (
  image_gallery_id SERIAL     PRIMARY KEY,
  image_id         INT         NOT NULL
    REFERENCES agile_cms.images(image_id)
    ON DELETE CASCADE,
  url              JSONB       NOT NULL
);

-- 3. Index to speed up joins/filters on image_id
CREATE INDEX IF NOT EXISTS idx_utbl_image_galleries_image_id
  ON agile_cms.utbl_image_galleries(image_id);

-- 4. FUNCTION: create_image
CREATE OR REPLACE FUNCTION agile_cms.create_image(
  p_title       TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS TABLE (
  image_id    INT,
  title       TEXT,
  description TEXT,
  created_at  TIMESTAMPTZ
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
    INSERT INTO agile_cms.images AS img(title, description)
    VALUES (p_title, p_description)
    RETURNING
      img.image_id,
      img.title,
      img.description,
      img.created_at;
END;
$$;

-- 5. FUNCTION: agile_cms.create_image_gallery
CREATE OR REPLACE FUNCTION agile_cms.create_image_gallery(
  p_image_id   INT,
  p_url        JSONB
)
RETURNS TABLE (
  image_gallery_id INT,
  image_id         INT,
  url               JSONB
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
    INSERT INTO agile_cms.utbl_image_galleries AS ig(image_id, url)
    VALUES (p_image_id, p_url)
    RETURNING
      ig.image_gallery_id,
      ig.image_id,
      ig.url;
END;
$$;

      `)

    await client.query(`
        
        
        -- 6. FUNCTION: get a single image by its ID
CREATE OR REPLACE FUNCTION agile_cms.get_image(
  p_image_id INT
)
RETURNS TABLE (
  image_id    INT,
  title       TEXT,
  description TEXT,
  created_at  TIMESTAMPTZ
)
LANGUAGE sql AS $$
  SELECT image_id, title, description, created_at
    FROM agile_cms.images
   WHERE image_id = p_image_id;
$$;

-- 7. FUNCTION: list all images
CREATE OR REPLACE FUNCTION agile_cms.list_images()
RETURNS SETOF agile_cms.images
LANGUAGE sql AS $$
  SELECT * FROM agile_cms.images;
$$;

-- 8. FUNCTION: get a single gallery entry by its ID
CREATE OR REPLACE FUNCTION agile_cms.get_image_gallery(
  p_image_gallery_id INT
)
RETURNS TABLE (
  image_gallery_id INT,
  image_id         INT,
  url              JSONB
)
LANGUAGE sql AS $$
  SELECT image_gallery_id, image_id, url
    FROM agile_cms.utbl_image_galleries
   WHERE image_gallery_id = p_image_gallery_id;
$$;

-- 9. FUNCTION: list all gallery entries
CREATE OR REPLACE FUNCTION agile_cms.list_utbl_image_galleries()
RETURNS SETOF agile_cms.utbl_image_galleries
LANGUAGE sql AS $$
  SELECT * FROM agile_cms.utbl_image_galleries;
$$;

-- 10. FUNCTION: list all gallery entries for a given image
CREATE OR REPLACE FUNCTION agile_cms.list_utbl_image_galleries_by_image(
  p_image_id INT
)
RETURNS TABLE (
  image_gallery_id INT,
  image_id         INT,
  url              JSONB
)
LANGUAGE sql AS $$
  SELECT image_gallery_id, image_id, url
    FROM agile_cms.utbl_image_galleries
   WHERE image_id = p_image_id;
$$;

-- 11. FUNCTION: list all images joined with their gallery rows
CREATE OR REPLACE FUNCTION agile_cms.list_images_with_galleries()
RETURNS TABLE (
  image_id         INT,
  title            TEXT,
  description      TEXT,
  created_at       TIMESTAMPTZ,
  image_gallery_id INT,
  url              JSONB
)
LANGUAGE sql AS $$
  SELECT
    i.image_id,
    i.title,
    i.description,
    i.created_at,
    ig.image_gallery_id,
    ig.url
  FROM agile_cms.images AS i
  LEFT JOIN agile_cms.utbl_image_galleries AS ig
    ON i.image_id = ig.image_id;
$$;

        `)

    // return the client
    return client
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
  }
}

export default initializeDatabase
