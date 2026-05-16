import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import News from "./pages/News";
import ESGRankings from "./pages/ESGRankings";
import Personalized from "./pages/Personalized";
import PortfolioBuilder from "./pages/PortfolioBuilder";
import Optimizer from "./pages/Optimizer";
import MLPredictions from "./pages/MLPredictions";
import "./index.css";
import EventSimulator from './pages/EventSimulator';
import GoalPlanner from './pages/GoalPlanner';
import FDAnalyzer from './pages/FDAnalyzer';


const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem("esg_user");
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const Layout = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%" }}>
      {!isLoginPage && <Sidebar />}
      <main
        className="main"
        style={{
          marginLeft: isLoginPage ? "0" : "var(--sidebar-w)",
          width: "100%",
        }}
      >
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        {/* EVERYTHING MUST GO INSIDE THIS ROUTES BLOCK */}
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/news"
            element={
              <ProtectedRoute>
                <News />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rankings"
            element={
              <ProtectedRoute>
                <ESGRankings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/personalized"
            element={
              <ProtectedRoute>
                <Personalized />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portfolio"
            element={
              <ProtectedRoute>
                <PortfolioBuilder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/optimizer"
            element={
              <ProtectedRoute>
                <Optimizer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ml"
            element={
              <ProtectedRoute>
                <MLPredictions />
              </ProtectedRoute>
            }
          />

          <Route path="/simulator" element={<ProtectedRoute><EventSimulator /></ProtectedRoute>} />
          <Route path="/planner" element={<ProtectedRoute><GoalPlanner /></ProtectedRoute>} />
          <Route path="/fd-analyzer" element={<ProtectedRoute><FDAnalyzer /></ProtectedRoute>} />
        </Routes>
        {/* DO NOT PUT ANY <Route> TAGS DOWN HERE! */}
      </Layout>

      
    </Router>
  );
}

export default App;
