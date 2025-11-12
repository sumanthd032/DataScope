import { FileUpload } from './components/FileUpload';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex items-center justify-center p-8">
      <div className="container mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-blue-700">Datascope</h1>
          <p className="text-xl text-gray-600 mt-2">
            Your Smart SQLite Visualizer
          </p>
        </header>
        
        <main>
          {/* This component will be replaced by a context/state manager later */}
          <FileUpload />
        </main>
      </div>
    </div>
  );
}

export default App;