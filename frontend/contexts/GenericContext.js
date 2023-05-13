import { createContext, useContext, useState } from "react";

const GenericContext = createContext();

export const useGenericContext = () => useContext(GenericContext);

export const GenericContextProvider = ({ children }) => {
  const [checkedContacts, setCheckedContacts] = useState([]);
  const [safeAddress, setSafeAddress] = useState("");

  return (
    <GenericContext.Provider value={{ checkedContacts, setCheckedContacts, safeAddress, setSafeAddress }}>
      {children}
    </GenericContext.Provider>
  );
};
