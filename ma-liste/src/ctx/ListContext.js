import React, { createContext, useState } from 'react';

export const ListContext = createContext();

export function ListContextProvider({ children }) {
  const [tasks, setTasks] = useState([]);

  const value = {
    tasks,
    setTasks,
  };

  return (
    <ListContext.Provider value={value}>
      {children}
    </ListContext.Provider>
  );
}
