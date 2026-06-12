import Sidebar from './Sidebar';
import Navbar from './Navbar';

function Layout({ children, title, subtitle }) {
  return (
    <div className="layout-wrapper">
      <Sidebar />
      <div className="main-content">
        <Navbar title={title} subtitle={subtitle} />
        <div className="page-container fade-in">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;
