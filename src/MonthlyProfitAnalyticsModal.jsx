import React, { useState } from 'react';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export default function MonthlyProfitAnalyticsModal({ isOpen, onClose, monthlyData, totalAnnualProfit }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!isOpen) return null;

  // Chart dimensions & margins
  const width = 650;
  const height = 300;
  const padding = { top: 40, right: 30, bottom: 50, left: 60 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Compute scale boundaries
  const profits = monthlyData.map(d => d.profit);
  const minProfit = Math.min(0, ...profits);
  const maxProfit = Math.max(1000, ...profits);
  const profitRange = maxProfit - minProfit || 1;

  // Map data to coordinates
  const points = monthlyData.map((d, index) => {
    const x = padding.left + (index / (monthlyData.length - 1)) * innerWidth;
    const y = padding.top + innerHeight - ((d.profit - minProfit) / profitRange) * innerHeight;
    return { ...d, x, y, index };
  });

  const pathD = points.length > 0
    ? points.reduce((acc, p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '')
    : '';

  // Area under line
  const zeroY = padding.top + innerHeight - ((0 - minProfit) / profitRange) * innerHeight;
  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${zeroY} L ${points[0].x} ${zeroY} Z`
    : '';

  // Y-axis ticks (4 ticks)
  const yTicks = [0, 0.33, 0.66, 1].map(ratio => {
    const val = minProfit + ratio * profitRange;
    const y = padding.top + innerHeight - ratio * innerHeight;
    return { val: Math.round(val), y };
  });

  const bestMonth = [...monthlyData].sort((a, b) => b.profit - a.profit)[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content analytics-modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Monthly Profit Analytics</h2>
            <p className="analytics-subtitle">Time-series breakdown for 2026</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">×</button>
        </div>

        <div className="modal-body analytics-modal-body">
          {/* Key Metric Highlights */}
          <div className="analytics-metrics-grid">
            <div className="analytics-metric-card">
              <span className="metric-label">Annual Profit</span>
              <span className="metric-value">₹{(totalAnnualProfit || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="analytics-metric-card">
              <span className="metric-label">Best Month</span>
              <span className="metric-value">
                {bestMonth && bestMonth.profit > 0 ? `${bestMonth.monthName} (₹${bestMonth.profit.toLocaleString('en-IN')})` : 'N/A'}
              </span>
            </div>
            <div className="analytics-metric-card">
              <span className="metric-label">Active Event Months</span>
              <span className="metric-value">
                {monthlyData.filter(m => m.profit > 0 || m.eventCount > 0).length} / 12
              </span>
            </div>
          </div>

          {/* Interactive SVG Chart */}
          <div className="chart-card">
            <h3 className="chart-title">Profit Trend (Jan - Dec 2026)</h3>
            <div className="chart-wrapper">
              <svg viewBox={`0 0 ${width} ${height}`} className="analytics-chart-svg">
                <defs>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                {yTicks.map((tick, i) => (
                  <g key={i}>
                    <line
                      x1={padding.left}
                      y1={tick.y}
                      x2={width - padding.right}
                      y2={tick.y}
                      stroke="#E5E7EB"
                      strokeDasharray={tick.val === 0 ? undefined : '4 4'}
                      strokeWidth={tick.val === 0 ? '1.5' : '1'}
                    />
                    <text
                      x={padding.left - 10}
                      y={tick.y + 4}
                      textAnchor="end"
                      fontSize="11"
                      fill="#6B7280"
                      fontFamily="Inter, sans-serif"
                    >
                      ₹{tick.val.toLocaleString('en-IN')}
                    </text>
                  </g>
                ))}

                {/* Shaded Area */}
                {areaD && (
                  <path d={areaD} fill="url(#profitGradient)" />
                )}

                {/* Trend Line */}
                {pathD && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#1E3A8A"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Data Points */}
                {points.map((p, idx) => {
                  const isHovered = hoveredPoint?.month === p.month;
                  return (
                    <g key={idx}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isHovered ? 6 : 4}
                        fill={isHovered ? '#1E40AF' : '#FFFFFF'}
                        stroke="#1E3A8A"
                        strokeWidth="2.5"
                        style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                        onMouseEnter={() => setHoveredPoint(p)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                      {/* X Axis Labels */}
                      <text
                        x={p.x}
                        y={height - 20}
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight={isHovered ? '600' : '500'}
                        fill={isHovered ? '#1E3A8A' : '#4B5563'}
                        fontFamily="Inter, sans-serif"
                      >
                        {p.monthName}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Tooltip */}
              {hoveredPoint && (
                <div
                  className="chart-tooltip"
                  style={{
                    left: `${(hoveredPoint.x / width) * 100}%`,
                    top: `${(hoveredPoint.y / height) * 100}%`
                  }}
                >
                  <div className="tooltip-month">{hoveredPoint.monthName} 2026</div>
                  <div className="tooltip-profit">₹{hoveredPoint.profit.toLocaleString('en-IN')}</div>
                  <div className="tooltip-events">{hoveredPoint.eventCount} event{hoveredPoint.eventCount === 1 ? '' : 's'}</div>
                </div>
              )}
            </div>
          </div>

          {/* Monthly Breakdown Table */}
          <div className="table-container analytics-table-container">
            <table className="events-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Events</th>
                  <th>Total Revenue</th>
                  <th>Total Profit</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((m) => (
                  <tr key={m.month}>
                    <td style={{ fontWeight: '600' }}>{m.monthName}</td>
                    <td>{m.eventCount}</td>
                    <td>₹{m.revenue.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: '600', color: m.profit > 0 ? '#059669' : '#4B5563' }}>
                      ₹{m.profit.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
