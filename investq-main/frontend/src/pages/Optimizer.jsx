import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Scatter, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
);

export default function Optimizer() {
  const [savedPortfolios, setSavedPortfolios] = useState([]);
  const [selectedPortIdx, setSelectedPortIdx] = useState("");
  const [goal, setGoal] = useState("max_ret");
  const [investmentAmount, setInvestmentAmount] = useState(50000);
  const [stockPrices, setStockPrices] = useState({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Results State
  const [verdict, setVerdict] = useState("");
  const [comparison, setComparison] = useState([]);
  const [optResult, setOptResult] = useState(null);
  const [currentReturn, setCurrentReturn] = useState(0);
  const [currentAssets, setCurrentAssets] = useState([]);
  const [frontierData, setFrontierData] = useState(null);
  const [suggestedSwaps, setSuggestedSwaps] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const userStr = localStorage.getItem("esg_user");
      if (!userStr) return;
      const user = JSON.parse(userStr);

      try {
        const [portRes, stocksRes] = await Promise.all([
          api.get(`/portfolio/load?user_id=${user.id}`),
          api.get("/stocks"),
        ]);
        if (portRes.data.success && portRes.data.portfolios)
          setSavedPortfolios(portRes.data.portfolios);
        if (stocksRes.data) {
          const priceMap = {};
          stocksRes.data.forEach((s) => (priceMap[s.ticker] = s.price * 83.5));
          setStockPrices(priceMap);
        }
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      }
    };
    fetchInitialData();
  }, []);

  const runOptimization = async () => {
    if (selectedPortIdx === "")
      return alert("Please select a saved portfolio to optimize.");
    setLoading(true);
    setError(null);
    setOptResult(null);

    const selectedPortfolio = savedPortfolios[selectedPortIdx].data;
    const tickers = selectedPortfolio.map((item) => item.ticker);

    try {
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

      setVerdict(optRes.data.verdict || "");
      setComparison(optRes.data.comparison || []);
      setOptResult(optRes.data.optimal_result || null);
      setCurrentReturn(optRes.data.current_return || 0);
      setCurrentAssets(optRes.data.current_assets || []);
      setSuggestedSwaps(optRes.data.suggested_swaps || []);
      setFrontierData(frontRes.data || null);
    } catch (err) {
      console.error(err);
      setError("Server error during optimization. Is Python running?");
    } finally {
      setLoading(false);
    }
  };

  // --- DYNAMIC EXPLANATION LOGIC ---
  // Find the top assets to inject into the text
  let topCurrentAsset = { ticker: "a single stock", current_weight: 0 };
  let topBuy = null;
  let topSell = null;

  if (comparison && comparison.length > 0) {
    topCurrentAsset = comparison.reduce((prev, current) =>
      prev.current_weight > current.current_weight ? prev : current,
    );
    const buys = comparison
      .filter((c) => c.action === "BUY")
      .sort((a, b) => b.optimal_weight - a.optimal_weight);
    const sells = comparison
      .filter((c) => c.action === "SELL" || c.action === "REMOVE")
      .sort((a, b) => b.current_weight - a.current_weight);
    topBuy = buys.length > 0 ? buys[0] : null;
    topSell = sells.length > 0 ? sells[0] : null;
  }

  const goalName =
    goal === "max_ret"
      ? "Maximum Return"
      : goal === "sharpe"
        ? "Maximum Sharpe (Balanced)"
        : "Minimum Volatility (Safest)";

  // --- CHART DATA GENERATORS ---
  const currentPieData = {
    labels: comparison.map((c) => c.ticker),
    datasets: [
      {
        data: comparison.map((c) => c.current_weight),
        backgroundColor: [
          "#6b7280",
          "#9ca3af",
          "#d1d5db",
          "#e5e7eb",
          "#f3f4f6",
        ],
        borderWidth: 0,
      },
    ],
  };

  const optimalPieData = optResult
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
            ],
            borderWidth: 0,
          },
        ],
      }
    : null;

  const riskReturnBarData = optResult
    ? {
        labels: ["Expected Return (%)"],
        datasets: [
          {
            label: "Before",
            data: [currentReturn],
            backgroundColor: "#9ca3af",
          },
          {
            label: "After (AI Optimal)",
            data: [optResult.expected_return],
            backgroundColor: "#2d6a4f",
          },
        ],
      }
    : null;

  return (
    <div className="page active">
      <div className="page-header">
        <h1>Portfolio Optimizer & Deep AI Analysis</h1>
        <p>
          Analyze your current holdings, re-weight for maximum efficiency, and
          swap out underperforming assets.
        </p>
      </div>

      {/* CONTROLS */}
      <div className="chart-card" style={{ background: "var(--paper)" }}>
        <div
          className="controls"
          style={{
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
              Target Inv. (₹)
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
            {loading ? "⏳ Simulating..." : "⚗️ Deep Rebalance"}
          </button>
        </div>
      </div>

      {error && (
        <div className="loading" style={{ color: "var(--rust)" }}>
          🚨 {error}
        </div>
      )}

      {/* RESULTS DASHBOARD */}
      {optResult && (
        <>
          {/* Section 1: Visual Overview */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <div className="chart-card" style={{ marginBottom: 0 }}>
              <h3 style={{ color: "var(--smoke)", marginBottom: "0.5rem" }}>
                Current Allocation (Before)
              </h3>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--smoke)",
                  lineHeight: 1.4,
                  marginBottom: "1rem",
                }}
              >
                ℹ️ <strong>What this means:</strong> This shows how your money
                is currently divided. Right now, your portfolio is heavily
                exposed to <strong>{topCurrentAsset.ticker}</strong>, which
                makes up{" "}
                <strong>{topCurrentAsset.current_weight.toFixed(1)}%</strong> of
                your holdings. If {topCurrentAsset.ticker} crashes, your whole
                portfolio takes a massive hit.
              </p>
              <div style={{ height: "200px" }}>
                <Doughnut
                  data={currentPieData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "75%",
                    plugins: { legend: { position: "right" } },
                  }}
                />
              </div>
            </div>

            <div
              className="chart-card"
              style={{ marginBottom: 0, border: "2px solid var(--moss)" }}
            >
              <h3 style={{ color: "var(--moss)", marginBottom: "0.5rem" }}>
                AI Optimal Allocation (After)
              </h3>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--smoke)",
                  lineHeight: 1.4,
                  marginBottom: "1rem",
                }}
              >
                ℹ️ <strong>What this means:</strong> The AI resized the slices
                to protect your money while chasing {goalName}.{" "}
                {topSell && topBuy
                  ? `For example, it suggests dropping ${topSell.ticker} down to ${topSell.optimal_weight.toFixed(1)}% and buying more ${topBuy.ticker} to balance your risk.`
                  : `It has perfectly balanced your assets to minimize dangerous over-concentration.`}
              </p>
              <div style={{ height: "200px" }}>
                <Doughnut
                  data={optimalPieData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "75%",
                    plugins: { legend: { position: "right" } },
                  }}
                />
              </div>
            </div>
          </div>

          <div className="cards-row cards-2">
            <div className="chart-card">
              <h3 style={{ marginBottom: "0.5rem" }}>Return Impact Analysis</h3>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--smoke)",
                  lineHeight: 1.4,
                  marginBottom: "1rem",
                }}
              >
                ℹ️ <strong>What this means:</strong> Your expected return
                shifted from <strong>{currentReturn}%</strong> to{" "}
                <strong>{optResult.expected_return}%</strong>.{" "}
                {optResult.expected_return < currentReturn
                  ? `The AI sacrificed a small amount of profit to heavily reduce your risk of a catastrophic loss by diversifying away from ${topCurrentAsset.ticker}.`
                  : `The AI mathematically optimized your weights to squeeze even more profit out of your current assets.`}
              </p>
              <div style={{ height: "200px" }}>
                <Bar
                  data={riskReturnBarData}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            </div>

            <div className="chart-card">
              <h3 style={{ marginBottom: "0.5rem" }}>Efficient Frontier</h3>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--smoke)",
                  lineHeight: 1.4,
                  marginBottom: "1rem",
                }}
              >
                ℹ️ <strong>What this means:</strong> The dark green line
                represents mathematical perfection. The yellow dots are your
                individual stocks like{" "}
                <strong>
                  {comparison
                    .slice(0, 3)
                    .map((c) => c.ticker)
                    .join(", ")}
                </strong>
                . The AI is combining them so your overall portfolio lands
                safely on that green line.
              </p>
              <div style={{ height: "200px" }}>
                {frontierData && (
                  <Scatter
                    data={{
                      datasets: [
                        {
                          label: "Frontier Curve",
                          data: (frontierData.frontier || []).map((p) => ({
                            x: p.vol,
                            y: p.return,
                          })),
                          borderColor: "#2d6a4f",
                          backgroundColor: "#2d6a4f",
                          showLine: true,
                          fill: false,
                        },
                        {
                          label: "Your Assets",
                          data: (frontierData.individual_stocks || []).map(
                            (s) => ({
                              x: s.vol,
                              y: s.return,
                              ticker: s.ticker,
                            }),
                          ),
                          backgroundColor: "#d4a843",
                          pointRadius: 6,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        x: {
                          title: { display: true, text: "Risk (Volatility %)" },
                        },
                        y: {
                          title: { display: true, text: "Expected Return %" },
                        },
                      },
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Deep Action Plan */}
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
              <span style={{ fontSize: "1.4rem" }}>🤖</span> Step 1: Deep Asset
              Reweighting Plan
            </h3>
            <p
              style={{
                fontSize: "0.95rem",
                lineHeight: 1.6,
                color: "var(--ink)",
                marginBottom: "1rem",
              }}
              dangerouslySetInnerHTML={{ __html: verdict }}
            />

            <div style={{ overflowX: "auto", marginBottom: "1.5rem" }}>
              <table
                className="data-table"
                style={{ width: "100%", background: "#fff" }}
              >
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Action</th>
                    <th>Before</th>
                    <th>Optimal Target</th>
                    <th>Target Inv. (₹)</th>
                    <th>Shares Required</th>
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
                    const targetInv =
                      (c.optimal_weight / 100) * investmentAmount;
                    const targetShares =
                      targetInv / (stockPrices[c.ticker] || 1);

                    return (
                      <tr key={c.ticker}>
                        <td>
                          <strong>{c.ticker}</strong>
                        </td>
                        <td>
                          <span className={`badge badge-${badgeClass}`}>
                            {c.action}
                          </span>
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
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {targetShares.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* DEEP REASONING CARDS */}
            <h4 style={{ marginBottom: "1rem", color: "var(--ink)" }}>
              AI Execution Logic:
            </h4>
            <div style={{ display: "grid", gap: "1rem" }}>
              {comparison.map((c) => (
                <div
                  key={`reason-${c.ticker}`}
                  style={{
                    padding: "1rem",
                    background: "#fff",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    display: "flex",
                    gap: "1rem",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ fontSize: "1.5rem" }}>
                    {c.action === "BUY"
                      ? "📈"
                      : c.action === "SELL"
                        ? "📉"
                        : c.action === "REMOVE"
                          ? "✂️"
                          : "⚖️"}
                  </div>
                  <div>
                    <strong style={{ fontSize: "1.1rem" }}>{c.ticker}</strong>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "var(--smoke)",
                        marginTop: "0.3rem",
                        lineHeight: 1.5,
                      }}
                    >
                      {c.reasoning}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: AI Smart Swaps */}
          {suggestedSwaps.length > 0 && (
            <div
              className="chart-card"
              style={{ borderLeft: "4px solid var(--gold)" }}
            >
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                <span style={{ fontSize: "1.4rem" }}>💡</span> Step 2:
                Predictive Market Swaps
              </h3>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--smoke)",
                  marginBottom: "1.5rem",
                  lineHeight: 1.4,
                }}
              >
                ℹ️ <strong>What this means:</strong> The AI has scanned the
                broader market and found better companies in the exact same
                sector as the ones you are selling. For example, replacing{" "}
                {suggestedSwaps[0].remove_ticker} with{" "}
                {suggestedSwaps[0].add_ticker} will instantly upgrade your
                risk-to-reward ratio.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                {suggestedSwaps.map((swap, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "#fff",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      padding: "1.5rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1rem",
                      }}
                    >
                      <div
                        style={{
                          color: "var(--rust)",
                          fontWeight: "bold",
                          fontSize: "1.2rem",
                        }}
                      >
                        ↓ Drop {swap.remove_ticker}
                      </div>
                      <div
                        style={{
                          color: "var(--moss)",
                          fontWeight: "bold",
                          fontSize: "1.2rem",
                        }}
                      >
                        ↑ Add {swap.add_ticker}
                      </div>
                    </div>

                    <p
                      style={{
                        fontSize: "0.85rem",
                        lineHeight: 1.5,
                        marginBottom: "1.5rem",
                        color: "var(--ink)",
                      }}
                    >
                      {swap.reason}
                    </p>

                    <div style={{ height: "120px" }}>
                      <Bar
                        data={{
                          labels: ["1-Year Return (%)"],
                          datasets: [
                            {
                              label: swap.remove_ticker,
                              data: [swap.remove_ret],
                              backgroundColor: "#ef4444",
                            },
                            {
                              label: swap.add_ticker,
                              data: [swap.add_ret],
                              backgroundColor: "#22c55e",
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          indexAxis: "y",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
