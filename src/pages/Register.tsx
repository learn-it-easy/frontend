import { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { authApi } from '../api/generalApi';
import { AxiosError } from 'axios';
import { ApiErrorResponse, LanguageDto, RegisterProps } from '../types/auth';
import { useTranslation } from '../hooks/useTranslation';
import { LanguageContext } from '../contexts/LanguageContext';
import { useValidations } from '../utils/validations';

const Register = ({ onAuthSuccess }: RegisterProps) => {
  const { t } = useTranslation();
  const { language } = useContext(LanguageContext);
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

  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    learningLanguage: '',
    nativeLanguage: ''
  });

  const [languages, setLanguages] = useState<LanguageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const history = useHistory();

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const languages = await authApi.getLanguages();
        setLanguages(languages);
      } catch (err) {
        console.error('Error fetching languages:', err);
        setApiError(t.registration.errorLaunchLanguages);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLanguages();
  }, [t.registration.errorLaunchLanguages, language]);

  
  useEffect(() => {
    const hasErrors = Object.values(errors).some(error => error !== '');
    const hasValues = Object.values(formData).some(value => 
      typeof value === 'string' ? value.trim() !== '' : value !== 0
    );

    if (hasErrors || hasValues) {
      setErrors({
        username: validateUsername(formData.username),
        email: formData.email.trim() ? 
          (validateEmail(formData.email) ? '' : t.validation.emailInvalid) : 
          t.validation.emailRequired,
        password: validatePassword(formData.password),
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
      password: validatePassword(formData.password),
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
      const response = await authApi.register(formData, language);
      onAuthSuccess(response.token);
      history.push('/');
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setApiError(axiosError.response?.data.message || t.registration.errorOfRegistration);
    }
  };

  if (loading) {
    return <div>{t.registration.loadingLanguages}</div>;
  }

  return (
    <div className="auth-page">
      <div className="auth-container register-margin">
        <h2>{t.registration.registrationLabel}</h2>
        {apiError && <div className="error-message">{apiError}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
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
              <option value={0}>{t.validation.chooseLanguage}</option>
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
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
              <option value={0}>{t.validation.chooseLanguage}</option>
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
            {errors.nativeLanguage && <div className="error-message">{errors.nativeLanguage}</div>}
          </div>
          <button type="submit" className="submit-button">
            {t.registration.registerButton}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;