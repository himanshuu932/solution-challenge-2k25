
import './App.css';
import Auth from './Login';
import { useState } from 'react';

function App() {
  const [user,setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  return (
    <div className="App">
      <Auth user={user} setUser={setUser}/>
    </div>
  );
}

export default App;
