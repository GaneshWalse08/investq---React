import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Scatter } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
);

export default function Optimizer() {
  const [savedPortfolios, setSavedPortfolios] = useState([]);
  const [selectedPortIdx, setSelectedPortIdx] = useState("");
  const [goal, setGoal] = useState("max_ret"); // Defaulting to Maximize Return based on your screenshot
  const [investmentAmount, setInvestmentAmount] = useState(50000); // New state for Target Investment
  const [stockPrices, setStockPrices] = useState({}); // To hold live INR prices for share calculations

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Results State
  const [verdict, setVerdict] = useState("");
  const [comparison, setComparison] = useState([]);
  const [optResult, setOptResult] = useState(null);
  const [currentReturn, setCurrentReturn] = useState(0);
  const [frontierData, setFrontierData] = useState(null);

  // 1. Fetch user's saved portfolios AND live stock prices on load
  useEffect(() => {
    const fetchInitialData = async () => {
      const userStr = localStorage.getItem("esg_user");
      if (!userStr) return;
      const user = JSON.parse(userStr);

      try {
        // Fetch portfolios and stocks concurrently
        const [portRes, stocksRes] = await Promise.all([
          api.get(`/portfolio/load?user_id=${user.id}`),
          api.get("/stocks"),
        ]);

        if (portRes.data.success && portRes.data.portfolios) {
          setSavedPortfolios(portRes.data.portfolios);
        }

        // Create a dictionary of Ticker -> Live Price in INR
        if (stocksRes.data) {
          const priceMap = {};
          stocksRes.data.forEach((s) => {
            priceMap[s.ticker] = s.price * 83.5; // USD to INR conversion
          });
          setStockPrices(priceMap);
        }
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      }
    };
    fetchInitialData();
  }, []);

  // 2. Run the AI Optimizer
  const runOptimization = async () => {
    if (selectedPortIdx === "")
      return alert("Please select a saved portfolio to optimize.");

    setLoading(true);
    setError(null);
    setOptResult(null); // Clear old results

    const selectedPortfolio = savedPortfolios[selectedPortIdx].data;
    const tickers = selectedPortfolio.map((item) => item.ticker);

    try {
      // Fetch the optimization math AND the efficient frontier chart points concurrently
      const [optRes, frontRes] = await Promise.all([
        api.post("/portfolio/optimize_saved", {
          holdings: selectedPortfolio,
          goal: goal,
        }),
        api.post("/portfolio/efficient_frontier", { tickers: tickers }),
      ]);

      if (!optRes.data.success) {
        setError(optRes.data.message);
        return;
      }

      setVerdict(optRes.data.verdict);
      setComparison(optRes.data.comparison);
      setOptResult(optRes.data.optimal_result);
      setCurrentReturn(optRes.data.current_return);
      setFrontierData(frontRes.data);
    } catch (err) {
      console.error(err);
      setError("Server error during optimization. Is Python running?");
    } finally {
      setLoading(false);
    }
  };

  // 3. Prepare Chart Data
  const pieData = optResult
    ? {
        labels: optResult.allocation.map((a) => a.ticker),
        datasets: [
          {
            data: optResult.allocation.map((a) => a.weight),
            backgroundColor: [
              "#2d6a4f",
              "#52b788",
              "#d4a843",
              "#3b82f6",
              "#8b5cf6",
              "#ef4444",
              "#f97316",
              "#06b6d4",
            ],
            borderWidth: 0,
          },
        ],
      }
    : null;

  const scatterData = frontierData
    ? {
        datasets: [
          {
            label: "Efficient Frontier",
            data: (frontierData.frontier || []).map((p) => ({
              x: p.vol,
              y: p.return,
            })),
            borderColor: "#2d6a4f",
            backgroundColor: "#2d6a4f",
            pointRadius: 3,
            showLine: true,
            fill: false,
          },
          {
            label: "Individual Stocks",
            data: (frontierData.individual_stocks || []).map((s) => ({
              x: s.vol,
              y: s.return,
              ticker: s.ticker,
            })),
            backgroundColor: "#d4a843",
            pointRadius: 6,
            borderColor: "#92400e",
          },
        ],
      }
    : null;

  return (
    <div className="page active">
      <div className="page-header">
        <h1>Portfolio Optimizer & AI Rebalancing</h1>
        <p>
          Select a saved portfolio to get step-by-step instructions on how to
          rebalance it.
        </p>
      </div>

      {/* CONTROLS */}
      <div className="chart-card" style={{ background: "var(--paper)" }}>
        <h3>Select Portfolio & Define Target</h3>
        <div
          className="controls"
          style={{
            marginTop: "1rem",
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--smoke)",
              }}
            >
              Saved Portfolio
            </label>
            <select
              className="ctrl-select"
              value={selectedPortIdx}
              onChange={(e) => setSelectedPortIdx(e.target.value)}
              style={{ width: "100%", marginTop: "0.3rem" }}
            >
              <option value="">-- Select a Portfolio --</option>
              {savedPortfolios.map((p, index) => (
                <option key={p.id} value={index}>
                  {p.name} ({p.data.length} Assets)
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: "180px" }}>
            <label
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--smoke)",
              }}
            >
              Optimization Goal
            </label>
            <select
              className="ctrl-select"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              style={{ width: "100%", marginTop: "0.3rem" }}
            >
              <option value="max_ret">Maximize Return</option>
              <option value="sharpe">Maximize Sharpe (Balanced)</option>
              <option value="min_vol">Minimize Volatility (Safest)</option>
            </select>
          </div>

          <div style={{ flex: 1, minWidth: "150px" }}>
            <label
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--moss)",
              }}
            >
              Target Investment (₹)
            </label>
            <input
              type="number"
              className="ctrl-input"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(Number(e.target.value))}
              style={{
                width: "100%",
                marginTop: "0.3rem",
                borderColor: "var(--moss)",
              }}
            />
          </div>

          <button
            className="ctrl-btn"
            onClick={runOptimization}
            disabled={loading}
            style={{ height: "42px", padding: "0 1.5rem" }}
          >
            {loading ? "⏳ Running Simulations..." : "⚗️ Run AI Rebalance"}
          </button>
        </div>
      </div>

      {error && (
        <div className="loading" style={{ color: "var(--rust)" }}>
          🚨 {error}
        </div>
      )}

      {/* RESULTS */}
      {optResult && (
        <>
          <div
            className="chart-card"
            style={{
              background: "#fdfaf4",
              borderLeft: "4px solid var(--moss)",
            }}
          >
            <h3
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span style={{ fontSize: "1.4rem" }}>🤖</span> AI Rebalancing
              Verdict
            </h3>

            {/* Dangerously set inner HTML because the backend sends formatted bold/list tags */}
            <p
              style={{
                fontSize: "0.95rem",
                lineHeight: 1.6,
                color: "var(--ink)",
                marginBottom: "1.5rem",
              }}
              dangerouslySetInnerHTML={{ __html: verdict }}
            />

            <div style={{ overflowX: "auto" }}>
              <table
                className="data-table"
                style={{ marginTop: "1rem", background: "#fff" }}
              >
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Current Weight</th>
                    <th>Optimal Weight</th>
                    <th>Target Inv. (₹)</th>
                    <th>Target Shares</th>
                    <th>AI Action</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((c) => {
                    const actLower = c.action.toLowerCase();
                    const badgeClass =
                      actLower === "buy"
                        ? "invest"
                        : actLower === "sell"
                          ? "hold"
                          : actLower === "remove"
                            ? "avoid"
                            : "invest";
                    const isHold = c.action === "HOLD";

                    // Dynamic Math for actionable shopping list
                    const targetInv =
                      (c.optimal_weight / 100) * investmentAmount;
                    const livePriceInr = stockPrices[c.ticker] || 1; // Prevent division by zero
                    const targetShares = targetInv / livePriceInr;

                    return (
                      <tr key={c.ticker}>
                        <td>
                          <strong>{c.ticker}</strong>
                        </td>
                        <td>{c.current_weight.toFixed(1)}%</td>
                        <td
                          style={{ color: "var(--moss)", fontWeight: "bold" }}
                        >
                          {c.optimal_weight.toFixed(1)}%
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          ₹
                          {targetInv.toLocaleString("en-IN", {
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {targetShares.toFixed(2)}
                        </td>
                        <td>
                          <span
                            className={`badge badge-${badgeClass}`}
                            style={
                              isHold
                                ? { background: "#e5e7eb", color: "#374151" }
                                : {}
                            }
                          >
                            {c.action}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="cards-row cards-3">
            <div className="card">
              <div className="card-title">New Expected Return</div>
              <div className="card-value pos">{optResult.expected_return}%</div>
              <div className="card-sub">Was {currentReturn}%</div>
            </div>
            <div className="card">
              <div className="card-title">New Volatility</div>
              <div className="card-value">{optResult.expected_vol}%</div>
            </div>
            <div className="card">
              <div className="card-title">Sharpe Ratio</div>
              <div className="card-value">{optResult.sharpe_ratio}</div>
              <div className="card-sub">Goal: {optResult.goal}</div>
            </div>
          </div>

          <div className="cards-row cards-2">
            <div className="chart-card">
              <h3>Optimal Allocation</h3>
              <div className="chart-wrap" style={{ height: "250px" }}>
                <Doughnut
                  data={pieData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "65%",
                    plugins: { legend: { position: "right" } },
                  }}
                />
              </div>
            </div>
            <div className="chart-card">
              <h3>Efficient Frontier</h3>
              <div className="chart-wrap" style={{ height: "250px" }}>
                <Scatter
                  data={scatterData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: { title: { display: true, text: "Volatility %" } },
                      y: { title: { display: true, text: "Return %" } },
                    },
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: (ctx) => {
                            const label = ctx.raw.ticker || "Frontier Point";
                            return `${label}: Vol ${ctx.raw.x.toFixed(1)}%, Ret ${ctx.raw.y.toFixed(1)}%`;
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
