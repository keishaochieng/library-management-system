import { createContext, useContext, useEffect, useReducer } from 'react';

const STORAGE_KEY = 'readingList';

const ReadingListContext = createContext(null);

// The reducer: takes the current list + an action, returns the NEW list.
function readingListReducer(state, action) {
  switch (action.type) {
    case 'ADD_BOOK': {
      // Don't add the same book twice
      if (state.some((book) => book.id === action.book.id)) return state;
      return [...state, action.book];
    }
    case 'REMOVE_BOOK':
      return state.filter((book) => book.id !== action.id);
    case 'CLEAR_LIST':
      return [];
    default:
      return state;
  }
}

// Restore the saved list from localStorage when the app starts
function loadSavedList() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function ReadingListProvider({ children }) {
  const [readingList, dispatch] = useReducer(
    readingListReducer,
    [],
    loadSavedList,
  );

  // Persist: save to localStorage every time the list changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(readingList));
  }, [readingList]);

  const value = {
    readingList,
    count: readingList.length,
    addBook: (book) =>
      dispatch({
        type: 'ADD_BOOK',
        book: { id: book.id, title: book.title, author: book.author },
      }),
    removeBook: (id) => dispatch({ type: 'REMOVE_BOOK', id }),
    clearList: () => dispatch({ type: 'CLEAR_LIST' }),
  };

  return (
    <ReadingListContext.Provider value={value}>
      {children}
    </ReadingListContext.Provider>
  );
}

export function useReadingList() {
  const context = useContext(ReadingListContext);
  if (!context) {
    throw new Error('useReadingList must be used inside <ReadingListProvider>');
  }
  return context;
}
