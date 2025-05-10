import { useEffect, useRef } from "react";
import Modal from "../components/Modal";
import { Folder, UpdateData } from "../types/auth";
import { TextSelectionMenu } from "./TextSelectionMenu";

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
    
    const isImageUrl = (url: string) => {
        return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target as HTMLInputElement | HTMLSelectElement;
        
        setUpdateData(prev => ({
            ...prev,
            [name]: name === 'folderId' 
                ? (value ? parseInt(value) : null)
                : value,
            ...(name === 'textTranslation' ? { isImage: isImageUrl(value) } : {})
        }));
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            
            if (e.key === 'Enter') {
                onUpdate();
            } else if (e.key === 'Escape') {
                onClose();
            }
        };
    
        window.addEventListener('keydown', handleKeyDown);
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onUpdate, onClose]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t.folders.change}>
            <div className="modal-body" ref={modalRef}>
                {isOpen && <TextSelectionMenu targetRef={modalRef} onInputChange={handleInputChange} />}
                
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
                    <label>{t.folders.textTranslation}</label>
                    <input
                        type="text"
                        name="textTranslation"
                        value={updateData.textTranslation}
                        onChange={(e) => setUpdateData({
                            ...updateData,
                            textTranslation: e.target.value,
                            isImage: isImageUrl(e.target.value)
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
                        onClick={onUpdate}
                    >
                        {t.folders.change}
                    </button>
                </div>
            </div>
        </Modal>
    );
};