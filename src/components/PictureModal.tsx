import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { authApi } from '../api/generalApi';
import { AxiosError } from 'axios';
import Loader from './Loader';
import { isValidImageUrl } from '../utils/urlValidation';
import { TextSelectionMenu } from './TextSelectionMenu';
import { Folder } from '../types/auth';
import { pictureApi } from '../api/picturesApi';

interface PictureModalProps {
  isOpen: boolean;
  pictures: { url: string }[];
  query: string;
  folders: Folder[];
  onSelect: (url: string) => void;
  onClose: () => void;
  language: string;
}

export const PictureModal: React.FC<PictureModalProps> = ({
  isOpen,
  pictures,
  query,
  folders,
  onSelect,
  onClose,
  language
}) => {
  const { t } = useTranslation();
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [text, setText] = useState(query);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFetchingPictures, setIsFetchingPictures] = useState(false);
  const [fetchedPictures, setFetchedPictures] = useState<{ url: string }[]>([]);

  useEffect(() => {
    setText(query);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('body-no-scroll');
    } else {
      document.body.classList.remove('body-no-scroll');
    }

    return () => {
      document.body.classList.remove('body-no-scroll');
    };
  }, [isOpen]);

  const handleFetchPictures = async () => {
    if (!text.trim()) return;

    setIsFetchingPictures(true);
    setError(null);

    try {
      const response = await pictureApi.getPictures(text.trim());
      const validPictures = response.pictures.filter(pic => isValidImageUrl(pic.url));

      if (validPictures.length === 0) {
        setError(t.apiPictures.noValidImageFound);
        return;
      }

      setFetchedPictures(validPictures);
    } catch (err) {
      setError(t.apiPictures.failedToFetch);
    } finally {
      setIsFetchingPictures(false);
    }
  };

  const handleSubmit = async (url: string) => {
    if (!text.trim()) {
      setError(t.cards.fillRequiredFieldsText);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authApi.createCard({
        folderId: selectedFolderId,
        text: text,
        textTranslation: url,
        isImage: true
      }, language);

      onSelect(url);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || t.folders.addFolder);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomImageSubmit = async () => {
    if (!text.trim() || !customImageUrl.trim()) {
      setError(t.cards.fillRequiredFieldsText);
      return;
    }

    if (!isValidImageUrl(customImageUrl)) {
      setError(t.cards.invalidImageUrl);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authApi.createCard({
        folderId: selectedFolderId,
        text: text,
        textTranslation: customImageUrl,
        isImage: true
      }, language);

      onSelect(customImageUrl);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || t.folders.addFolder);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-2" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} ref={containerRef}>
        <div className="modal-header">
          <h3 className="modal-title">{t.cards.changeCard}</h3>
          <button className="modal-close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-content">
          {error && (
            <div className={`modal-error-message ${!error ? 'hidden' : ''}`}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label>{t.folders.text}</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="modal-input"
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label>{t.folders.title}</label>
            <select
              value={selectedFolderId === null ? 'null' : selectedFolderId}
              onChange={(e) => setSelectedFolderId(e.target.value === 'null' ? null : parseInt(e.target.value))}
              className="modal-input"
              disabled={loading}
            >
              <option value="null">{t.folders.noFolder}</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>{folder.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>{t.apiPictures.customImageUrl}</label>
            <div className="input-with-button">
              <input
                type="text"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                className="modal-input"
                placeholder={t.apiPictures.placeholder}
              />
              <button
                className="small-confirm-button"
                onClick={handleCustomImageSubmit}
                disabled={loading || !customImageUrl.trim()}
                title="Use Custom Image"
              >
                {loading ? <Loader /> : '✓'}
              </button>
            </div>
            <button
              type="button"
              className="fetch-pictures-button"
              onClick={handleFetchPictures}
              disabled={!text.trim() || isFetchingPictures}
            >
              {isFetchingPictures ? <Loader /> : t.apiPictures.fetchPictures}
            </button>
          </div>

          <div className="pictures-container">
            {fetchedPictures.length === 0 ? (
              <div className="no-pictures-message">

              </div>
            ) : (
              fetchedPictures.map((picture, index) => (
                <div
                  key={index}
                  className="picture-item"
                  onClick={() => handleSubmit(picture.url)}
                >
                  <img
                    src={picture.url}
                    alt={`${text} ${index}`}
                    className="picture-thumbnail"
                  />
                  {loading && <Loader />}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {isOpen && <TextSelectionMenu targetRef={containerRef} onInputChange={handleInputChange} />}
    </div>
  );
};