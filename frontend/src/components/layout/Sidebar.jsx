import { NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../store/slices/authSlice';
import Logo from '../Logo';
import styles from './Sidebar.module.css';

const navItems = [
  { label: 'Main', items: [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/profile', icon: '👤', label: 'My Profile' },
    { to: '/leaves', icon: '🌴', label: 'My Leaves' },
  ]},
  { label: 'Management', roles: ['admin','manager'], items: [
    { to: '/employees', icon: '👥', label: 'Employees' },
    { to: '/assets', icon: '🖥️', label: 'Assets' },
  ]},
  { label: 'Analytics', roles: ['admin'], items: [
    { to: '/reports', icon: '📈', label: 'Reports & Analytics' },
  ]},
];

function Sidebar() {
  const { user, isAdmin, isManager } = useAuth();
  const dispatch = useDispatch();

  const canAccess = (roles) => {
    if (!roles) return true;
    if (roles.includes('admin') && isAdmin) return true;
    if (roles.includes('manager') && isManager) return true;
    return false;
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U';

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}><Logo size={28} /></div>
        <div className={styles.logoText}>Obsidian EMS</div>
      </div>

      <nav className={styles.nav}>
        {navItems.map((section, sectionIndex) => {
          if (!canAccess(section.roles)) return null;
          return (
            <div key={section.label}>
              <div className={styles.navSectionTitle}>{section.label}</div>
              {section.items.map((item, itemIndex) => {
                // Calculate staggering delay
                const delay = (sectionIndex * 0.1) + (itemIndex * 0.05);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `${styles.navItem}${isActive ? ` ${styles.active}` : ''}`}
                    style={{ animationDelay: `${delay}s` }}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className={styles.userName}>{user?.name}</div>
            <div className={styles.userRole}>{user?.role}</div>
          </div>
          <button
            onClick={() => dispatch(logout())}
            title="Logout"
            className={styles.logoutBtn}
          >🚪</button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
