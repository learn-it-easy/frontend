import { createContext, useContext } from 'react';

interface CardsContextType {
  refreshCards: () => void;
  cardsRefreshTrigger: number;
}

export const CardsContext = createContext<CardsContextType>({
  refreshCards: () => {},
  cardsRefreshTrigger: 0
});

export const useCards = () => useContext(CardsContext);