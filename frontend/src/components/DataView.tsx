import React, { useState } from 'react';
import { useDbState } from '../context/DbStateContext';
import { TableViewer } from './TableViewer';
import { InsightsDashboard } from './InsightsDashboard';

export const DataView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'data' | 'insights'>('data');
  const { currentSelectedTable, currentView } = useDbState();

  // Disable insights if it's a query result
  const isInsightsDisabled = currentSelectedTable === null;
  const tableName = currentSelectedTable ?? currentView?.table_name ?? 'Data';

  // If tab is insights but it becomes disabled, switch back to data
  if (isInsightsDisabled && activeTab === 'insights') {
    setActiveTab('data');
  }

  return (
    <div className="flex-1 bg-white p-6 rounded-lg shadow-md min-h-[40vh] flex flex-col">
      {/* --- Tab Navigation --- */}
      <div className="flex border-b border-gray-200 mb-4">
        <TabButton
          title="Data"
          isActive={activeTab === 'data'}
          onClick={() => setActiveTab('data')}
        />
        <TabButton
          title="Insights"
          isActive={activeTab === 'insights'}
          onClick={() => setActiveTab('insights')}
          disabled={isInsightsDisabled}
        />
        <span className="flex-1 text-right text-gray-500 p-2 text-sm italic">
          Viewing: {tableName}
        </span>
      </div>

      {/* --- Tab Content --- */}
      <div className="flex-1">
        {activeTab === 'data' && <TableViewer />}
        {activeTab === 'insights' && <InsightsDashboard />}
      </div>
    </div>
  );
};

const TabButton: React.FC<{
  title: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}> = ({ title, isActive, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2 -mb-px font-semibold text-sm
        ${isActive
          ? 'border-b-2 border-blue-600 text-blue-600'
          : 'text-gray-500 hover:text-gray-700'
        }
        ${disabled
          ? 'opacity-50 cursor-not-allowed'
          : ''
        }
      `}
    >
      {title}
    </button>
  );
};