import React from 'react';
import { useDbState, type PaginationInfo } from '../context/DbStateContext';
import { useApi } from '../hooks/useApi';

// [+] --- New Component: PaginationControls ---
const PaginationControls: React.FC<{
  pagination: PaginationInfo,
  onPageChange: (newPage: number) => void
}> = ({ pagination, onPageChange }) => {
  const { page, total_pages, total_rows } = pagination;

  return (
    <div className="flex justify-between items-center mt-4 text-sm">
      <span className="text-gray-600">
        Page {page} of {total_pages} ({total_rows} total rows)
      </span>
      <div className="space-x-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= total_pages}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};


// [+] --- Main Component: TableViewer ---
export const TableViewer: React.FC = () => {
  const { 
    currentView, 
    isLoading, 
    error, 
    sessionId, 
    setViewData, 
    setLoading, 
    setError 
  } = useDbState();
  
  const { getTableData } = useApi();

  const handlePageChange = async (newPage: number) => {
    if (!sessionId || !currentView?.table_name || newPage < 1 || newPage > currentView.pagination.total_pages) {
      return;
    }
    
    setLoading(true);
    try {
      const data = await getTableData(sessionId, currentView.table_name, newPage);
      setViewData(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return <div className="text-center p-10">Loading table data...</div>;
  }
  
  if (error) {
    return <div className="text-center p-10 text-red-600">Error: {error}</div>;
  }

  if (!currentView) {
    return (
      <div className="text-center p-10 text-gray-500">
        Select a table from the schema viewer to see its data.
      </div>
    );
  }

  const { table_name, columns, data, pagination } = currentView;

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Table: <span className="text-blue-700">{table_name}</span>
      </h2>
      
      {/* --- Table Data --- */}
      <div className="flex-1 overflow-auto border border-gray-300 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {columns.map((colName) => (
                <th
                  key={colName}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {colName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center p-5 text-gray-500">
                  This table is empty.
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {columns.map((colName) => (
                    <td 
                      key={colName} 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 max-w-xs truncate"
                      title={row[colName]}
                    >
                      {/* Display nulls explicitly */}
                      {row[colName] === null ? <span className="text-gray-400">NULL</span> : String(row[colName])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* --- Pagination --- */}
      {pagination.total_rows > 0 && (
        <PaginationControls 
          pagination={pagination} 
          onPageChange={handlePageChange} 
        />
      )}
    </div>
  );
};