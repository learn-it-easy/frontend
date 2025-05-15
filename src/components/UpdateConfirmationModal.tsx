import { useEffect, useRef, useState } from "react";
import Modal from "../components/Modal";
import { Folder, UpdateData } from "../types/auth";
import { TextSelectionMenu } from "./TextSelectionMenu";
import { isValidImageUrl } from '../utils/urlValidation';

interface CardReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
    updateData: UpdateData;
    setUpdateData: React.Dispatch<React.SetStateAction<UpdateData>>;
    folders: Folder[];
    t: any;
}

export const CardReviewModal: React.FC<CardReviewModalProps> = ({ 
    isOpen, 
    onClose, 
    onUpdate,
    updateData,
    setUpdateData,
    folders, 
    t 
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [modalError, setModalError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target as HTMLInputElement | HTMLSelectElement;

        setUpdateData(prev => ({
            ...prev,
            [name]: name === 'folderId' 
                ? (value ? parseInt(value) : null)
                : value,
        }));
        setModalError(null);
    };

    const handleUpdate = () => {
        if (updateData.isImage) {
            if (!isValidImageUrl(updateData.textTranslation)) {
                setModalError(t.cards.invalidImageUrl);
                return;
            }
        }
        setModalError(null);
        onUpdate();
    };

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

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'Enter') {
                handleUpdate();
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onUpdate, onClose, updateData]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t.folders.change}>
            <div className="modal-body" ref={modalRef}>
                {isOpen && <TextSelectionMenu targetRef={modalRef} onInputChange={handleInputChange} />}

                {modalError && (
                    <div className={`modal-error-message ${!modalError ? 'hidden' : ''}`}>
                        {modalError}
                    </div>
                )}

                <div className="form-group">
                    <label>{t.folders.text}</label>
                    <input
                        type="text"
                        name="text"
                        value={updateData.text}
                        onChange={(e) => setUpdateData({
                            ...updateData,
                            text: e.target.value
                        })}
                        className="modal-input modal-update-input"
                    />
                </div>

                <div className="form-group">
                    <label>{updateData.isImage ? t.folders.customImageUrl : t.folders.textTranslation}</label>
                    <input
                        type="text"
                        name="textTranslation"
                        value={updateData.textTranslation}
                        onChange={(e) => setUpdateData({
                            ...updateData,
                            textTranslation: e.target.value
                        })}
                        className="modal-input modal-update-input"
                    />
                </div>

                <div className="form-group">
                    <label>{t.folders.title}</label>
                    <select
                        name="folderId"
                        value={updateData.folderId || ''}
                        onChange={(e) => setUpdateData({
                            ...updateData,
                            folderId: e.target.value ? parseInt(e.target.value) : null
                        })}
                        className="modal-input modal-update-input"
                    >
                        <option value="">{t.folders.noFolder || 'No folder'}</option>
                        {folders.map(folder => (
                            <option key={folder.id} value={folder.id}>{folder.name}</option>
                        ))}
                    </select>
                </div>

                <div className="modal-footer">
                    <button
                        className="modal-button confirm"
                        onClick={handleUpdate}
                    >
                        {t.folders.change}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
