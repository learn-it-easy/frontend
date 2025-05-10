import { createContext, useContext } from 'react';

interface FoldersContextType {
  refreshFolders: () => void;
}

export const FoldersContext = createContext<FoldersContextType>({
  refreshFolders: () => {}
});

export const useFolders = () => useContext(FoldersContext);
