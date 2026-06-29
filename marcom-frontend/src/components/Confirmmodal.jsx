import React from 'react';
import { AlertCircle} from 'lucide-react';
import '../style/ConfirmModal.css';

const ConfirmModal = ({ 
    title = 'Konfirmasi', 
    message, 
    onConfirm, 
    onCancel,
    confirmText = 'Hapus',
    cancelText = 'Batal',
    type = 'warning'
}) => {
    return (
        <div className="confirm-overlay" onClick={onCancel}>
            <div className="confirm-modal" onClick={e => e.stopPropagation()}>

                <div className={`confirm-icon confirm-${type}`}>
                    <AlertCircle size={32} />
                </div>

                <h2 className="confirm-title">{title}</h2>
                <p className="confirm-message">{message}</p>

                <div className="confirm-actions">
                    <button 
                        className="confirm-btn cancel-btn" 
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>
                    <button 
                        className={`confirm-btn action-btn confirm-${type}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;