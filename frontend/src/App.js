import './App.css';
import {
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import Auth from './pages/Auth';
import { Events } from './pages/Events';
import Bookings from './pages/Bookings';
import Navbar from './components/Navigation/Navbar'
import AuthContext from './context/auth-context';
import { useState } from 'react';

function App() {
  const [token, setToken] = useState(null)
  const [userId, setUserId] = useState(null)
  return (
    <>
    <AuthContext.Provider value={{token: token,userId: userId, 
      login: (token, userId, tokenExpiration) => {
          setToken(token);
          setUserId(userId);
      }, logout: () => {
          setToken(null);
          setUserId(null);
      }}}>
    <Navbar/>
      <main className="main-content">
        <Routes>
            {!token && <Route path="/auth" element={<Auth />}></Route>}
            <Route path="/events" element={<Events />}></Route>
            {token && <Route path="/bookings" element={<Bookings />}></Route>}
            {token && <Route
              path="/logout"
              element={<Navigate to="/auth" replace />}
          />}
            {!token && <Route
              path="*"
              element={<Navigate to="/auth" replace />}
          />}
          {token && <Route
              path="*"
              element={<Navigate to="/events" replace />}
          />}
          </Routes>
      </main>
      </AuthContext.Provider>
    </>
  );
}

export default App;
