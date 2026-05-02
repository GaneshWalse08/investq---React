import React from 'react';
import { LayoutDashboard, Newspaper, BarChart3, PieChart, BrainCircuit, Activity } from 'lucide-react';

const Sidebar = ({ activePage, setActivePage, user }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20}/>, section: 'Overview' },
    { id: 'news', label: 'Market News', icon: <Newspaper size={20}/> },
    { id: 'rankings', label: 'ESG Rankings', icon: <BarChart3 size={20}/>, section: 'Stocks' },
    { id: 'portfolio', label: 'Portfolio Builder', icon: <PieChart size={20}/>, section: 'Portfolio' },
    { id: 'ml', label: 'ML Predictions', icon: <BrainCircuit size={20}/>, section: 'Analytics' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">ESG<span>Vision</span></div>
      <div className="sidebar-user">
        <span className="user-avatar">{user?.username[0].toUpperCase()}</span>
        <span className="user-name">{user?.username}</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item, index) => (
          <React.Fragment key={item.id}>
            {item.section && <div className="nav-section">{item.section}</div>}
            <div 
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              <span className="icon">{item.icon}</span> {item.label}
            </div>
          </React.Fragment>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;