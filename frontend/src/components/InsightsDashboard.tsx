import React, { useState, useEffect } from 'react';
import { useDbState } from '../context/DbStateContext';
import { useApi } from '../hooks/useApi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface NumericStats {
  mean: number | null;
  median: number | null;
  std_dev: number | null;
  min: number | null;
  max: number | null;
}
interface CategoricalStats {
  top_values: Record<string, number>;
}
interface ColumnStat {
  name: string;
  type: string;
  missing_count: number;
  missing_percent: number;
  unique_count: number;
  unique_percent: number;
  numeric_stats?: NumericStats;
  categorical_stats?: CategoricalStats;
}
interface InsightsData {
  table_name: string;
  total_rows: number;
  total_cols: number;
  column_stats: ColumnStat[];
}

export const InsightsDashboard: React.FC = () => {
  const { currentSelectedTable, sessionId } = useDbState();
  const { getTableInsights } = useApi();
  
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      if (currentSelectedTable && sessionId) {
        setIsLoading(true);
        setError(null);
        setInsights(null);
        try {
          const data = await getTableInsights(sessionId, currentSelectedTable);
          setInsights(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchInsights();
  }, [currentSelectedTable, sessionId, getTableInsights]);

  if (isLoading) {
    return <div className="text-center p-10">Generating insights...</div>;
  }
  if (error) {
    return <div className="text-center p-10 text-red-600">Error: {error}</div>;
  }
  if (!insights) {
    return <div className="text-center p-10 text-gray-500">No insights to display.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* --- Header Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Table Name" value={insights.table_name} />
        <StatCard title="Total Rows" value={insights.total_rows.toLocaleString()} />
        <StatCard title="Total Columns" value={insights.total_cols.toLocaleString()} />
      </div>
      
      {/* --- Column Cards --- */}
      <h3 className="text-xl font-semibold text-gray-800">Column Analysis</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {insights.column_stats.map((col) => (
          <ColumnCard key={col.name} col={col} />
        ))}
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string }> = ({ title, value }) => (
  <div className="bg-gray-50 p-4 rounded-lg shadow">
    <h4 className="text-sm font-medium text-gray-500 uppercase">{title}</h4>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

const ColumnCard: React.FC<{ col: ColumnStat }> = ({ col }) => {
  const chartData = col.categorical_stats?.top_values
    ? Object.entries(col.categorical_stats.top_values).map(([name, count]) => ({ name, count }))
    : [];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <h4 className="text-lg font-bold text-blue-700">{col.name}</h4>
      <p className="text-sm text-gray-500 mb-2">{col.type}</p>
      
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <StatItem label="Missing" value={`${col.missing_percent}% (${col.missing_count})`} />
        <StatItem label="Unique" value={`${col.unique_percent}% (${col.unique_count})`} />
      </div>

      {col.numeric_stats && (
        <div className="text-sm mb-3">
          <h5 className="font-semibold mb-1">Numeric Stats</h5>
          <div className="grid grid-cols-2 gap-x-2">
            <StatItem label="Mean" value={col.numeric_stats.mean?.toFixed(2)} />
            <StatItem label="Median" value={col.numeric_stats.median?.toFixed(2)} />
            <StatItem label="Min" value={col.numeric_stats.min} />
            <StatItem label="Max" value={col.numeric_stats.max} />
          </div>
        </div>
      )}
      
      {chartData.length > 0 && (
        <div>
          <h5 className="font-semibold text-sm mb-2">Top Values</h5>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 30, right: 10 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" fontSize="10px" interval={0} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" background={{ fill: '#eee' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

const StatItem: React.FC<{ label: string; value: string | number | null | undefined }> = ({ label, value }) => (
  <div>
    <span className="font-medium text-gray-600">{label}: </span>
    <span className="text-gray-800">{value ?? 'N/A'}</span>
  </div>
);