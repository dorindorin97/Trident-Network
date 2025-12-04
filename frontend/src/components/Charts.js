import React from 'react';
import PropTypes from 'prop-types';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './Charts.css';

/**
 * Block history chart showing blocks over time
 */
export function BlockHistoryChart({ data }) {
  return (
    <div className="chart-container">
      <h3>Block History</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="blockNumber" 
            stroke="var(--text-color)"
            tick={{ fill: 'var(--text-color)' }}
          />
          <YAxis 
            stroke="var(--text-color)"
            tick={{ fill: 'var(--text-color)' }}
            label={{ value: 'Transactions', angle: -90, position: 'insideLeft', fill: 'var(--text-color)' }}
          />
          <Tooltip 
            contentStyle={{ 
              background: 'var(--card-bg)', 
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'var(--text-color)'
            }}
          />
          <Legend wrapperStyle={{ color: 'var(--text-color)' }} />
          <Line 
            type="monotone" 
            dataKey="transactionCount" 
            stroke="#8884d8" 
            strokeWidth={2}
            name="Transactions"
            dot={{ fill: '#8884d8' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

BlockHistoryChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    blockNumber: PropTypes.number.isRequired,
    transactionCount: PropTypes.number.isRequired
  })).isRequired
};

/**
 * Transaction volume chart
 */
export function TransactionVolumeChart({ data }) {
  return (
    <div className="chart-container">
      <h3>Transaction Volume</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="date" 
            stroke="var(--text-color)"
            tick={{ fill: 'var(--text-color)' }}
          />
          <YAxis 
            stroke="var(--text-color)"
            tick={{ fill: 'var(--text-color)' }}
            label={{ value: 'Volume (TRI)', angle: -90, position: 'insideLeft', fill: 'var(--text-color)' }}
          />
          <Tooltip 
            contentStyle={{ 
              background: 'var(--card-bg)', 
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'var(--text-color)'
            }}
          />
          <Legend wrapperStyle={{ color: 'var(--text-color)' }} />
          <Bar dataKey="volume" fill="#82ca9d" name="Volume (TRI)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

TransactionVolumeChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string.isRequired,
    volume: PropTypes.number.isRequired
  })).isRequired
};

/**
 * Validator distribution pie chart
 */
export function ValidatorDistributionChart({ data }) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="chart-container">
      <h3>Validator Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              background: 'var(--card-bg)', 
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'var(--text-color)'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

ValidatorDistributionChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired
  })).isRequired
};

/**
 * Network metrics overview chart
 */
export function NetworkMetricsChart({ data }) {
  return (
    <div className="chart-container">
      <h3>Network Metrics</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="timestamp" 
            stroke="var(--text-color)"
            tick={{ fill: 'var(--text-color)' }}
          />
          <YAxis 
            stroke="var(--text-color)"
            tick={{ fill: 'var(--text-color)' }}
          />
          <Tooltip 
            contentStyle={{ 
              background: 'var(--card-bg)', 
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'var(--text-color)'
            }}
          />
          <Legend wrapperStyle={{ color: 'var(--text-color)' }} />
          <Line 
            type="monotone" 
            dataKey="activeValidators" 
            stroke="#8884d8" 
            name="Active Validators"
          />
          <Line 
            type="monotone" 
            dataKey="blockTime" 
            stroke="#82ca9d" 
            name="Block Time (s)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

NetworkMetricsChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    timestamp: PropTypes.string.isRequired,
    activeValidators: PropTypes.number.isRequired,
    blockTime: PropTypes.number.isRequired
  })).isRequired
};
