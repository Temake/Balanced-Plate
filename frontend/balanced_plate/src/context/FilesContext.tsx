import React, { createContext, useState } from 'react';
import api from '@/api/axios';
import type { ReactNode } from "react";
import type { FileType, FilesContextType } from '@/api/types';
import { useAuth } from '@/hooks/useAuth';

const FilesContext = createContext<FilesContextType | undefined>(undefined);



export const FilesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<FileType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchFiles = async (): Promise<void> => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get('/files/');
      setFiles(response.data.results || response.data || []);
    } catch (error: unknown) {
      let errorMessage = 'Failed to fetch files';
      if (typeof error === 'object' && error && 'response' in error) {
        const response = (error as { response?: { data?: { detail?: string; message?: string } } }).response;
        errorMessage = response?.data?.message || response?.data?.detail || errorMessage;
      }
      setError(errorMessage);
      console.error('Error fetching files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async (file: File, purpose: "avatar" | "food image"): Promise<FileType> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('purpose', purpose);

      const response = await api.post('/files/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newFile = response.data;
      setFiles(prevFiles => [newFile, ...prevFiles]);
      return newFile;
    } catch (error: unknown) {
      let errorMessage = 'Failed to upload file';
      if (typeof error === 'object' && error && 'response' in error) {
        const response = (error as { response?: { data?: { detail?: string; message?: string } } }).response;
        errorMessage = response?.data?.message || response?.data?.detail || errorMessage;
      }

      setError(errorMessage);
      console.error('Error uploading file:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getFile = async (id: string): Promise<FileType> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(`/api/files/${id}/`);
      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Failed to get file';
        if (typeof error === 'object' && error && 'response' in error) {
        const response = (error as { response?: { data?: { detail?: string; message?: string } } }).response;
        errorMessage = response?.data?.message || response?.data?.detail || errorMessage;
      }
      
      setError(errorMessage);
      console.error('Error getting file:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: FilesContextType = {
    files,
    isLoading,
    error,
    uploadFile,
    fetchFiles,
    getFile,
    clearError,
  };

  return (
    <FilesContext.Provider value={value}>
      {children}
    </FilesContext.Provider>
  );
};

export default FilesContext;
