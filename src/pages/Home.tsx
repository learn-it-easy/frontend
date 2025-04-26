import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useTranslation } from '../hooks/useTranslation';
import { HomeProps } from '../types/auth';

const Home = ({ isAuthenticated }: HomeProps) => {
  const { t } = useTranslation();
  return (
    <div className={`home-page ${isAuthenticated ? 'authenticated' : ''}`}>
      {isAuthenticated && <Navbar />}
      <div className="content">
        <h1>{t.home.welcomeHeader}</h1>
        <p>{t.home.test}</p>
        
        {!isAuthenticated && (
          <div className="auth-links">
            <Link to="/register" className="auth-link">{t.home.registerButton}</Link>
            <Link to="/login" className="auth-link">{t.home.loginButton}</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;