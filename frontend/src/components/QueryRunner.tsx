import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useApi } from '../hooks/useApi';
import { useDbState } from '../context/DbStateContext';
import { AIAssist } from './AIAssist'; 

export const QueryRunner: React.FC = () => {
  const [editorInstance, setEditorInstance] = useState<any | null>(null);
  
  const [query, setQuery] = useState<string>("SELECT * FROM \n-- press Ctrl+Enter (or Cmd+Enter) to run --\n");
  const { runQuery } = useApi();
  const { sessionId, setLoading, setError, setViewData, setSelectedTable } = useDbState();

  const handleRunQuery = async () => {
    if (!sessionId || !query) return;
    setLoading(true);
    setError(null);
    try {
      const result = await runQuery(sessionId, query);
      setViewData(result);
      setSelectedTable(null); 
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  const handleEditorDidMount = (editor: any, monaco: any) => {
    setEditorInstance(editor); 
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      handleRunQuery
    );
  };

  const handleSqlGenerated = (sql: string) => {
    setQuery(sql); 
    if (editorInstance) {
      editorInstance.setValue(sql); 
      editorInstance.focus();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* [+] --- AI Assist Bar --- */}
      <AIAssist onSqlGenerated={handleSqlGenerated} />
    
      {/* --- Editor --- */}
      <div className="flex flex-col h-[30vh]"> {/* Set a height here */}
        <div className="flex-shrink-0 border rounded-t-lg overflow-hidden border-gray-300 flex-1">
          <Editor
            height="100%"
            language="sql"
            theme="vs-light"
            value={query}
            onChange={(value) => setQuery(value || "")}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              scrollBeyondLastLine: false,
            }}
          />
        </div>
        <button
          onClick={handleRunQuery}
          className="w-full flex-shrink-0 px-4 py-2 bg-blue-600 text-white font-semibold rounded-b-lg hover:bg-blue-700 transition-colors"
        >
          Run Query (Ctrl+Enter)
        </button>
      </div>
    </div>
  );
};