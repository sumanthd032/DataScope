import React from 'react';
import { useDbState } from '../context/DbStateContext';
import { TableViewer } from './TableViewer';
import { InsightsDashboard } from './InsightsDashboard';
import { QueryPlanView } from './QueryPlanView';

export const DataView: React.FC = () => {
  const { 
    activeDataViewTab, 
    setActiveDataViewTab, 
    currentSelectedTable, 
    currentView 
  } = useDbState();

  const isInsightsDisabled = currentSelectedTable === null;
  // Use 'Query Result' if a query was run, otherwise the table name
  const viewName = currentSelectedTable ?? currentView?.table_name ?? 'Data';

  // If tab is insights but it becomes disabled, switch back to data
  if (isInsightsDisabled && activeDataViewTab === 'insights') {
    setActiveDataViewTab('data');
  }

  return (
    <div className="flex-1 bg-white p-6 rounded-lg shadow-md min-h-[40vh] flex flex-col">
      {/* --- Tab Navigation --- */}
      <div className="flex border-b border-gray-200 mb-4">
        <TabButton
          title="Data"
          isActive={activeDataViewTab === 'data'}
          onClick={() => setActiveDataViewTab('data')}
        />
        <TabButton
          title="Insights"
          isActive={activeDataViewTab === 'insights'}
          onClick={() => setActiveDataViewTab('insights')}
          disabled={isInsightsDisabled}
        />
        <TabButton
          title="Explain Plan"
          isActive={activeDataViewTab === 'explain'}
          onClick={() => setActiveDataViewTab('explain')}
        />
        <span className="flex-1 text-right text-gray-500 p-2 text-sm italic">
          Viewing: {viewName}
        </span>
      </div>

      {/* --- Tab Content --- */}
      <div className="flex-1">
        {activeDataViewTab === 'data' && <TableViewer />}
        {activeDataViewTab === 'insights' && <InsightsDashboard />}
        {activeDataViewTab === 'explain' && <QueryPlanView />}
      </div>
    </div>
  );
};

// --- Helper Tab Component ---
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