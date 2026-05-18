import React, { useEffect, useState } from "react";
import api, { getDashboardSummary } from "../api/axiosConfig";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Radar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [sectorData, setSectorData] = useState(null);

  // IMMEDIATELY GRAB THE REAL NAME FROM CACHE
  const [username, setUsername] = useState(
    localStorage.getItem("username") || "Investor",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both the main summary and the sector heatmap simultaneously
        const [summaryRes, sectorRes] = await Promise.all([
          getDashboardSummary(),
          api.get("/research/sector_heatmap"),
        ]);

        setData(summaryRes.data);
        setSectorData(sectorRes.data);
      } catch (err) {
        console.error("Dashboard Error:", err);
        setError("Could not connect to the AI Backend.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading AI Insights...</div>;
  if (error)
    return (
      <div className="loading" style={{ color: "#b91c1c" }}>
        🚨 {error}
      </div>
    );
  if (!data) return null;

  const {
    market_overview,
    sentiment,
    top_esg,
    top_ranked,
    top_gainers,
    top_losers,
    recent_news,
  } = data;

  // Chart Data Configurations
  const barChartData = {
    labels: top_ranked?.map((r) => r.ticker) || [],
    datasets: [
      {
        label: "Total Score",
        data: top_ranked?.map((r) => r.total_score) || [],
        backgroundColor: "#2d6a4f99",
        borderColor: "#2d6a4f",
        borderWidth: 2,
      },
      {
        label: "ESG Score",
        data: top_ranked?.map((r) => r.esg_total) || [],
        backgroundColor: "#52b78899",
        borderColor: "#52b788",
        borderWidth: 2,
      },
    ],
  };

  const radarChartData = {
    labels: sectorData ? Object.keys(sectorData) : [],
    datasets: [
      {
        label: "ESG Total",
        data: sectorData
          ? Object.keys(sectorData).map((s) => sectorData[s].total)
          : [],
        backgroundColor: "#2d6a4f33",
        borderColor: "#2d6a4f",
        borderWidth: 2,
      },
      {
        label: "Avg Return (%)",
        data: sectorData
          ? Object.keys(sectorData).map((s) => sectorData[s].avg_return)
          : [],
        backgroundColor: "#d4a84333",
        borderColor: "#d4a843",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="page active">
      <div className="page-header">
        {/* Dynamically displaying the actual username */}
        <h1>
          Good morning, <span>{username}</span> 👋
        </h1>
        <p>
          Here's your sustainable investment intelligence briefing for today.
        </p>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="cards-row cards-4">
        <div className="card">
          <div className="card-title">Market Mood</div>
          <div className="card-value">
            {market_overview?.market_mood || "—"}
          </div>
          <div className="card-sub">
            Avg change: {market_overview?.avg_market_change || "0"}%
          </div>
        </div>
        <div className="card">
          <div className="card-title">Fear & Greed</div>
          <div className="card-value">{sentiment?.fear_greed_index || "—"}</div>
          <div className="card-sub">Market Sentiment Index</div>
        </div>
        <div className="card">
          <div className="card-title">Top ESG Score</div>
          <div className="card-value">{top_esg?.[0]?.total || "—"}</div>
          <div className="card-sub">
            {top_esg?.[0]?.ticker || "—"} ({top_esg?.[0]?.rating || "—"})
          </div>
        </div>
        <div className="card">
          <div className="card-title">Stocks Tracked</div>
          <div className="card-value">
            {market_overview?.total_stocks || "—"}
          </div>
          <div className="card-sub">
            {market_overview?.sectors?.length || "0"} sectors covered
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="cards-row cards-2">
        <div className="chart-card">
          <h3>Top 5 ESG Ranked Stocks</h3>
          <div className="chart-wrap" style={{ height: "260px" }}>
            <Bar
              data={barChartData}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>
        <div className="chart-card">
          <h3>Sector ESG vs Return Comparison</h3>
          <div className="chart-wrap" style={{ height: "260px" }}>
            <Radar
              data={radarChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: { r: { ticks: { stepSize: 20 } } },
              }}
            />
          </div>
        </div>
      </div>

      {/* Gainers and Losers Tables */}
      <div className="cards-row cards-2">
        <div className="chart-card" style={{ borderTop: "4px solid #52b788" }}>
          <h3>🚀 Today's Top Gainers</h3>
          <table
            className="data-table"
            style={{
              width: "100%",
              textAlign: "left",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid #e2e8f0",
                  fontSize: "0.8rem",
                  color: "#64748b",
                }}
              >
                <th style={{ padding: "0.5rem" }}>Asset</th>
                <th>Price (₹)</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              {top_gainers?.map((s) => (
                <tr
                  key={s.ticker}
                  style={{ borderBottom: "1px solid #f1f5f9" }}
                >
                  <td style={{ padding: "0.5rem" }}>
                    <strong>{s.ticker}</strong>
                  </td>
                  <td>
                    ₹
                    {(s.price * 83.5).toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td style={{ fontWeight: "bold", color: "#16a34a" }}>
                    +{s.change_pct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="chart-card" style={{ borderTop: "4px solid #ef4444" }}>
          <h3>🔻 Today's Top Losers</h3>
          <table
            className="data-table"
            style={{
              width: "100%",
              textAlign: "left",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid #e2e8f0",
                  fontSize: "0.8rem",
                  color: "#64748b",
                }}
              >
                <th style={{ padding: "0.5rem" }}>Asset</th>
                <th>Price (₹)</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              {top_losers?.map((s) => (
                <tr
                  key={s.ticker}
                  style={{ borderBottom: "1px solid #f1f5f9" }}
                >
                  <td style={{ padding: "0.5rem" }}>
                    <strong>{s.ticker}</strong>
                  </td>
                  <td>
                    ₹
                    {(s.price * 83.5).toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td style={{ fontWeight: "bold", color: "#dc2626" }}>
                    {s.change_pct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Market News */}
      <div className="chart-card">
        <h3>📰 Latest Market News</h3>
        <div>
          {recent_news?.map((n, idx) => (
            <div
              key={idx}
              style={{ padding: "0.8rem 0", borderBottom: "1px solid #f1f5f9" }}
            >
              <div
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  marginBottom: "0.3rem",
                }}
              >
                {n.headline}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "0.8rem",
                  fontSize: "0.75rem",
                  color: "#64748b",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    padding: "0.15rem 0.5rem",
                    borderRadius: "10px",
                    fontWeight: 700,
                    background:
                      n.sentiment_label === "Positive"
                        ? "#dcfce7"
                        : n.sentiment_label === "Negative"
                          ? "#fee2e2"
                          : "#f3f4f6",
                    color:
                      n.sentiment_label === "Positive"
                        ? "#166534"
                        : n.sentiment_label === "Negative"
                          ? "#991b1b"
                          : "#6b7280",
                  }}
                >
                  {n.sentiment_label} {n.sentiment_pct}%
                </span>
                <span>{n.source}</span>
                <span>{n.category}</span>
                {n.ticker && (
                  <span>
                    <strong>{n.ticker}</strong>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
