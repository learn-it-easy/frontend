import { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { AxiosError } from 'axios';
import Navbar from '../components/Navbar';
import { useTranslation } from '../hooks/useTranslation';
import { LanguageContext } from '../contexts/LanguageContext';
import { ApiErrorResponse } from '../types/auth';

interface ProfileData {
  username: string;
  email: string;
  learningLanguageId: number;
  nativeLanguageId: number;
  learningLanguage?: string; 
  nativeLanguage?: string;
}

interface HomeProps {
    isAuthenticated: boolean;
  }

const Profile = ({ isAuthenticated }: HomeProps) => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const history = useHistory();
  const { t } = useTranslation();
  const { language } = useContext(LanguageContext);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const [profileResponse, languages] = await Promise.all([
          authApi.getProfile(language),
          authApi.getLanguages()
        ]);
                
        if (!profileResponse) {
          throw new Error('Empty response from server');
        }
  
        const learningLang = languages.find(l => l.id === profileResponse.learningLanguageId);
        const nativeLang = languages.find(l => l.id === profileResponse.nativeLanguageId);
  
        setProfileData({
          username: profileResponse.username,
          email: profileResponse.email,
          learningLanguageId: profileResponse.learningLanguageId,
          nativeLanguageId: profileResponse.nativeLanguageId,
          learningLanguage: learningLang?.name || t.common.unknow,
          nativeLanguage: nativeLang?.name || t.common.unknow
        });
      } catch (err) {
        console.error('Profile fetch error:', err);
        const axiosError = err as AxiosError<ApiErrorResponse>;
        setError(axiosError.response?.data?.message || t.profile.errorLoading);
        
        if (axiosError.response?.status === 401) {
          history.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchProfile();
  }, [language, history, t.profile.errorLoading]);

  if (loading) {
    return <div className="loading-spinner">{t.profile.loading}</div>;
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="error-message">{error}</div>
        <button onClick={() => window.location.reload()}>
          {t.common.tryAgain}
        </button>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profile-page">
        <div className="error-message">{t.profile.noData}</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
     {isAuthenticated && <Navbar />}
      <div className="profile-container">
        <h1>{t.profile.title}</h1>
        
        <div className="profile-info">
          <div className="profile-field">
            <label className="label-profile" >{t.common.username}:</label>
            <span className="value">{profileData.username}</span>
          </div>
          
          <div className="profile-field">
            <label className="label-profile">{t.common.email}:</label>
            <span className="value">{profileData.email}</span>
          </div>
          
          <div className="profile-field">
            <label className="label-profile">{t.common.learningLanguage}:</label>
            <span className="value">{profileData.learningLanguage}</span>
          </div>
          
          <div className="profile-field">
            <label className="label-profile">{t.common.nativeLanguage}:</label>
            <span className="value">{profileData.nativeLanguage}</span>
          </div>
        </div>

        <button 
          onClick={() => history.push('/profile/change')}
          className="edit-button"
        >
          {t.profile.editButton}
        </button>
      </div>
    </div>
  );
};

export default Profile;