import {createContext, useContext} from 'react';

export const UserContext = createContext(null);

export const useUserContext = () => useContext(UserContext);

export default UserContext;