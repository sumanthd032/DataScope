import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useApi } from '../hooks/useApi';
import { useDbState } from '../context/DbStateContext';
import { AIAssist } from './AIAssist';

export const QueryRunner: React.FC = () => {
  const [editorInstance, setEditorInstance] = useState<any | null>(null);
  const [query, setQuery] = useState<string>("SELECT * FROM \n-- press Ctrl+Enter (or Cmd+Enter) to run --\n");
  
  const { runQuery, explainQuery } = useApi();
  
  const { 
    sessionId, 
    setLoading, 
    setError, 
    setViewData, 
    setSelectedTable,
    setPlan,
    setActiveDataViewTab
  } = useDbState();

  const handleRunQuery = async () => {
    if (!sessionId || !query) return;

    setLoading(true);
    setError(null);
    setPlan(null); // Clear any old plan
    try {
      const result = await runQuery(sessionId, query);
      setViewData(result);
      setSelectedTable(null);
      setActiveDataViewTab('data'); // Switch to data tab
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExplainQuery = async () => {
    if (!sessionId || !query) return;
    
    setLoading(true);
    setError(null);
    // Clear old data (cast to any to satisfy the setter's type)
    setViewData(undefined as any);
    try {
      const result = await explainQuery(sessionId, query);
      setPlan(result.plan);
      setActiveDataViewTab('explain'); // Switch to explain tab!
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
      <AIAssist onSqlGenerated={handleSqlGenerated} />
    
      <div className="flex flex-col h-[30vh]">
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
        
        <div className="flex rounded-b-lg">
          <button
            onClick={handleRunQuery}
            className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-bl-lg hover:bg-blue-700 transition-colors"
          >
            Run Query (Ctrl+Enter)
          </button>
          <button
            onClick={handleExplainQuery}
            className="flex-1 px-4 py-2 bg-purple-600 text-white font-semibold rounded-br-lg hover:bg-purple-700 transition-colors"
          >
            Explain Query
          </button>
        </div>
      </div>
    </div>
  );
};