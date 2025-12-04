import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './TransactionGraph.css';

const TransactionGraph = () => {
  const { t } = useTranslation();
  const [chartType, setChartType] = useState('area'); // area, line, bar
  const [timeRange, setTimeRange] = useState('24h'); // 1h, 6h, 24h, 7d
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    avgPerBlock: 0,
    peak: 0,
    trend: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactionData();
    const interval = setInterval(fetchTransactionData, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchTransactionData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/transactions/graph?range=${timeRange}`);
      
      if (!response.ok) {
        // Generate mock data for demo
        const mockData = generateMockData(timeRange);
        setData(mockData);
        calculateStats(mockData);
      } else {
        const result = await response.json();
        setData(result.data || []);
        calculateStats(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch transaction data:', error);
      // Use mock data on error
      const mockData = generateMockData(timeRange);
      setData(mockData);
      calculateStats(mockData);
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (range) => {
    const points = range === '1h' ? 12 : range === '6h' ? 24 : range === '24h' ? 48 : 168;
    const now = Date.now();
    const interval = range === '1h' ? 5 * 60 * 1000 : range === '6h' ? 15 * 60 * 1000 : 
                     range === '24h' ? 30 * 60 * 1000 : 60 * 60 * 1000;

    return Array.from({ length: points }, (_, i) => {
      const time = now - (points - i - 1) * interval;
      const baseValue = 50 + Math.sin(i / 10) * 20;
      const variance = Math.random() * 30;
      
      return {
        timestamp: time,
        time: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date(time).toLocaleDateString(),
        transactions: Math.max(0, Math.floor(baseValue + variance)),
        volume: Math.floor((baseValue + variance) * 1000 * (0.8 + Math.random() * 0.4)),
        uniqueAddresses: Math.floor((baseValue + variance) * 0.6)
      };
    });
  };

  const calculateStats = (data) => {
    if (!data || data.length === 0) {
      setStats({ total: 0, avgPerBlock: 0, peak: 0, trend: 0 });
      return;
    }

    const total = data.reduce((sum, item) => sum + item.transactions, 0);
    const avg = Math.floor(total / data.length);
    const peak = Math.max(...data.map(item => item.transactions));
    
    // Calculate trend (last 10 vs previous 10)
    const half = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, half).reduce((sum, item) => sum + item.transactions, 0) / half;
    const secondHalf = data.slice(half).reduce((sum, item) => sum + item.transactions, 0) / (data.length - half);
    const trend = ((secondHalf - firstHalf) / firstHalf * 100).toFixed(1);

    setStats({ total, avgPerBlock: avg, peak, trend: parseFloat(trend) });
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 }
    };

    const xAxisProps = {
      dataKey: 'time',
      tick: { fill: 'var(--text-secondary)', fontSize: 12 },
      stroke: 'var(--border-color)'
    };

    const yAxisProps = {
      tick: { fill: 'var(--text-secondary)', fontSize: 12 },
      stroke: 'var(--border-color)'
    };

    const tooltipProps = {
      contentStyle: {
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        color: 'var(--text-primary)'
      },
      labelStyle: { color: 'var(--text-primary)' }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip {...tooltipProps} />
            <Legend wrapperStyle={{ color: 'var(--text-primary)' }} />
            <Line type="monotone" dataKey="transactions" stroke="#4a9eff" strokeWidth={2} dot={{ fill: '#4a9eff', r: 4 }} name="Transactions" />
            <Line type="monotone" dataKey="uniqueAddresses" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} name="Unique Addresses" />
          </LineChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip {...tooltipProps} />
            <Legend wrapperStyle={{ color: 'var(--text-primary)' }} />
            <Bar dataKey="transactions" fill="#4a9eff" name="Transactions" />
            <Bar dataKey="uniqueAddresses" fill="#22c55e" name="Unique Addresses" />
          </BarChart>
        );
      
      default: // area
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4a9eff" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#4a9eff" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorAddresses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip {...tooltipProps} />
            <Legend wrapperStyle={{ color: 'var(--text-primary)' }} />
            <Area type="monotone" dataKey="transactions" stroke="#4a9eff" strokeWidth={2} fillOpacity={1} fill="url(#colorTransactions)" name="Transactions" />
            <Area type="monotone" dataKey="uniqueAddresses" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorAddresses)" name="Unique Addresses" />
          </AreaChart>
        );
    }
  };

  return (
    <div className="transaction-graph">
      <div className="graph-header">
        <div className="graph-title">
          <h2>{t('transactionGraph.title', 'Transaction Activity')}</h2>
          <p className="graph-subtitle">{t('transactionGraph.subtitle', 'Real-time network activity visualization')}</p>
        </div>
        
        <div className="graph-controls">
          <div className="control-group">
            <label>{t('transactionGraph.chartType', 'Chart Type')}</label>
            <select value={chartType} onChange={(e) => setChartType(e.target.value)} className="control-select">
              <option value="area">{t('transactionGraph.area', 'Area')}</option>
              <option value="line">{t('transactionGraph.line', 'Line')}</option>
              <option value="bar">{t('transactionGraph.bar', 'Bar')}</option>
            </select>
          </div>

          <div className="control-group">
            <label>{t('transactionGraph.timeRange', 'Time Range')}</label>
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="control-select">
              <option value="1h">{t('transactionGraph.1h', 'Last Hour')}</option>
              <option value="6h">{t('transactionGraph.6h', 'Last 6 Hours')}</option>
              <option value="24h">{t('transactionGraph.24h', 'Last 24 Hours')}</option>
              <option value="7d">{t('transactionGraph.7d', 'Last 7 Days')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="graph-stats">
        <div className="stat-card">
          <span className="stat-label">{t('transactionGraph.total', 'Total Transactions')}</span>
          <span className="stat-value">{stats.total.toLocaleString()}</span>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">{t('transactionGraph.average', 'Average/Block')}</span>
          <span className="stat-value">{stats.avgPerBlock.toLocaleString()}</span>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">{t('transactionGraph.peak', 'Peak Activity')}</span>
          <span className="stat-value">{stats.peak.toLocaleString()}</span>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">{t('transactionGraph.trend', 'Trend')}</span>
          <span className={`stat-value ${stats.trend >= 0 ? 'trend-up' : 'trend-down'}`}>
            {stats.trend >= 0 ? '↑' : '↓'} {Math.abs(stats.trend)}%
          </span>
        </div>
      </div>

      <div className="graph-container">
        {loading ? (
          <div className="graph-loading">
            <div className="spinner"></div>
            <p>{t('transactionGraph.loading', 'Loading transaction data...')}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            {renderChart()}
          </ResponsiveContainer>
        )}
      </div>

      <div className="graph-footer">
        <p className="graph-info">
          {t('transactionGraph.info', 'Data updates every 30 seconds. Hover over the chart for detailed information.')}
        </p>
      </div>
    </div>
  );
};

export default TransactionGraph;
