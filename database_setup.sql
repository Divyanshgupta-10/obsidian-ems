-- =====================================================
-- HRMS COMPLETE Database Setup — i-SOFTZONE Technologies
-- Run ALL of this in pgAdmin Query Tool connected to hrms_db
-- =====================================================
-- FIRST: Create the database (run connected to 'postgres' db)
-- CREATE DATABASE hrms_db;
-- Then connect to hrms_db and run everything below:
-- =====================================================

-- ── TABLES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'employee',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  department_name VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employee_profiles (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  department_id INT REFERENCES departments(id),
  designation VARCHAR(200),
  salary NUMERIC(12,2),
  joining_date DATE,
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leaves (
  id SERIAL PRIMARY KEY,
  employee_id INT REFERENCES users(id),
  leave_type VARCHAR(100),
  start_date DATE,
  end_date DATE,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  approved_by INT REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assets (
  id SERIAL PRIMARY KEY,
  asset_code VARCHAR(50) UNIQUE NOT NULL,
  asset_name VARCHAR(200) NOT NULL,
  asset_type VARCHAR(100),
  purchase_date DATE,
  purchase_cost NUMERIC(12,2),
  status VARCHAR(50) DEFAULT 'available',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS asset_allocations (
  id SERIAL PRIMARY KEY,
  asset_id INT REFERENCES assets(id),
  employee_id INT REFERENCES users(id),
  allocated_by INT REFERENCES users(id),
  allocated_date DATE DEFAULT CURRENT_DATE,
  return_date DATE,
  status VARCHAR(50) DEFAULT 'allocated',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS asset_history (
  id SERIAL PRIMARY KEY,
  asset_id INT REFERENCES assets(id),
  action VARCHAR(100),
  remarks TEXT,
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  title VARCHAR(200),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(100),
  action_type VARCHAR(50),
  record_id INT,
  old_data JSONB,
  new_data JSONB,
  performed_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ── PASSWORD RESETS (Forgot Password Feature) ─────────
CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ── INDEXES ───────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_ep_user_id ON employee_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_ep_dept_id ON employee_profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_leaves_employee ON leaves(employee_id);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON leaves(status);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_alloc_employee ON asset_allocations(employee_id);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_reset_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_reset_user ON password_resets(user_id);

-- ── DEPARTMENTS MASTER DATA ───────────────────────────
INSERT INTO departments (department_name) VALUES
('Software Development'),
('Quality Assurance'),
('Human Resources'),
('Finance'),
('Digital Marketing'),
('Sales'),
('Operations'),
('Technical Support')
ON CONFLICT DO NOTHING;

-- ── VIEWS ─────────────────────────────────────────────
CREATE OR REPLACE VIEW employee_summary AS
SELECT u.id, u.name, u.email, u.role, u.is_active,
       d.department_name, ep.designation, ep.salary, ep.joining_date, ep.phone
FROM users u
LEFT JOIN employee_profiles ep ON u.id = ep.user_id
LEFT JOIN departments d ON d.id = ep.department_id;

CREATE OR REPLACE VIEW leave_summary AS
SELECT l.id, u.name AS employee_name, d.department_name,
       l.leave_type, l.start_date, l.end_date, l.status, l.reason, l.created_at,
       (l.end_date - l.start_date + 1) AS total_days
FROM leaves l
JOIN users u ON l.employee_id = u.id
LEFT JOIN employee_profiles ep ON u.id = ep.user_id
LEFT JOIN departments d ON d.id = ep.department_id;

CREATE OR REPLACE VIEW asset_summary AS
SELECT a.id, a.asset_code, a.asset_name, a.asset_type, a.status, a.purchase_cost,
       u.name AS assigned_to, aa.allocated_date, aa.return_date
FROM assets a
LEFT JOIN asset_allocations aa ON a.id = aa.asset_id AND aa.status = 'allocated'
LEFT JOIN users u ON aa.employee_id = u.id;

-- ── STORED PROCEDURES ─────────────────────────────────
CREATE OR REPLACE FUNCTION calculate_leave_balance(emp_id INT)
RETURNS TABLE(leave_type VARCHAR, total_taken BIGINT, remaining INT) AS $$
BEGIN
  RETURN QUERY
  SELECT l.leave_type, COUNT(*)::BIGINT, GREATEST(0, 12 - COUNT(*))::INT
  FROM leaves l
  WHERE l.employee_id = emp_id
    AND l.status = 'approved'
    AND EXTRACT(YEAR FROM l.start_date) = EXTRACT(YEAR FROM CURRENT_DATE)
  GROUP BY l.leave_type;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_department_stats()
RETURNS TABLE(department_name VARCHAR, total_employees BIGINT, avg_salary NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT d.department_name, COUNT(ep.user_id)::BIGINT, ROUND(AVG(ep.salary), 2)
  FROM departments d
  LEFT JOIN employee_profiles ep ON d.id = ep.department_id
  GROUP BY d.department_name;
END;
$$ LANGUAGE plpgsql;

-- ── VERIFY ────────────────────────────────────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- =====================================================
-- NEXT STEP: Create demo accounts
-- Open PowerShell and run:
--   cd d:\internship\web2\backend
--   npm run seed
--
-- This creates all accounts with password: Admin@123
-- Then go to http://localhost:3000 and login!
-- =====================================================
