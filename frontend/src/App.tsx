import { FileUpload } from './components/FileUpload';
import { SchemaViewer } from './components/SchemaViewer';
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
          {/*
            [+] Conditionally render components:
            If we have no session, show the upload box.
            If we have a session, show the schema viewer.
          */}
          {!sessionId ? (
            <FileUpload />
          ) : (
            <div className="flex gap-6">
              <SchemaViewer />
              {/* This is where our Table Viewer and Query Runner will go */}
              <div className="flex-1 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold">Main Content Area</h2>
                <p>Query runner and table view will live here.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;