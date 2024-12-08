import { useState } from 'react';
import { useContext, createContext } from 'react';

const DnDContext = createContext(
  null,
  () => {},
  null,
  () => {}
);

export const DnDProvider = ({ children }) => {
  // when drap onto pane
  const [nodeType, setNodeType] = useState(null);

  // when drop into trash bin
  const [trashHovered, setTrashHovered] = useState(null);

  return (
    <DnDContext.Provider
      value={{ nodeType, setNodeType, trashHovered, setTrashHovered }}
    >
      {children}
    </DnDContext.Provider>
  );
};

export default DnDContext;

export const useDnD = () => {
  return useContext(DnDContext);
};
