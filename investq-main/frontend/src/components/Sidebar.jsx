import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  // Restored: Instantly grabs user from LocalStorage
  const userStr = localStorage.getItem("esg_user");
  const user = userStr ? JSON.parse(userStr) : { username: "Guest" };

  const handleLogout = () => {
    localStorage.removeItem("esg_user");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        ESG<span>Vision</span>
      </div>

      <div
        className="sidebar-user"
        style={{
          padding: "1rem 1.5rem",
          borderBottom: "1px solid var(--mist)",
        }}
      >
        <span className="user-name" style={{ fontWeight: 600 }}>
          {user.username}
        </span>
      </div>

      <nav className="sidebar-nav" style={{ padding: "1rem 0", flex: 1 }}>
        <div
          style={{
            padding: "0.3rem 1.5rem",
            fontSize: "0.7rem",
            color: "var(--smoke)",
            textTransform: "uppercase",
          }}
        >
          Overview
        </div>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="icon">🏠</span> Dashboard
        </NavLink>
        <NavLink
          to="/news"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="icon">📰</span> Market News
        </NavLink>

        <div
          className="nav-section"
          style={{
            padding: "0.3rem 1.5rem",
            fontSize: "0.7rem",
            color: "var(--smoke)",
            textTransform: "uppercase",
            marginTop: "0.8rem",
          }}
        >
          Stocks
        </div>
        <NavLink
          to="/rankings"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="icon">📊</span> ESG Rankings
        </NavLink>
        <NavLink
          to="/personalized"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="icon">🎯</span> My Recommendations
        </NavLink>

        <div
          className="nav-section"
          style={{
            padding: "0.3rem 1.5rem",
            fontSize: "0.7rem",
            color: "var(--smoke)",
            textTransform: "uppercase",
            marginTop: "0.8rem",
          }}
        >
          Portfolio
        </div>
        <NavLink
          to="/portfolio"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="icon">💼</span> Portfolio Builder
        </NavLink>
        <NavLink
          to="/optimizer"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="icon">⚗️</span> Optimizer
        </NavLink>

        <div
          className="nav-section"
          style={{
            padding: "0.3rem 1.5rem",
            fontSize: "0.7rem",
            color: "var(--smoke)",
            textTransform: "uppercase",
            marginTop: "0.8rem",
          }}
        >
          Analytics
        </div>
        <NavLink
          to="/ml"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="icon">🤖</span> ML Predictions
        </NavLink>
        <NavLink
          to="/simulator"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="icon">🌍</span> Event Simulator
        </NavLink>
        <NavLink
          to="/planner"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="icon">🎯</span> Goal Planner
        </NavLink>
        <NavLink
          to="/fd-analyzer"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="icon">⚖️</span> FD Reality Check
        </NavLink>
        <NavLink
          to="/insurance"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span>🛡️</span>
          <span>Insurance AI</span>
        </NavLink>
        <NavLink
          to="/schemes"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span>🏛️</span>
          <span>Govt Schemes</span>
        </NavLink>
        <NavLink
          to="/retirement-planner"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span>🏖️</span>
          <span>Retirement Planner</span>
        </NavLink>


        <NavLink
          to="/financial-health"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span>🩺</span>
          <span>Financial Health Score</span>
        </NavLink>
      </nav>

      <div
        className="sidebar-footer"
        style={{ padding: "1.2rem 1.5rem", borderTop: "1px solid var(--mist)" }}
      >
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "0.5rem",
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            cursor: "pointer",
            color: "var(--smoke)",
          }}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
