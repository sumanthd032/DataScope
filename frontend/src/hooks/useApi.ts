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

  return { uploadDbFile };
};