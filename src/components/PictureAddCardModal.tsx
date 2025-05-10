import { useState, useEffect, useContext } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { authApi } from '../api/authApi';
import { LanguageContext } from '../contexts/LanguageContext';
import { ApiErrorResponse, Folder } from '../types/auth';
import { AxiosError } from 'axios';
import Loader  from '../components/Loader';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardAdded: () => void;
}

const AddCardModal: React.FC<AddCardModalProps> = ({ isOpen, onClose, onCardAdded }) => {
  const { t } = useTranslation();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [error, setError] = useState<ApiErrorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { language } = useContext(LanguageContext);
  const [modalError, setModalError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    folderId: null,
    text: '',
    textTranslation: '',
    isImage: false
  });

  // Функция проверки URL изображения
  const isImageUrl = (url: string): boolean => {
    try {
      new URL(url);
      const lowerUrl = url.toLowerCase();
      return lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|bmp)(\?.*)?$/) !== null;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFolders();
      setError(null)
    }
  }, [isOpen, language]);

  const fetchFolders = async () => {
    try {
      setLoading(true);
      const fetchedFolders = await authApi.getAllFolders(language);
      setFolders(fetchedFolders);
    } catch (err) {
      console.error('Error fetching folders:', err);
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setModalError(axiosError.response?.data?.message || t.folders.errorLoading);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              (name === 'folderId' ? (value === 'null' ? null : parseInt(value)) : value)
    }));

    setModalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.text.trim()) {
      setModalError(t.cards.fillRequiredFieldsText);
      return;
    }

    if (!formData.textTranslation.trim()) {
      setModalError(t.cards.fillRequiredFieldsTextTranslate);
      return;
    }

    if (formData.isImage && !isImageUrl(formData.textTranslation)) {
      setModalError(t.cards.invalidImageUrl);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

       // Автоматически определяем isImage если URL похож на изображение
       const finalData = {
        ...formData,
        isImage: formData.isImage || isImageUrl(formData.textTranslation)
      };

      await authApi.createCard(formData, language);
      onCardAdded();
      onClose();

      setFormData({
        folderId: null,
        text: '',
        textTranslation: '',
        isImage: false
      });
    } catch (err) {
        const axiosError = err as AxiosError<ApiErrorResponse>;
        const errorMessage = axiosError.response?.data?.message || t.folders.addFolder;

        if (modalError !== errorMessage) {
            setModalError(errorMessage);
        }

      } finally {
        setLoading(false);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">{t.navbar.add}</h3>
          <button className="modal-close-button" onClick={onClose} disabled={loading}>
            &times;
          </button>
        </div>
        
        <div className="modal-content">
          {modalError && (
            <div className={`modal-error-message ${!modalError ? 'hidden' : ''}`}>
              {modalError}
            </div>
          )}
          {loading ? (
            <Loader />
          ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{t.folders.text}</label>
              <input
                type="text"
                name="text"
                value={formData.text}
                onChange={handleInputChange}
                className="modal-input"
                autoComplete="off"  
              />
            </div>

            <div className="form-group">
              <label>{t.folders.textTranslation}</label>
              <input
                type="text"
                name="textTranslation"
                value={formData.textTranslation}
                onChange={handleInputChange}
                className="modal-input"
                autoComplete="off"  
              />
            </div>

            <div className="form-group">
              <label>{t.folders.title}</label>
              <select
                name="folderId"
                value={formData.folderId === null ? 'null' : formData.folderId}
                onChange={handleInputChange}
                className="modal-input"
                disabled={loading}
              >
                <option value="null">{t.folders.noFolder}</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>{folder.name}</option>
                ))}
              </select>
            </div>

            
            <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="isImageCheckbox"
                  name="isImage"
                  checked={formData.isImage}
                  onChange={handleInputChange}
                />
                <label htmlFor="isImageCheckbox">{t.cards.isImage}</label>
              </div>
              
                          
              <div className="action-buttons">
                <button 
                  type="submit" 
                  className="modal-button confirm" 
                  disabled={loading}
                >
                  {loading ? t.common.create : t.common.create}

                </button>
              </div>

          </form>
          )}
          </div>
      </div>
    </div>
  );
};

export default AddCardModal;