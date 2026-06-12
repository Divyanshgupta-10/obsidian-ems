-- Password Reset Tokens Table
-- Run this AFTER schema.sql if you haven't already
CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reset_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_reset_user ON password_resets(user_id);
