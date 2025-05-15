import React, { useEffect } from 'react';
import Modal from '../components/Modal';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    cardName: string;
    t: any;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    cardName, 
    t 
}) => { 
     useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!isOpen) return;
        
        if (e.key === 'Enter') {
            onConfirm();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
}, [isOpen, onConfirm, onClose]);

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

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t.folders.confirmDeleteTitle}>
            <div className="modal-body">
                <p>
                    {t.folders.confirmDeleteMessageCard}
                    <strong> "{cardName}"</strong>?
                </p>
                <div className="modal-footer">
                    <button
                        className="modal-button confirm delete-button"
                        onClick={onConfirm}
                    >
                        {t.folders.delete}
                    </button>
                </div>
            </div>
        </Modal>
    );
};