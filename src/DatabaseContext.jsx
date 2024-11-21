import { createContext } from 'react';

const DatabaseContext = createContext({user: null, setUser: null});
export default DatabaseContext;
