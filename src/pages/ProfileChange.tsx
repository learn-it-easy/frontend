import { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { AxiosError } from 'axios';
import Navbar from '../components/Navbar';
import { ApiErrorResponse, LanguageDto, HomePropsToken } from '../types/auth';
import { useTranslation } from '../hooks/useTranslation';
import { LanguageContext } from '../contexts/LanguageContext';
import { useValidations } from '../utils/validations';

const ProfileChange = ({ isAuthenticated, onAuthSuccess }: HomePropsToken) => {
  const { t } = useTranslation();
  const { language } = useContext(LanguageContext);
  const history = useHistory();
  const {
    validateEmail,
    validateUsername,
    validatePassword,
    validateLanguage
  } = useValidations();


  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    learningLanguageId: 0,
    nativeLanguageId: 0
  });

  
  const [languages, setLanguages] = useState<LanguageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    learningLanguage: '',
    nativeLanguage: ''
  });
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const languagesData = await authApi.getLanguages();
        setLanguages(languagesData);
  
        if (formData.username === '' && formData.email === '') {
          const profileData = await authApi.getProfile(language);
          setFormData({
            username: profileData.username,
            email: profileData.email,
            password: '',
            learningLanguageId: profileData.learningLanguageId,
            nativeLanguageId: profileData.nativeLanguageId
          });
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        const axiosError = err as AxiosError<ApiErrorResponse>;
        setApiError(axiosError.response?.data.message || t.profile.errorLoading);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [language]);

  useEffect(() => {
    if (formData.username || formData.email || formData.password) {
      setErrors({
        username: validateUsername(formData.username),
        email: formData.email.trim() ? 
          (validateEmail(formData.email) ? '' : t.validation.emailInvalid) : 
          t.validation.emailRequired,
        password: validatePassword(formData.password, false),
        learningLanguage: validateLanguage(formData.learningLanguageId),
        nativeLanguage: validateLanguage(formData.nativeLanguageId)
      });
    }
  }, [language, t]);
 
  const validateForm = (): boolean => {
    const newErrors = {
      username: validateUsername(formData.username),
      email: formData.email.trim() ? 
        (validateEmail(formData.email) ? '' : t.validation.emailInvalid) : 
        t.validation.emailRequired,
      password: validatePassword(formData.password, false),
      learningLanguage: validateLanguage(formData.learningLanguageId),
      nativeLanguage: validateLanguage(formData.nativeLanguageId)
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.endsWith('Id') ? Number(value) : value
    }));

    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    try {
      const response = await authApi.updateProfile({
        username: formData.username,
        email: formData.email,
        password: formData.password || undefined,
        learningLanguageId: formData.learningLanguageId,
        nativeLanguageId: formData.nativeLanguageId
      }, language);

      if (response.token) {
        onAuthSuccess(response.token);
      }

      history.push('/profile');
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setApiError(axiosError.response?.data.message || t.profile.errorUpdating);
    }
  };

  if (loading) {
    return <div className="loading">{t.profile.loading}</div>;
  }

  return (
    <div className="profile-change-page">
      {isAuthenticated && <Navbar />}
      <div className="profile-change-container">
        <h1>{t.profile.editTitle}</h1>
        
        {apiError && <div className="error-message">{apiError}</div>}
        
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>{t.common.username}</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && <div className="error-message">{errors.username}</div>}
          </div>
          
          <div className="form-group">
            <label>{t.common.email}</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label>{t.common.password}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t.profile.passwordPlaceholder}
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          
          <div className="form-group">
            <label>{t.common.learningLanguage}</label>
            <select
              name="learningLanguageId"
              value={formData.learningLanguageId}
              onChange={handleChange}
            >
              <option value={0}>{t.profile.selectLanguage}</option>
              {languages.map(lang => (
                <option key={lang.id} value={lang.id}>{lang.name}</option>
              ))}
            </select>
            {errors.learningLanguage && <div className="error-message">{errors.learningLanguage}</div>}
          </div>
          
          <div className="form-group">
            <label>{t.common.nativeLanguage}</label>
            <select
              name="nativeLanguageId"
              value={formData.nativeLanguageId}
              onChange={handleChange}
            >
              <option value={0}>{t.profile.selectLanguage}</option>
              {languages.map(lang => (
                <option key={lang.id} value={lang.id}>{lang.name}</option>
              ))}
            </select>
            {errors.nativeLanguage && <div className="error-message">{errors.nativeLanguage}</div>}
          </div>
          
          <div className="form-actions">
            <button type="submit" className="save-button">
              {t.profile.saveButton}
            </button>
            <button 
              type="button" 
              onClick={() => history.push('/profile')}
              className="cancel-button"
            >
              {t.profile.cancelButton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileChange;