import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useApi } from '../hooks/useApi';

export const FileUpload: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { uploadDbFile } = useApi();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.name.endsWith('.sqlite') && !file.name.endsWith('.db')) {
        setError('Invalid file type. Please upload a .sqlite or .db file.');
        setMessage('');
        return;
    }
    
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await uploadDbFile(file);
      setMessage(result.message || 'File uploaded successfully!');
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [uploadDbFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
  onDrop,
  accept: {
    'application/vnd.sqlite3': ['.sqlite', '.db'],
    'application/x-sqlite3': ['.sqlite', '.db'],
    'application/octet-stream': ['.sqlite', '.db'], // A fallback
  },
  maxFiles: 1,
});

  return (
    <div className="w-full max-w-lg p-8 mx-auto border-2 border-dashed rounded-lg border-gray-400 text-center cursor-pointer hover:border-blue-500 transition-colors">
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-blue-600">Drop the .sqlite file here ...</p>
        ) : (
          <p className="text-gray-600">
            Drag 'n' drop a .sqlite file here, or click to select
          </p>
        )}
      </div>
      
      {isLoading && <p className="mt-4 text-blue-500">Uploading...</p>}
      
      {message && (
        <p className="mt-4 text-green-600 font-semibold">{message}</p>
      )}
      
      {error && (
        <p className="mt-4 text-red-600 font-semibold">{error}</p>
      )}
    </div>
  );
};