import { createContext, useContext, useState } from "react";

const CheckedContactsContext = createContext();

export const useCheckedContacts = () => useContext(CheckedContactsContext);

export const CheckedContactsProvider = ({ children }) => {
  const [checkedContacts, setCheckedContacts] = useState([]);

  return (
    <CheckedContactsContext.Provider value={{ checkedContacts, setCheckedContacts }}>
      {children}
    </CheckedContactsContext.Provider>
  );
};
