import React, { useState } from 'react'; // [+] Import useState
import { FileUpload } from './components/FileUpload';
import { SchemaViewer } from './components/SchemaViewer';
import { QueryRunner } from './components/QueryRunner';
import { DataView } from './components/DataView';
import { useDbState } from './context/DbStateContext';
import { SchemaDiagram } from './components/SchemaDiagram';

// [+] --- Helper Tab Component ---
const MainTabButton: React.FC<{
  title: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ title, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 font-medium
      ${isActive
        ? 'bg-blue-600 text-white rounded-t-lg'
        : 'text-gray-500 hover:text-gray-800'
      }
    `}
  >
    {title}
  </button>
);

function App() {
  const { sessionId } = useDbState();
  const [mainView, setMainView] = useState<'query' | 'diagram'>('query'); // [+]

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-8">
      <div className="container mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-blue-700">Datascope</h1>
          <p className="text-xl text-gray-600 mt-2">
            Your Smart SQLite Visualizer
          </p>
        </header>
        
        <main>
          {!sessionId ? (
            <FileUpload />
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">
              
              <div className="w-full lg:w-64 flex-shrink-0">
                <SchemaViewer />
              </div>
              
              <div className="flex-1 flex flex-col gap-6">
                
                {/* [+] --- Main Tab Navigation --- */}
                <div className="flex gap-2 border-b border-gray-300">
                  <MainTabButton 
                    title="Query" 
                    isActive={mainView === 'query'} 
                    onClick={() => setMainView('query')}
                  />
                  <MainTabButton 
                    title="Schema Diagram" 
                    isActive={mainView === 'diagram'} 
                    onClick={() => setMainView('diagram')}
                  />
                </div>
                
                {/* [+] --- Conditional Main View --- */}
                {mainView === 'query' && (
                  <>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                      <QueryRunner />
                    </div>
                    <DataView />
                  </>
                )}
                
                {mainView === 'diagram' && (
                  <SchemaDiagram />
                )}
                
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;