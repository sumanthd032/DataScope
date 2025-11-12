import { FileUpload } from './components/FileUpload';
import { SchemaViewer } from './components/SchemaViewer';
import { TableViewer } from './components/TableViewer';
import { QueryRunner } from './components/QueryRunner';
import { useDbState } from './context/DbStateContext';

function App() {
  const { sessionId } = useDbState();

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-8">
      <div className="container mx-auto">
        <header className="text-center mb-12">
          {/* ... (header is the same) ... */}
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
              {/* --- Left Column --- */}
              <div className="w-full lg:w-64 flex-shrink-0">
                <SchemaViewer />
              </div>
              
              {/* --- Right Column (Main Content) --- */}
              <div className="flex-1 flex flex-col gap-6">
                
                {/* [+] --- Query Runner --- */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <QueryRunner />
                </div>
                
                {/* --- Table/Results Viewer --- */}
                <div className="flex-1 bg-white p-6 rounded-lg shadow-md min-h-[40vh] flex flex-col">
                  {/*
                    No changes needed here! TableViewer will show
                    EITHER the clicked-table data OR the query result,
                    based on what's in the global state.
                  */}
                  <TableViewer />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;