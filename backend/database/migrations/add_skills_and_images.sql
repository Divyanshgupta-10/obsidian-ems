-- =====================================================
-- Migration: Add Skills and Employee Images
-- =====================================================

-- ── 1. SKILLS TABLE ───────────────────────────────────
CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

-- ── 2. EMPLOYEE_SKILLS JUNCTION ───────────────────────
CREATE TABLE IF NOT EXISTS employee_skills (
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  skill_id INT REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, skill_id)
);

-- ── 3. EMPLOYEE_IMAGES TABLE ──────────────────────────
CREATE TABLE IF NOT EXISTS employee_images (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  filepath VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- ── 4. INDEXES ────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_employee_images_user ON employee_images(user_id);

-- ── 5. SEED INITIAL SKILLS ────────────────────────────
INSERT INTO skills (name) VALUES
('JavaScript'),
('React'),
('Node.js'),
('PostgreSQL'),
('Python'),
('Java'),
('AWS'),
('Docker'),
('Kubernetes'),
('UI/UX Design'),
('Project Management')
ON CONFLICT DO NOTHING;
