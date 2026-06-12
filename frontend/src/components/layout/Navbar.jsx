import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { notificationService } from '../../services/notificationService';
import { setNotifications, decrementUnread } from '../../store/slices/notificationSlice';
import styles from './Navbar.module.css';
import { useAuth } from '../../hooks/useAuth';

function Navbar({ title, subtitle }) {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { unread, list } = useSelector((s) => s.notifications);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchNotifs = () => {
      notificationService.list()
        .then((r) => dispatch(setNotifications(r.data.data)))
        .catch(() => {});
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const markRead = async (id) => {
    try {
      await notificationService.markRead(id);
      dispatch(decrementUnread());
    } catch (_) {}
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U';

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <div className={styles.title}>{title}</div>
        {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
      </div>
      <div className={styles.actions}>
        <div className={styles.search}>
          🔍 <span>Search everything... (Ctrl+K)</span>
        </div>

        <div style={{ position: 'relative' }}>
          <button
            className={styles.notifBtn}
            onClick={() => setShowDropdown((p) => !p)}
            title="Notifications"
          >
            🔔
            {unread > 0 && <span className={styles.notifBadge}>{unread > 9 ? '9+' : unread}</span>}
          </button>

          {showDropdown && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                Notifications 
                {unread > 0 && <span className="badge badge-pending">{unread} new</span>}
              </div>
              <div className={styles.dropdownList}>
                {list.length === 0 ? (
                  <div className={styles.dropdownEmpty}>
                    No notifications
                  </div>
                ) : list.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.is_read && markRead(n.id)}
                    className={`${styles.dropdownItem} ${!n.is_read ? styles.dropdownItemUnread : ''}`}
                  >
                    <div className={styles.dropdownItemTitle}>{n.title}</div>
                    <div className={styles.dropdownItemMessage}>{n.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.avatar}>{initials}</div>
      </div>
    </header>
  );
}

export default Navbar;
