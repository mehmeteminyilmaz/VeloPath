import React from 'react';

const ProgressChart = ({ progress = 0 }) => {
  // SVG'de dairesel ilerleme göstermek için 100 üzerinden değer kullanıyoruz
  const strokeDasharray = `${progress}, 100`;

  return (
    <div className="progress-chart-container">
      <svg viewBox="0 0 36 36" className="circular-chart">
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <path className="circle-bg"
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path className="circle"
          strokeDasharray={strokeDasharray}
          stroke="url(#chartGradient)"
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <text x="18" y="20" className="chart-text">%{progress}</text>
        <text x="18" y="26" className="chart-label">VERİMLİLİK</text>
      </svg>
    </div>
  );
};

export default ProgressChart;
