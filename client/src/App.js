import './App.css';
import Auth from './Login';
import { useState, useEffect } from 'react';
import Home from  "./Home"
import {jwtDecode} from 'jwt-decode';
import axios from 'axios';



function App() {
  const [user, setUser] = useState(localStorage.getItem('username') || null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  useEffect(() => {
    const fetchUserData = async () => {
      const userType=localStorage.getItem('userType');
      if (token && userType==='Student') {
        try {
          
          setIsLoading(true);
          const decoded = jwtDecode(token);
          const response = await axios.get(`https://hackblitz-nine.vercel.app/api/auth/profile/${decoded.id}`);
          setUser(response.data.username);
          localStorage.setItem('username', response.data.username);
          setIsLoggedIn(true);
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Clear invalid token
          //localStorage.removeItem('token');
        //  setToken('');
        } finally {
          setIsLoading(false);
        }
      }
      if (token && userType==='Teacher')
      {
        setIsLoggedIn(true);
      }
    };

    fetchUserData();
  }, [token]);

  return (
    <div className="App">
      {!isLoading && (
        <Home
          user={user}
          setUser={setUser}
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          token={token}
          setToken={setToken}
        />
      )}
    </div>
  );
}

export default App;
