import { useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';

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

export const ContextModal: React.FC<ContextModalProps> = ({ isOpen, sentences, onSelect, onClose }) => {
  const { t } = useTranslation();

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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-2" onClick={onClose}>
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
                  onSelect(sentence.text, sentence.textTranslate);
                  onClose();
                }}
              >
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