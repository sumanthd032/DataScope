import React from 'react';
import { useDbState } from '../context/DbStateContext';
import { useApi } from '../hooks/useApi';
import { Download } from 'lucide-react';

export const SchemaViewer: React.FC = () => {
  const { 
    schema, 
    sessionId, 
    setLoading, 
    setViewData, 
    setError,
    setSelectedTable,
    setPlan,
    setActiveDataViewTab
  } = useDbState();
  
  const { getTableData } = useApi();

  if (!schema) {
    return <div className="text-gray-500">No schema loaded.</div>;
  }

  const tableNames = Object.keys(schema);
  
  const handleTableClick = async (tableName: string) => {
    // ... (This function is unchanged)
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    setPlan(null);
    try {
      const data = await getTableData(sessionId, tableName, 1);
      setViewData(data);
      setSelectedTable(tableName);
      setActiveDataViewTab('data');
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  const handleDownload = () => {
    if (!sessionId) return;
    const downloadUrl = `http://127.0.0.1:8000/api/download-db?session_id=${sessionId}`;
    window.open(downloadUrl, '_blank');
  };

  return (
    <aside className="w-64 p-4 bg-white shadow-md rounded-lg overflow-y-auto max-h-[80vh]">
      
      {/* [+] --- Updated Header with Download Button --- */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Schema</h2>
        <button
          onClick={handleDownload}
          className="p-1 text-gray-500 rounded-md hover:bg-gray-100 hover:text-blue-600 transition-colors"
          title="Download Modified Database"
        >
          <Download size={18} />
        </button>
      </div>
      
      {/* --- (Rest of the component is unchanged) --- */}
      {tableNames.length === 0 ? (
        <p className="text-gray-500">Database is empty.</p>
      ) : (
        <nav>
          <ul>
            {tableNames.map((tableName) => (
              <li key={tableName} className="mb-4">
                <h3 
                  className="text-lg font-semibold text-blue-700 cursor-pointer hover:underline"
                  onClick={() => handleTableClick(tableName)}
                >
                  {tableName}
                </h3>
                <ul className="ml-2 mt-1 border-l border-gray-300 pl-2">
                  {schema[tableName].map((col) => (
                    <li
                      key={col.name}
                      className="text-sm text-gray-600 flex items-center"
                    >
                      {col.pk && (
                        <span title="Primary Key" className="mr-1 text-yellow-500">🔑</span>
                      )}
                      {col.name}
                      <span className="ml-1 text-gray-400">({col.type})</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </aside>
  );
};