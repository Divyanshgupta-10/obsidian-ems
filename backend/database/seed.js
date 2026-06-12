/**
 * HRMS Demo Account Seeder
 * Run: node seed.js
 * 
 * Creates all demo accounts with properly hashed passwords.
 * All passwords: Admin@123
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'hrms_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

const DEMO_PASSWORD = 'Admin@123';

const users = [
  { name: 'Pranay Gupta',  email: 'pranay@isoftzone.com', role: 'admin' },
  { name: 'Rahul Sharma',  email: 'rahul@isoftzone.com',  role: 'manager' },
  { name: 'Priya Singh',   email: 'priya@isoftzone.com',  role: 'manager' },
  { name: 'Amit Kumar',    email: 'amit@isoftzone.com',   role: 'employee' },
  { name: 'Sneha Patel',   email: 'sneha@isoftzone.com',  role: 'employee' },
  { name: 'Arjun Reddy',   email: 'arjun@isoftzone.com',  role: 'employee' },
];

async function seed() {
  console.log('🌱 HRMS Seeder Starting...\n');
  const hash = await bcrypt.hash(DEMO_PASSWORD, 12);
  console.log(`🔐 Password hashed: ${DEMO_PASSWORD}\n`);

  // 1. Insert users
  for (const u of users) {
    const existing = await pool.query('SELECT id FROM users WHERE email=$1', [u.email]);
    if (existing.rows.length > 0) {
      console.log(`⏭️  Skipped (already exists): ${u.email}`);
      continue;
    }
    await pool.query(
      `INSERT INTO users (name, email, password, role, is_active) VALUES ($1,$2,$3,$4,TRUE)`,
      [u.name, u.email, hash, u.role]
    );
    console.log(`✅ Created [${u.role.padEnd(8)}] ${u.name} — ${u.email}`);
  }

  // 2. Assign profiles
  const profiles = [
    { email: 'amit@isoftzone.com',   dept: 'Software Development', designation: 'Software Developer',   salary: 65000, phone: '9871234560', joining: '2024-01-15' },
    { email: 'sneha@isoftzone.com',  dept: 'Quality Assurance',    designation: 'QA Engineer',           salary: 55000, phone: '9871234561', joining: '2024-02-01' },
    { email: 'arjun@isoftzone.com',  dept: 'Software Development', designation: 'Full Stack Developer',  salary: 55000, phone: '9871234562', joining: '2024-05-10' },
    { email: 'priya@isoftzone.com',  dept: 'Human Resources',      designation: 'HR Manager',            salary: 70000, phone: '9871234563', joining: '2023-11-01' },
    { email: 'rahul@isoftzone.com',  dept: 'Software Development', designation: 'Engineering Manager',   salary: 90000, phone: '9871234564', joining: '2023-06-01' },
    { email: 'pranay@isoftzone.com', dept: 'Operations',           designation: 'System Administrator',  salary: 95000, phone: '9871234565', joining: '2023-01-01' },
  ];

  console.log('\n📋 Assigning employee profiles...');
  for (const p of profiles) {
    const userRes = await pool.query('SELECT id FROM users WHERE email=$1', [p.email]);
    const deptRes = await pool.query('SELECT id FROM departments WHERE department_name=$1', [p.dept]);
    if (!userRes.rows.length || !deptRes.rows.length) continue;

    const uid = userRes.rows[0].id;
    const did = deptRes.rows[0].id;
    const ep = await pool.query('SELECT id FROM employee_profiles WHERE user_id=$1', [uid]);
    if (ep.rows.length > 0) { console.log(`⏭️  Profile exists: ${p.email}`); continue; }

    await pool.query(
      `INSERT INTO employee_profiles (user_id,department_id,designation,salary,phone,joining_date)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [uid, did, p.designation, p.salary, p.phone, p.joining]
    );
    console.log(`✅ Profile set: ${p.email} → ${p.dept}`);
  }

  // 3. Sample assets
  console.log('\n🖥️  Adding sample assets...');
  const assets = [
    ['LT-001', 'Dell Latitude 5520',    'laptop',   '2024-01-15', 75000],
    ['LT-002', 'Lenovo ThinkPad X1',    'laptop',   '2024-02-01', 85000],
    ['MN-001', 'Dell 27" Monitor',      'monitor',  '2024-01-15', 22000],
    ['MN-002', 'LG UltraWide 34"',      'monitor',  '2024-03-10', 35000],
    ['ID-001', 'Access Card - Floor 1', 'id_card',  '2024-01-01', 500  ],
    ['MO-001', 'Logitech MX Master 3',  'mouse',    '2024-01-15', 6000 ],
    ['KB-001', 'Mechanical Keyboard',   'keyboard', '2024-01-15', 4500 ],
  ];
  for (const [code, name, type, date, cost] of assets) {
    const ex = await pool.query('SELECT id FROM assets WHERE asset_code=$1', [code]);
    if (ex.rows.length) { console.log(`⏭️  Asset exists: ${code}`); continue; }
    await pool.query(
      `INSERT INTO assets (asset_code,asset_name,asset_type,purchase_date,purchase_cost,status) VALUES ($1,$2,$3,$4,$5,'available')`,
      [code, name, type, date, cost]
    );
    console.log(`✅ Asset: ${code} — ${name}`);
  }

  // 4. Sample leaves
  console.log('\n🌴 Adding sample leave requests...');
  const amitId = (await pool.query('SELECT id FROM users WHERE email=$1', ['amit@isoftzone.com'])).rows[0]?.id;
  const snehaId = (await pool.query('SELECT id FROM users WHERE email=$1', ['sneha@isoftzone.com'])).rows[0]?.id;
  const arjunId = (await pool.query('SELECT id FROM users WHERE email=$1', ['arjun@isoftzone.com'])).rows[0]?.id;

  if (amitId) {
    await pool.query(`INSERT INTO leaves (employee_id,leave_type,start_date,end_date,reason,status) VALUES ($1,'sick','2024-06-10','2024-06-11','Fever and cold','approved')`, [amitId]).catch(()=>{});
    console.log('✅ Leave: Amit Kumar — sick (approved)');
  }
  if (snehaId) {
    await pool.query(`INSERT INTO leaves (employee_id,leave_type,start_date,end_date,reason,status) VALUES ($1,'casual','2024-07-05','2024-07-05','Family function','pending')`, [snehaId]).catch(()=>{});
    console.log('✅ Leave: Sneha Patel — casual (pending)');
  }
  if (arjunId) {
    await pool.query(`INSERT INTO leaves (employee_id,leave_type,start_date,end_date,reason,status) VALUES ($1,'earned','2024-08-15','2024-08-20','Annual vacation','pending')`, [arjunId]).catch(()=>{});
    console.log('✅ Leave: Arjun Reddy — earned (pending)');
  }

  console.log('\n════════════════════════════════════════');
  console.log('🎉 Seeding Complete!\n');
  console.log('Demo Accounts (Password: Admin@123)');
  console.log('────────────────────────────────────────');
  console.log('👑 Admin:    pranay@isoftzone.com');
  console.log('🔧 Manager:  rahul@isoftzone.com');
  console.log('👥 HR Mgr:   priya@isoftzone.com');
  console.log('💼 Employee: amit@isoftzone.com');
  console.log('💼 Employee: sneha@isoftzone.com');
  console.log('💼 Employee: arjun@isoftzone.com');
  console.log('════════════════════════════════════════\n');

  await pool.end();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
