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

interface DbState {
  sessionId: string | null;
  schema: Schema | null;
  isLoading: boolean;
  error: string | null;
}

interface DbStateContextType extends DbState {
  setSession: (sessionId: string, schema: Schema) => void;
  clearSession: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const DbStateContext = createContext<DbStateContextType | undefined>(undefined);

export const DbStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DbState>({
    sessionId: null,
    schema: null,
    isLoading: false,
    error: null,
  });

  const setSession = (sessionId: string, schema: Schema) => {
    setState({ sessionId, schema, isLoading: false, error: null });
  };

  const clearSession = () => {
    setState({ sessionId: null, schema: null, isLoading: false, error: null });
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