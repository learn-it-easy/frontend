import { useState, useEffect, useContext, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { authApi } from '../api/authApi';
import { LanguageContext } from '../contexts/LanguageContext';
import { ApiErrorResponse, Folder } from '../types/auth';
import { AxiosError } from 'axios';
import Loader from '../components/Loader';
import { useCards } from '../contexts/CardContext';
import { TextSelectionMenu } from './TextSelectionMenu';
import { translateApi } from '../api/translateApi';
import { contextApi } from '../api/contextApi';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardAdded: () => void;
  initialText?: string;
}

interface ContextModalProps {
  isOpen: boolean;
  sentences: {
    text: string;
    textTranslate: string;
  }[];
  onSelect: (text: string, translation: string) => void;
  onClose: () => void;
}

const formatText = (text: string) => {
  const parts = text.split(/(==[^=]+==)/g);

  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith('==') && part.endsWith('==')) {
          const word = part.slice(2, -2);
          return (
            <span
              key={index}
              className="word-background"
            >
              {word}
            </span>
          );
        }
        return part;
      })}
    </span>
  );
};

const AddCardModal: React.FC<AddCardModalProps> = ({ isOpen, onClose, onCardAdded, initialText = '' }) => {
  const ContextModal: React.FC<ContextModalProps> = ({ isOpen, sentences, onSelect, onClose }) => {
    if (!isOpen) return null;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">{t.apiContext.menuTitle}</h3>
            <button className="modal-close-button" onClick={onClose}>
              &times;
            </button>
          </div>
          <div className="modal-content">
            <div className="context-sentences">
              {sentences.map((sentence, index) => (
                <div
                  key={index}
                  className="context-sentence"
                  onClick={() => {
                    // Передаем оригинальные тексты с == ==
                    onSelect(sentence.text, sentence.textTranslate);
                    onClose();
                  }}
                >
                  {/* Отображаем форматированный текст */}
                  <div className="context-original">{formatText(sentence.text)}</div>
                  <div className="context-translation">{formatText(sentence.textTranslate)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };
  const { t } = useTranslation();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [error, setError] = useState<ApiErrorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { language } = useContext(LanguageContext);
  const [modalError, setModalError] = useState<string | null>(null);
  const { refreshCards } = useCards();
  const [isTranslating, setIsTranslating] = useState(false);
  const [contextModalOpen, setContextModalOpen] = useState(false);
  const [contextSentences, setContextSentences] = useState<{ text: string; textTranslate: string }[]>([]);
  const [isFetchingContext, setIsFetchingContext] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const initialFormData = {
    folderId: null,
    text: initialText,
    textTranslation: '',
    isImage: false,
  };

  const handleTranslate = async () => {
    if (!formData.text.trim()) return;

    setIsTranslating(true);
    setModalError(null);

    try {
      const translatedText = await translateApi.translateText(t.apiTranslate.errorTranslate, formData.text);
      setFormData(prev => ({
        ...prev,
        textTranslation: translatedText,
      }));
    } catch (err) {
      const error = err as Error;
      setModalError(error.message || t.cards.translationError);
    } finally {
      setIsTranslating(false);
    }
  };

  const [formData, setFormData] = useState(initialFormData);

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
      setFormData({
        folderId: null,
        text: initialText,
        textTranslation: '',
        isImage: false
      });
      fetchFolders();
      setError(null);
    }
  }, [isOpen, initialText, language]);

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

  const handleGetContext = async () => {
    if (!formData.text.trim()) return;

    setIsFetchingContext(true);
    setModalError(null);

    try {
      const response = await contextApi.getContextSentences(formData.text.trim());
      setContextSentences(response.sentences);
      setContextModalOpen(true);
    } catch (err) {
      const error = err as Error;
      setModalError(error.message || 'Failed to fetch context sentences');
    } finally {
      setIsFetchingContext(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: (name === 'folderId' ? (value === 'null' ? null : parseInt(value)) : value),
    }));

    setModalError(null);
  };

  const handleClose = () => {
    // Сброс формы при закрытии
    setFormData(initialFormData);
    setModalError(null);
    onClose();
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

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      await authApi.createCard(formData, language);

      refreshCards();
      onCardAdded();
      handleClose();

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
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-container" ref={modalRef}>
        {isOpen && <TextSelectionMenu targetRef={modalRef} onInputChange={handleInputChange as any} />}
        <div className="modal-header">
          <h3 className="modal-title">{t.navbar.add}</h3>
          <button className="modal-close-button" onClick={handleClose} disabled={loading}>
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
                  autoFocus
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
                <div className="input-hint">{t.cards.placeholder}</div>
              </div>

              <div className="button-group">
                <div className="small-buttons">
                  <button
                    type="button"
                    className={`small-button ${!formData.text.trim() ? 'disabled' : ''}`}
                    onClick={handleTranslate}
                    disabled={!formData.text.trim() || isTranslating}
                  >
                    {isTranslating ? <><Loader /> T</> : 'T'}
                  </button>
                  <button
                    type="button"
                    className="small-button"
                    onClick={handleGetContext}
                    disabled={!formData.text.trim() || isFetchingContext}
                  >

                    {isFetchingContext ? <><Loader /> C</> : 'C'}
                  </button>
                  <button type="button" className="small-button" disabled>T</button>
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
              </div>
            </form>
          )}
        </div>
      </div>
      <ContextModal
        isOpen={contextModalOpen}
        sentences={contextSentences}
        onSelect={(text, translation) => {
          setFormData(prev => ({
            ...prev,
            text,
            textTranslation: translation
          }));
        }}
        onClose={() => setContextModalOpen(false)}
      />
    </div>
  );
};

export default AddCardModal;