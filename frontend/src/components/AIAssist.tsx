import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useDbState, type Schema } from '../context/DbStateContext';

// Helper to format schema for the prompt
const formatSchemaToString = (schema: Schema): string => {
  let schemaStr = "";
  for (const tableName in schema) {
    schemaStr += `CREATE TABLE ${tableName} (\n`;
    const columns = schema[tableName];
    schemaStr += columns
      .map(col => `  ${col.name} ${col.type}${col.pk ? " PRIMARY KEY" : ""}${col.notnull ? " NOT NULL" : ""}`)
      .join(",\n");
    schemaStr += "\n);\n\n";
  }
  return schemaStr.trim();
};

// Component Props
interface AIAssistProps {
  onSqlGenerated: (sql: string) => void;
}

export const AIAssist: React.FC<AIAssistProps> = ({ onSqlGenerated }) => {
  const [prompt, setPrompt] = useState<string>('');
  
  // --- [+] FIX IS HERE ---
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // ---------------------

  const [error, setError] = useState<string | null>(null);

  const { schema } = useDbState();
  const { generateSql } = useApi();

  const handleGenerate = async () => {
    if (!prompt || !schema) return;

    setIsLoading(true); // This will work now
    setError(null);
    
    try {
      // Format the schema into a string
      const schema_str = formatSchemaToString(schema);
      
      // Call the API
      const result = await generateSql(prompt, schema_str);
      
      // Pass the SQL up to the QueryRunner
      onSqlGenerated(result.sql_query);
      setPrompt(''); // Clear the input
      
    } catch (err: any)      {
      setError(err.message);
    } finally {
      setIsLoading(false); // This is also valid
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'Show top 5 customers by order total'"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? '...' : '✨ Generate'}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};