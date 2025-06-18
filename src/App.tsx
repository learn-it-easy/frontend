import { useState, useEffect } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ProfileChange from './pages/ProfileChange';
import FolderCards from './pages/FolderCards';
import { authApi } from './api/generalApi';
import Loader from './components/Loader';
import './styles/main.css';
import Folders from './pages/Folders';
import FolderCardsAll from './pages/FolderCardsAll';
import { FoldersContext } from './contexts/FolderContext';
import { CardsContext } from './contexts/CardContext';
import CardReviewFolder from './pages/CardReviewFolder';
import TextPage from './pages/TextPage';
import Navbar from './components/Navbar';
import YouTubeSubtitleViewer from './pages/VideoPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [cardsRefreshTrigger, setCardsRefreshTrigger] = useState(0);


  const refreshCards = () => {
    setCardsRefreshTrigger(prev => prev + 1);
    console.log('Cards refresh triggered');
  };

  const refreshFolders = () => {
    setRefreshTrigger(prev => prev + 1);
    console.log('Folders refresh triggered');
  };

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
    <FoldersContext.Provider value={{ refreshFolders }}>
      <CardsContext.Provider value={{ refreshCards, cardsRefreshTrigger }}>
        <BrowserRouter>
          <div className="app">
            <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
            {isAuthenticated && <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />}
            <Route path="/video">
              {({ match }) => (
                <main className={match ? "video-content" : (isAuthenticated ? "main-content center-from-nav" : "main-content")}>
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

                    <Route exact path="/folders" render={() => (
                      !isAuthenticated ? (
                        <Redirect to="/login" />
                      ) : (
                        <Folders
                          isAuthenticated={isAuthenticated}
                          refreshTrigger={refreshTrigger}
                        />
                      )
                    )} />

                    <Route exact path="/folders/cards" render={() => (
                      !isAuthenticated ? (
                        <Redirect to="/login" />
                      ) : (
                        <FolderCards isAuthenticated={isAuthenticated} />
                      )
                    )} />

                    <Route exact path="/folders/cards/all" render={() => (
                      !isAuthenticated ? (
                        <Redirect to="/login" />
                      ) : (
                        <FolderCardsAll isAuthenticated={isAuthenticated} />
                      )
                    )} />

                    <Route exact path="/review/all" render={() => (
                      !isAuthenticated ? (
                        <Redirect to="/login" />
                      ) : (
                        <CardReviewFolder isAuthenticated={isAuthenticated} />
                      )
                    )} />

                    <Route exact path="/review" render={() => (
                      !isAuthenticated ? (
                        <Redirect to="/login" />
                      ) : (
                        <CardReviewFolder isAuthenticated={isAuthenticated} />
                      )
                    )} />

                    <Route exact path="/text" render={() => (
                      !isAuthenticated ? (
                        <Redirect to="/login" />
                      ) : (
                        <TextPage isAuthenticated={isAuthenticated} />
                      )
                    )} />

                    <Route exact path="/video" render={() => (
                      !isAuthenticated ? (
                        <Redirect to="/login" />
                      ) : (
                        <YouTubeSubtitleViewer isAuthenticated={isAuthenticated} />
                      )
                    )} />


                    <Route exact path="/profile/change" render={() => (
                      !isAuthenticated ? (
                        <Redirect to="/login" />
                      ) : (
                        <ProfileChange isAuthenticated={isAuthenticated} onAuthSuccess={handleAuthSuccess} />
                      )
                    )} />
                  </Switch>
                </main>
              )}
            </Route>
          </div>
        </BrowserRouter>
      </CardsContext.Provider>
    </FoldersContext.Provider>
  );
}

export default App;