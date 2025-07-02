'use client';
import { useEffect } from 'react';
import baseStyles from '../index.module.css';

export default function ModalBase({
    isOpen,
    onClose,
    title,
    children,
    showCloseButton = true,
    className = '',
    size = 'default' // 'small', 'default', 'large'
}) {
    // Fechar modal com ESC
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.keyCode === 27 && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            // Prevenir scroll do body quando modal está aberto
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const getSizeClass = () => {
        switch (size) {
            case 'small': return baseStyles.modalSmall;
            case 'large': return baseStyles.modalLarge;
            default: return '';
        }
    };

    return (
        <div className={baseStyles.modal} onClick={handleBackdropClick}>
            <div className={`${baseStyles.modalContent} ${getSizeClass()} ${className}`}>
                {showCloseButton && (
                    <button
                        className={baseStyles.closeButton}
                        onClick={onClose}
                        aria-label="Fechar modal"
                    >
                        <i className="fa-solid fa-times"></i>
                    </button>
                )}

                {title && <h2>{title}</h2>}

                <div className={baseStyles.modalBody}>
                    {children}
                </div>
            </div>
        </div>
    );
}
