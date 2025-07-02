'use client';
import styles from './SearchBar.module.css';

export default function SearchBar({
    searchTerm,
    onSearchChange,
    onNew,
    placeholder = "Buscar...",
    buttonText = "Novo",
    buttonIcon = "fa-plus",
    showSearch = true
}) {
    return (
        <div className={styles.searchContainer}>
            {showSearch && (
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm || ''}
                    onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                />
            )}
            <button
                className={styles.novoButton}
                onClick={onNew}
            >
                <i className={`fa-solid ${buttonIcon}`}></i>
                {buttonText}
            </button>
        </div>
    );
}
