import { useState, useEffect } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ProfileChange from './pages/ProfileChange';
import { authApi } from './api/authApi';
import './styles/main.css';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  const handleAuthSuccess = (token: string) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          await authApi.validateToken(token);
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      }
      
      setIsAuthChecked(true);
    };

    checkAuth();
  }, []);


if (!isAuthChecked) {
    return <Loader />;
  }

  return (
    <BrowserRouter>
      <div className="app">
        <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <main className="main-content">
        <Switch>
            <Route exact path="/" render={() => (
              <Home isAuthenticated={isAuthenticated} />
            )} />
            
            <Route exact path="/register" render={() => (
              isAuthenticated ? (
                <Redirect to="/" />
              ) : (
                <Register onAuthSuccess={handleAuthSuccess} />
              )
            )} />
            
            <Route exact path="/login" render={() => (
              isAuthenticated ? (
                <Redirect to="/" />
              ) : (
                <Login onAuthSuccess={handleAuthSuccess} />
              )
            )} />
            
            <Route exact path="/profile" render={() => (
              !isAuthenticated ? (
                <Redirect to="/login" />
              ) : (
                <Profile isAuthenticated={isAuthenticated} />
              )
            )} />
            
            <Route exact path="/profile/change" render={() => (
              !isAuthenticated ? (
                <Redirect to="/login" />
              ) : (
                <ProfileChange isAuthenticated={isAuthenticated} onAuthSuccess={handleAuthSuccess}/>
              )
            )} />
          </Switch>
        </main>
      </div>
    </BrowserRouter>
  );
}

export const Loader = () => {
  return (
    <div className="loader-wrapper">
    <svg className="loader-spinner" viewBox="0 0 50 50">
        <circle className="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
    </svg>
</div>
  );
};

export default App;