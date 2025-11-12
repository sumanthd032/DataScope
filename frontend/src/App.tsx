import { FileUpload } from './components/FileUpload';
import { SchemaViewer } from './components/SchemaViewer';
import { QueryRunner } from './components/QueryRunner';
import { DataView } from './components/DataView';
import { useDbState } from './context/DbStateContext';

function App() {
  const { sessionId } = useDbState();

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
                
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <QueryRunner />
                </div>
                
                {/* [+] --- Replace TableViewer with DataView --- */}
                <DataView />
                
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;