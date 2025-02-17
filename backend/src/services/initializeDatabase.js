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
      `SELECT 1 FROM pg_database WHERE datname = '${envConfig.PG_DATABASE}';`
    )
    if (res.rows.length === 0) {
      console.log(
        `⚠️ Database '${envConfig.PG_DATABASE}' not found. Creating...`
      )
      await adminClient.query(`CREATE DATABASE ${envConfig.PG_DATABASE};`)
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
      await client.end()
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
    await client.query(`
      CREATE OR REPLACE FUNCTION create_content_type(table_name TEXT, schema JSONB) RETURNS TEXT AS $$
      DECLARE
          column_definitions TEXT := '';
          column_entry RECORD;
          col_name TEXT;
          col_type TEXT;
          constraints TEXT;
      BEGIN
          FOR column_entry IN SELECT * FROM jsonb_each(schema) LOOP
              col_name := quote_ident(column_entry.key);
              col_type := column_entry.value->>'type';
              constraints := COALESCE(column_entry.value->>'constraints', '');
              IF col_type NOT IN ('TEXT', 'INTEGER', 'BOOLEAN', 'TIMESTAMP', 'DATE', 'NUMERIC', 'JSONB') THEN
                  RAISE EXCEPTION 'Unsupported data type: %', col_type;
              END IF;
              column_definitions := column_definitions || format('%s %s %s, ', col_name, col_type, constraints);
          END LOOP;
          column_definitions := TRIM(BOTH ', ' FROM column_definitions);
          IF column_definitions = '' THEN
              RAISE EXCEPTION 'Schema must contain at least one column';
          END IF;
          EXECUTE format('CREATE TABLE IF NOT EXISTS %I (id SERIAL PRIMARY KEY, %s);', table_name, column_definitions);
          RETURN format('Table %I created successfully (or already exists)', table_name);
      END;
      $$ LANGUAGE plpgsql;
    `)

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
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
  }
}

export default initializeDatabase
