import React, { createContext, useState, useContext, type ReactNode } from 'react';

export interface Column {
  name: string;
  type: string;
  notnull: boolean;
  pk: boolean;
}

export interface Schema {
  [tableName: string]: Column[];
}

export interface PaginationInfo {
  page: number;
  page_size: number;
  total_rows: number;
  total_pages: number;
}

export interface TableData {
  table_name: string;
  columns: string[];
  data: Record<string, any>[];
  pagination: PaginationInfo;
}

interface DbState {
  sessionId: string | null;
  schema: Schema | null;
  currentView: TableData | null;
  currentSelectedTable: string | null; // [+] Added line
  isLoading: boolean;
  error: string | null;
}

interface DbStateContextType extends DbState {
  setSession: (sessionId: string, schema: Schema) => void;
  clearSession: () => void;
  setViewData: (data: TableData) => void;
  clearViewData: () => void;
  setSelectedTable: (tableName: string | null) => void; // [+] Added line
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const DbStateContext = createContext<DbStateContextType | undefined>(undefined);

export const DbStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DbState>({
    sessionId: null,
    schema: null,
    currentView: null,
    currentSelectedTable: null, // [+] Added line
    isLoading: false,
    error: null,
  });

  const setSession = (sessionId: string, schema: Schema) => {
    setState({
      sessionId,
      schema,
      currentView: null,
      currentSelectedTable: null, // [+] Added line
      isLoading: false,
      error: null,
    });
  };

  const clearSession = () => {
    setState({
      sessionId: null,
      schema: null,
      currentView: null,
      currentSelectedTable: null, // [+] Added line
      isLoading: false,
      error: null,
    });
  };

  const setViewData = (data: TableData) => {
    setState((prev) => ({ ...prev, currentView: data, isLoading: false, error: null }));
  };

  const clearViewData = () => {
    setState((prev) => ({ ...prev, currentView: null }));
  };

  // [+] New setter for current selected table
  const setSelectedTable = (tableName: string | null) => {
    setState((prev) => ({ ...prev, currentSelectedTable: tableName }));
  };

  const setLoading = (loading: boolean) => {
    setState((prev) => ({ ...prev, isLoading: loading }));
  };

  const setError = (error: string | null) => {
    setState((prev) => ({ ...prev, error, isLoading: false }));
  };

  return (
    <DbStateContext.Provider
      value={{
        ...state,
        setSession,
        clearSession,
        setViewData,
        clearViewData,
        setSelectedTable, // [+] Added line
        setLoading,
        setError,
      }}
    >
      {children}
    </DbStateContext.Provider>
  );
};

export const useDbState = () => {
  const context = useContext(DbStateContext);
  if (context === undefined) {
    throw new Error('useDbState must be used within a DbStateProvider');
  }
  return context;
};
