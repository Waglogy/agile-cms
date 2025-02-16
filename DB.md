Here are the **updated PostgreSQL functions from initialization** for your decentralized headless CMS:

---

### **1️⃣ Initialize Database (Run Once)**

Creates necessary tables and inserts default roles and permissions.

```sql
CREATE OR REPLACE FUNCTION initialize_database() RETURNS BOOLEAN AS $$
BEGIN
    -- Create Users Table
    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
    );

    -- Create Roles Table
    CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
    );

    -- Create Permissions Table
    CREATE TABLE IF NOT EXISTS permissions (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
    );

    -- Create User Roles Mapping Table
    CREATE TABLE IF NOT EXISTS user_roles (
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        role_id INT REFERENCES roles(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, role_id)
    );

    -- Create Role Permissions Mapping Table
    CREATE TABLE IF NOT EXISTS role_permissions (
        role_id INT REFERENCES roles(id) ON DELETE CASCADE,
        permission_id INT REFERENCES permissions(id) ON DELETE CASCADE,
        PRIMARY KEY (role_id, permission_id)
    );

    -- Insert Default Roles
    INSERT INTO roles (name) VALUES
    ('Super Admin'),
    ('Content Admin')
    ON CONFLICT (name) DO NOTHING;

    -- Insert Default Permissions
    INSERT INTO permissions (name) VALUES
    ('Create Content'),
    ('Edit Content'),
    ('Delete Content')
    ON CONFLICT (name) DO NOTHING;

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

```

---

### **2️⃣ Register Super Admin**

Creates the first super admin with hashed password.

```sql
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

```

---

### **3️⃣ Register Normal User (Assigned by Super Admin)**

Registers a normal user and assigns a specified role.

```sql
CREATE OR REPLACE FUNCTION register_user(
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
$$ LANGUAGE plpgsql;

```

---

### **4️⃣ Assign Role to User**

```sql
CREATE OR REPLACE FUNCTION assign_role_to_user(
    p_email TEXT,
    p_role TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    user_id UUID;
    role_id INT;
BEGIN
    -- Get user ID
    SELECT id INTO user_id FROM users WHERE email = p_email;
    IF user_id IS NULL THEN
        RAISE NOTICE 'User not found';
        RETURN FALSE;
    END IF;

    -- Get role ID
    SELECT id INTO role_id FROM roles WHERE LOWER(name) = LOWER(p_role);
    IF role_id IS NULL THEN
        RAISE NOTICE 'Role not found';
        RETURN FALSE;
    END IF;

    -- Assign role
    INSERT INTO user_roles (user_id, role_id)
    VALUES (user_id, role_id)
    ON CONFLICT DO NOTHING;

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

```

---

### **5️⃣ Assign Permission to Role**

```sql
CREATE OR REPLACE FUNCTION assign_permission_to_role(
    p_role TEXT,
    p_permission TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    role_id INT;
    permission_id INT;
BEGIN
    -- Get role ID
    SELECT id INTO role_id FROM roles WHERE LOWER(name) = LOWER(p_role);
    IF role_id IS NULL THEN
        RAISE NOTICE 'Role not found';
        RETURN FALSE;
    END IF;

    -- Get permission ID
    SELECT id INTO permission_id FROM permissions WHERE LOWER(name) = LOWER(p_permission);
    IF permission_id IS NULL THEN
        RAISE NOTICE 'Permission not found';
        RETURN FALSE;
    END IF;

    -- Assign permission
    INSERT INTO role_permissions (role_id, permission_id)
    VALUES (role_id, permission_id)
    ON CONFLICT DO NOTHING;

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

```

---

### **6️⃣ Check User Permission**

```sql
CREATE OR REPLACE FUNCTION check_user_permission(
    p_email TEXT,
    p_permission TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    permission_exists BOOLEAN;
BEGIN
    -- Check if user has permission
    SELECT EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        JOIN users u ON ur.user_id = u.id
        WHERE u.email = p_email AND LOWER(p.name) = LOWER(p_permission)
    ) INTO permission_exists;

    RETURN permission_exists;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

```

---

### **7️⃣ Revoke Role from User**

```sql
CREATE OR REPLACE FUNCTION revoke_role_from_user(
    p_email TEXT,
    p_role TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    user_id UUID;
    role_id INT;
BEGIN
    -- Get user ID
    SELECT id INTO user_id FROM users WHERE email = p_email;
    IF user_id IS NULL THEN
        RAISE NOTICE 'User not found';
        RETURN FALSE;
    END IF;

    -- Get role ID
    SELECT id INTO role_id FROM roles WHERE LOWER(name) = LOWER(p_role);
    IF role_id IS NULL THEN
        RAISE NOTICE 'Role not found';
        RETURN FALSE;
    END IF;

    -- Remove role from user
    DELETE FROM user_roles WHERE user_id = user_id AND role_id = role_id;

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

```

---

### **🚀 What's Next?**

- Test these functions in your PostgreSQL database.
- Implement API endpoints in Express.js to call them dynamically.
- Optimize and fine-tune based on performance results.

🔥🔥🔥 Let’s keep building! 🚀✨

Here are some example SQL queries to **test** each of the PostgreSQL functions you just implemented.

---

## **🛠️ 1. Initialize the Database**

Run this **once** to set up the required tables, roles, and permissions.

```sql
SELECT initialize_database();

```

✅ Expected Output: `TRUE` (if setup is successful)

---

## **👑 2. Register Super Admin**

```sql
SELECT register_super_admin('admin@example.com', 'SuperSecurePassword');

```

✅ Expected Output: `TRUE` (Super Admin is created)

---

## **👤 3. Register a Normal User (Created by Super Admin)**

```sql
SELECT register_user('user@example.com', 'UserPassword', 'Content Admin');

```

✅ Expected Output: `TRUE` (User registered and assigned **Content Admin** role)

---

## **🎭 4. Assign Role to an Existing User**

```sql
SELECT assign_role_to_user('user@example.com', 'Content Admin');

```

✅ Expected Output: `TRUE` (Role successfully assigned)

---

## **🔑 5. Assign Permission to a Role**

```sql
SELECT assign_permission_to_role('Content Admin', 'Create Content');
SELECT assign_permission_to_role('Content Admin', 'Edit Content');

```

✅ Expected Output: `TRUE` (Permissions assigned to the role)

---

## **🔍 6. Check if User Has a Specific Permission**

```sql
SELECT check_user_permission('user@example.com', 'Create Content');

```

✅ Expected Output:

- `TRUE` (User has the permission)
- `FALSE` (User does not have the permission)

---

## **❌ 7. Revoke Role from User**

```sql
SELECT revoke_role_from_user('user@example.com', 'Content Admin');

```

✅ Expected Output: `TRUE` (Role removed from user)

---

### **🚀 Next Steps**

- Use these queries to **test** your PostgreSQL functions.
- Implement Express.js endpoints to call these functions dynamically.
- Fine-tune based on your system performance.

🔥🔥🔥 Let's keep it rolling! 🚀✨
