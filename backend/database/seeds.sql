-- =====================================================
-- HRMS Demo Accounts Seed Script
-- Run this ONCE after schema.sql to create test users
-- All passwords: Admin@123
-- =====================================================

-- The bcrypt hash below = 'Admin@123' with 12 rounds
-- Generated via: bcrypt.hash('Admin@123', 12)
-- You can regenerate: node -e "require('bcrypt').hash('Admin@123',12).then(console.log)"

DO $$
DECLARE
  admin_hash TEXT := '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGFD.e3tZfH1Z6yJgJt7wPfkS9u';
BEGIN

-- ── 1. Admin Account ───────────────────────────────────
INSERT INTO users (name, email, password, role, is_active)
VALUES ('Pranay Gupta', 'pranay@isoftzone.com', admin_hash, 'admin', TRUE)
ON CONFLICT (email) DO NOTHING;

-- ── 2. Manager Account ─────────────────────────────────
INSERT INTO users (name, email, password, role, is_active)
VALUES ('Rahul Sharma', 'rahul@isoftzone.com', admin_hash, 'manager', TRUE)
ON CONFLICT (email) DO NOTHING;

-- ── 3. HR Manager ──────────────────────────────────────
INSERT INTO users (name, email, password, role, is_active)
VALUES ('Priya Singh', 'priya@isoftzone.com', admin_hash, 'manager', TRUE)
ON CONFLICT (email) DO NOTHING;

-- ── 4. Employee Accounts ────────────────────────────────
INSERT INTO users (name, email, password, role, is_active)
VALUES ('Amit Kumar', 'amit@isoftzone.com', admin_hash, 'employee', TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, password, role, is_active)
VALUES ('Sneha Patel', 'sneha@isoftzone.com', admin_hash, 'employee', TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, password, role, is_active)
VALUES ('Arjun Reddy', 'arjun@isoftzone.com', admin_hash, 'employee', TRUE)
ON CONFLICT (email) DO NOTHING;

END $$;

-- ── Assign Employee Profiles ────────────────────────────
INSERT INTO employee_profiles (user_id, department_id, designation, salary, phone, joining_date)
SELECT u.id, d.id, 'Software Developer', 65000, '9876543210', '2024-01-15'
FROM users u, departments d
WHERE u.email = 'amit@isoftzone.com' AND d.department_name = 'Software Development'
ON CONFLICT DO NOTHING;

INSERT INTO employee_profiles (user_id, department_id, designation, salary, phone, joining_date)
SELECT u.id, d.id, 'QA Engineer', 55000, '9876543211', '2024-02-01'
FROM users u, departments d
WHERE u.email = 'sneha@isoftzone.com' AND d.department_name = 'Quality Assurance'
ON CONFLICT DO NOTHING;

INSERT INTO employee_profiles (user_id, department_id, designation, salary, phone, joining_date)
SELECT u.id, d.id, 'HR Manager', 70000, '9876543212', '2023-11-01'
FROM users u, departments d
WHERE u.email = 'priya@isoftzone.com' AND d.department_name = 'Human Resources'
ON CONFLICT DO NOTHING;

INSERT INTO employee_profiles (user_id, department_id, designation, salary, phone, joining_date)
SELECT u.id, d.id, 'Engineering Manager', 90000, '9876543213', '2023-06-01'
FROM users u, departments d
WHERE u.email = 'rahul@isoftzone.com' AND d.department_name = 'Software Development'
ON CONFLICT DO NOTHING;

INSERT INTO employee_profiles (user_id, department_id, designation, salary, phone, joining_date)
SELECT u.id, d.id, 'Full Stack Developer', 55000, '9876543214', '2024-05-10'
FROM users u, departments d
WHERE u.email = 'arjun@isoftzone.com' AND d.department_name = 'Software Development'
ON CONFLICT DO NOTHING;

-- ── Demo Assets ─────────────────────────────────────────
INSERT INTO assets (asset_code, asset_name, asset_type, purchase_date, purchase_cost, status) VALUES
('LT-001', 'Dell Latitude 5520', 'laptop', '2024-01-15', 75000, 'available'),
('LT-002', 'Lenovo ThinkPad X1', 'laptop', '2024-02-01', 85000, 'available'),
('MN-001', 'Dell 27" Monitor', 'monitor', '2024-01-15', 22000, 'available'),
('MN-002', 'LG UltraWide 34"', 'monitor', '2024-03-10', 35000, 'available'),
('ID-001', 'Access Card - Floor 1', 'id_card', '2024-01-01', 500, 'available'),
('MO-001', 'Logitech MX Master 3', 'mouse', '2024-01-15', 6000, 'available'),
('KB-001', 'Mechanical Keyboard', 'keyboard', '2024-01-15', 4500, 'available')
ON CONFLICT (asset_code) DO NOTHING;

-- ── Demo Leave Requests ──────────────────────────────────
INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason, status)
SELECT u.id, 'sick', '2024-06-10', '2024-06-11', 'Fever and cold', 'approved'
FROM users u WHERE u.email = 'amit@isoftzone.com';

INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason, status)
SELECT u.id, 'casual', '2024-07-05', '2024-07-05', 'Family function', 'pending'
FROM users u WHERE u.email = 'sneha@isoftzone.com';

INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason, status)
SELECT u.id, 'earned', '2024-08-15', '2024-08-20', 'Annual vacation', 'pending'
FROM users u WHERE u.email = 'arjun@isoftzone.com';

-- ── Verify ───────────────────────────────────────────────
SELECT u.name, u.email, u.role,
       ep.designation, d.department_name
FROM users u
LEFT JOIN employee_profiles ep ON u.id = ep.user_id
LEFT JOIN departments d ON ep.department_id = d.id
ORDER BY u.role, u.name;
