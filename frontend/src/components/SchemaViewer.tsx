import React from 'react';
import { useDbState } from '../context/DbStateContext';
import { useApi } from '../hooks/useApi'; 

export const SchemaViewer: React.FC = () => {
  // [+] Get full state and api access
  const { schema, sessionId, setLoading, setViewData, setError } = useDbState();
  const { getTableData } = useApi();

  if (!schema) {
    return <div className="text-gray-500">No schema loaded.</div>;
  }

  const tableNames = Object.keys(schema);
  
  // [+] --- Click handler ---
  const handleTableClick = async (tableName: string) => {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch the first page
      const data = await getTableData(sessionId, tableName, 1);
      setViewData(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    // [+] Set a max-height and make it scrollable
    <aside className="w-64 p-4 bg-white shadow-md rounded-lg overflow-y-auto max-h-[80vh]">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Schema</h2>
      {tableNames.length === 0 ? (
        <p className="text-gray-500">Database is empty.</p>
      ) : (
        <nav>
          <ul>
            {tableNames.map((tableName) => (
              <li key={tableName} className="mb-4">
                {/* [+] --- Make table name clickable --- */}
                <h3 
                  className="text-lg font-semibold text-blue-700 cursor-pointer hover:underline"
                  onClick={() => handleTableClick(tableName)}
                >
                  {tableName}
                </h3>
                <ul className="ml-2 mt-1 border-l border-gray-300 pl-2">
                  {/* ... (column display is the same) ... */}
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