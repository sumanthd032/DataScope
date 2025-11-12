import axios from 'axios';
import { useCallback } from 'react'; // [+] Import useCallback

// Define the base URL of our FastAPI backend
const API_BASE_URL = 'http://127.0.0.1:8000';

// Create an axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const useApi = () => {
  // [+] Wrap every function in useCallback
  const uploadDbFile = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post('/api/upload-db', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.detail || "File upload failed");
      }
      throw new Error("File upload failed");
    }
  }, []); // [+] Add empty dependency array

  const getTableData = useCallback(async (
    sessionId: string,
    tableName: string,
    page: number = 1,
    pageSize: number = 20
  ) => {
    try {
      const response = await apiClient.get('/api/table-data', {
        params: {
          session_id: sessionId,
          table_name: tableName,
          page: page,
          page_size: pageSize,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.detail || "Failed to fetch table data");
      }
      throw new Error("Failed to fetch table data");
    }
  }, []); // [+] Add empty dependency array

  const runQuery = useCallback(async (sessionId: string, query: string) => {
    try {
      const response = await apiClient.post('/api/run-query', {
        session_id: sessionId,
        query: query,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.detail || "Failed to run query");
      }
      throw new Error("Failed to run query");
    }
  }, []); // [+] Add empty dependency array

  const generateSql = useCallback(async (prompt: string, schema_str: string) => {
    try {
      const response = await apiClient.post('/api/generate-sql', {
        prompt,
        schema_str,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.detail || "AI query failed");
      }
      throw new Error("AI query failed");
    }
  }, []); // [+] Add empty dependency array

  const getTableInsights = useCallback(async (sessionId: string, tableName: string) => {
    try {
      const response = await apiClient.get('/api/table-insights', {
        params: {
          session_id: sessionId,
          table_name: tableName,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.detail || "Failed to fetch insights");
      }
      throw new Error("Failed to fetch insights");
    }
  }, []);

  const getSchemaDiagram = useCallback(async (sessionId: string) => {
    try {
      const response = await apiClient.get('/api/schema-diagram', {
        params: {
          session_id: sessionId,
        },
      });
      return response.data; // { diagram_string: "..." }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.detail || "Failed to fetch diagram");
      }
      throw new Error("Failed to fetch diagram");
    }
  }, []);

  const explainQuery = useCallback(async (sessionId: string, query: string) => {
    try {
      const response = await apiClient.post('/api/explain-query', {
        session_id: sessionId,
        query: query,
      });
      return response.data; 
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.detail || "Failed to explain query");
      }
      throw new Error("Failed to explain query");
    }
  }, []);

  return { 
    uploadDbFile, 
    getTableData, 
    runQuery, 
    generateSql, 
    getTableInsights,
    getSchemaDiagram,
    explainQuery
  };
};