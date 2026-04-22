import React, { createContext, useContext, useState } from "react";

interface SearchContextType {
  chatResults: any[];
  setChatResults: (results: any[]) => void;
  lastFilters: any;
  setLastFilters: (filters: any) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chatResults, setChatResults] = useState<any[]>([]);
  const [lastFilters, setLastFilters] = useState<any>(null);

  return (
    <SearchContext.Provider value={{ chatResults, setChatResults, lastFilters, setLastFilters }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};
