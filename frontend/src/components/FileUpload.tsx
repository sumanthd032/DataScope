import React, { useCallback } from 'react'; 
import { useDropzone } from 'react-dropzone';
import { useApi } from '../hooks/useApi';
import { useDbState } from '../context/DbStateContext'; 

export const FileUpload: React.FC = () => {
  const { setSession, setLoading, setError, isLoading, error } = useDbState();
  const { uploadDbFile } = useApi();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.name.endsWith('.sqlite') && !file.name.endsWith('.db')) {
      setError('Invalid file type. Please upload a .sqlite or .db file.');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const result = await uploadDbFile(file);
      
      setSession(result.session_id, result.schema);
      
      
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }, [uploadDbFile, setSession, setLoading, setError]); 

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.sqlite3': ['.sqlite', '.db'],
      'application/x-sqlite3': ['.sqlite', '.db'],
      'application/octet-stream': ['.sqlite', '.db'],
    },
    maxFiles: 1,
  });

  return (
    <div className="w-full max-w-lg p-8 mx-auto border-2 border-dashed rounded-lg border-gray-400 text-center cursor-pointer hover:border-blue-500 transition-colors">
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {/* ... (UI is the same) ... */}
        {isDragActive ? (
          <p className="text-blue-600">Drop the file here ...</p>
        ) : (
          <p className="text-gray-600">
            Drag 'n' drop a .sqlite or .db file, or click to select
          </p>
        )}
      </div>
      
      {isLoading && <p className="mt-4 text-blue-500">Processing...</p>}
      
      {/* [+] Use global error state */}
      {error && (
        <p className="mt-4 text-red-600 font-semibold">{error}</p>
      )}
    </div>
  );
};