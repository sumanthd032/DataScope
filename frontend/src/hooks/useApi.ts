import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const useApi = () => {
  const uploadDbFile = async (file: File) => {
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
      console.error("Error uploading file:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.detail || "File upload failed");
      }
      throw new Error("File upload failed");
    }
  };

  const getTableData = async (
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
  };

  const runQuery = async (sessionId: string, query: string) => {
    try {
      // Use POST and send a JSON body
      const response = await apiClient.post('/api/run-query', {
        session_id: sessionId,
        query: query,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // This will now correctly show "Query Error: ..."
        throw new Error(error.response.data.detail || "Failed to run query");
      }
      throw new Error("Failed to run query");
    }
  };

  const generateSql = async (prompt: string, schema_str: string) => {
    try {
      const response = await apiClient.post('/api/generate-sql', {
        prompt,
        schema_str,
      });
      return response.data; // { sql_query: "..." }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.detail || "AI query failed");
      }
      throw new Error("AI query failed");
    }
  };

  const getTableInsights = async (sessionId: string, tableName: string) => {
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
  };

  return { 
    uploadDbFile, 
    getTableData, 
    runQuery, 
    generateSql, 
    getTableInsights 
  };
};