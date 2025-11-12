import React from 'react';
import { useDbState } from '../context/DbStateContext';

export const QueryPlanView: React.FC = () => {
  const { currentPlan, error, isLoading } = useDbState();

  if (isLoading) {
    return <div className="text-center p-10">Loading...</div>;
  }
  
  // Show the main error if one was set by the explain call
  if (error) {
    return <div className="text-center p-10 text-red-600">Error: {error}</div>;
  }

  if (!currentPlan) {
    return (
      <div className="text-center p-10 text-gray-500">
        Click the "Explain" button in the query runner to see a query plan.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto border border-gray-300 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Parent
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Detail
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentPlan.map((step) => (
            <tr key={step.id} className="hover:bg-gray-50">
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                {step.id}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                {step.parent}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                {step.detail}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};