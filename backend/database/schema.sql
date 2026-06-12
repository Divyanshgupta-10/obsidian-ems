-- =====================================================
--  HRMS Database Schema
--  Company: i-SOFTZONE Technologies Pvt Ltd
--  Database: hrms_db
-- =====================================================

-- Users (Auth + Employees)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'employee',       -- 'admin', 'manager', 'employee'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Departments
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  department_name VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Employee Profiles (One-to-One with Users)
CREATE TABLE employee_profiles (
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

-- Leave Applications
CREATE TABLE leaves (
  id SERIAL PRIMARY KEY,
  employee_id INT REFERENCES users(id),
  leave_type VARCHAR(100),              -- 'sick', 'casual', 'earned', 'maternity'
  start_date DATE,
  end_date DATE,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  approved_by INT REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Assets
CREATE TABLE assets (
  id SERIAL PRIMARY KEY,
  asset_code VARCHAR(50) UNIQUE NOT NULL,
  asset_name VARCHAR(200) NOT NULL,
  asset_type VARCHAR(100),              -- 'laptop', 'monitor', 'id_card', etc.
  purchase_date DATE,
  purchase_cost NUMERIC(12,2),
  status VARCHAR(50) DEFAULT 'available', -- 'available', 'allocated', 'damaged', 'lost'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Asset Allocations (One-to-Many: Employee can have multiple assets)
CREATE TABLE asset_allocations (
  id SERIAL PRIMARY KEY,
  asset_id INT REFERENCES assets(id),
  employee_id INT REFERENCES users(id),
  allocated_by INT REFERENCES users(id),
  allocated_date DATE DEFAULT CURRENT_DATE,
  return_date DATE,
  status VARCHAR(50) DEFAULT 'allocated',  -- 'allocated', 'returned'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Asset History (Audit trail for assets)
CREATE TABLE asset_history (
  id SERIAL PRIMARY KEY,
  asset_id INT REFERENCES assets(id),
  action VARCHAR(100),
  remarks TEXT,
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications (Event-Driven)
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  title VARCHAR(200),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Audit Logs (JSONB for before/after data)
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(100),
  action_type VARCHAR(50),              -- 'INSERT', 'UPDATE', 'DELETE'
  record_id INT,
  old_data JSONB,
  new_data JSONB,
  performed_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INDEXES (Performance Optimization)
-- =====================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_ep_user_id ON employee_profiles(user_id);
CREATE INDEX idx_ep_dept_id ON employee_profiles(department_id);
CREATE INDEX idx_leaves_employee ON leaves(employee_id);
CREATE INDEX idx_leaves_status ON leaves(status);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_alloc_employee ON asset_allocations(employee_id);
CREATE INDEX idx_alloc_asset ON asset_allocations(asset_id);
CREATE INDEX idx_notif_user ON notifications(user_id);
CREATE INDEX idx_notif_read ON notifications(is_read);
CREATE INDEX idx_audit_table ON audit_logs(table_name);

-- =====================================================
-- VIEWS
-- =====================================================
CREATE VIEW employee_summary AS
SELECT u.id, u.name, u.email, u.role, u.is_active,
       d.department_name, ep.designation, ep.salary, ep.joining_date, ep.phone
FROM users u
LEFT JOIN employee_profiles ep ON u.id = ep.user_id
LEFT JOIN departments d ON d.id = ep.department_id;

CREATE VIEW leave_summary AS
SELECT l.id, u.name AS employee_name, d.department_name,
       l.leave_type, l.start_date, l.end_date, l.status, l.reason, l.created_at,
       (l.end_date - l.start_date + 1) AS total_days
FROM leaves l
JOIN users u ON l.employee_id = u.id
LEFT JOIN employee_profiles ep ON u.id = ep.user_id
LEFT JOIN departments d ON d.id = ep.department_id;

CREATE VIEW asset_summary AS
SELECT a.id, a.asset_code, a.asset_name, a.asset_type, a.status, a.purchase_cost,
       u.name AS assigned_to, aa.allocated_date, aa.return_date
FROM assets a
LEFT JOIN asset_allocations aa ON a.id = aa.asset_id AND aa.status = 'allocated'
LEFT JOIN users u ON aa.employee_id = u.id;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

-- Calculate leave balance per employee per year
CREATE OR REPLACE FUNCTION calculate_leave_balance(emp_id INT)
RETURNS TABLE(leave_type VARCHAR, total_taken BIGINT, remaining INT) AS $$
BEGIN
  RETURN QUERY
  SELECT l.leave_type, COUNT(*)::BIGINT,
         GREATEST(0, 12 - COUNT(*))::INT
  FROM leaves l
  WHERE l.employee_id = emp_id
    AND l.status = 'approved'
    AND EXTRACT(YEAR FROM l.start_date) = EXTRACT(YEAR FROM CURRENT_DATE)
  GROUP BY l.leave_type;
END;
$$ LANGUAGE plpgsql;

-- Department statistics
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
