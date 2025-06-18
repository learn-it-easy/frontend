import { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { authApi } from '../api/generalApi';
import { AxiosError } from 'axios';
import { ApiErrorResponse, LoginProps } from '../types/auth';
import { useTranslation } from '../hooks/useTranslation';
import { LanguageContext } from '../contexts/LanguageContext';
import { useValidations } from '../utils/validations';

const Login = ({ onAuthSuccess }: LoginProps) => {
  const { t } = useTranslation();
  const { language } = useContext(LanguageContext);
  const { validateUsername, validatePassword } = useValidations();

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [errors, setErrors] = useState({
    username: '',
    password: ''
  });

  const [touched, setTouched] = useState({
    username: false,
    password: false
  });

  const [apiError, setApiError] = useState<string | null>(null);
  const history = useHistory();

  useEffect(() => {
    if (touched.username || touched.password) {
      setErrors({
        username: validateUsername(formData.username),
        password: validatePassword(formData.password)
      });
    }
  }, [language, t]);

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'username': return validateUsername(value);
      case 'password': return validatePassword(value);
      default: return '';
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name as keyof typeof formData]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name as keyof typeof touched]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      username: validateUsername(formData.username),
      password: validatePassword(formData.password)
    };

    setErrors(newErrors);
    setTouched({
      username: true,
      password: true
    });

    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    try {
      const response = await authApi.login(formData, language);
      onAuthSuccess(response.token);
      history.push('/');
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setApiError(axiosError.response?.data.message || t.login.errorOfLogin);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>{t.login.labelEnter}</h2>
        {apiError && <div className="error-message">{apiError}</div>}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label>{t.common.username}</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.username && <div className="error-message">{errors.username}</div>}
          </div>
          <div className="form-group">
            <label>{t.common.password}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          <button type="submit" className="submit-button">
            {t.login.loginButton}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;