
import './App.css';
import Auth from './Login';
import { useState } from 'react';
import Home from  "./Home"
function App() {
  const [user,setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  return (
    <div className="App">
      <Home
        user={user}
        setUser={setUser}
      />
    </div>
  );
}

export default App;
