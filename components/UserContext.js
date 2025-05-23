import { createContext, useState, useContext, useEffect } from "react";
import jwtDecode from "jwt-decode";

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
  
    useEffect(() => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decodedUser = jwtDecode(token);
          setUser(decodedUser);
        } catch (error) {
          console.error("Invalid token:", error);
          localStorage.removeItem("token");
        }
      }
    }, []);
  
    return (
      <UserContext.Provider value={{ user, setUser }}>
        {children}
      </UserContext.Provider>
    );
  }

export function useUser() {
  return useContext(UserContext);
}