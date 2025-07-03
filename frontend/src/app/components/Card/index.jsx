'use client';
import Image from 'next/image';
import styles from './index.module.css';

/**
 * Card universal que funciona para qualquer tipo de item em diferentes layouts
 * @param {Object} item - Item a ser exibido (exercicio, lista, mapa, etc.)
 * @param {Function} onVer - Callback para visualizar item
 * @param {Function} onEditar - Callback para editar item
 * @param {Function} onExcluir - Callback para excluir item
 * @param {string} titleKey - Chave do campo título no objeto (padrão: 'titulo')
 * @param {string} type - Tipo do item para labels específicos ('exercicio', 'lista', 'mapa', 'item')
 * @param {string} layout - Layout do card ('list' ou 'visual') (padrão: 'list')
 * @param {string} imageKey - Chave do campo da imagem (padrão: 'caminho')
 * @param {string} defaultImage - Imagem padrão quando não há imagem
 */
export default function Card({
    item,
    onVer,
    onEditar,
    onExcluir,
    titleKey = 'titulo',
    type = 'item',
    layout = 'list', // 'list' ou 'visual'
    imageKey = 'caminho',
    defaultImage = '/mapaA.jpeg'
}) {
    const getTitle = () => {
        return item[titleKey] || item.titulo || item.nome || 'Sem título';
    };

    const getActionLabels = () => {
        switch (type) {
            case 'exercicio':
                return {
                    edit: 'Editar exercício',
                    delete: 'Excluir exercício'
                };
            case 'lista':
                return {
                    edit: 'Editar lista',
                    delete: 'Excluir lista'
                };
            case 'mapa':
                return {
                    edit: 'Editar mapa',
                    delete: 'Excluir mapa'
                };
            default:
                return {
                    edit: 'Editar item',
                    delete: 'Excluir item'
                };
        }
    };

    const getImageSrc = () => {
        const imagePath = item[imageKey];
        if (!imagePath) {
            return defaultImage;
        }

        // Se é base64, usar direto
        if (imagePath.startsWith('data:')) {
            return imagePath;
        }

        // Se é um caminho de arquivo, assumir que está em public
        if (imagePath.includes('.')) {
            return `/${imagePath}`;
        }

        // Fallback para imagem padrão
        return defaultImage;
    };

    const labels = getActionLabels();

    if (layout === 'visual') {
        // Layout visual (para mapas)
        return (
            <div className={styles.visualCard}>
                <div className={styles.imageContainer}>
                    <Image
                        src={getImageSrc()}
                        alt={getTitle()}
                        width={300}
                        height={250}
                        className={styles.cardImage}
                        onClick={() => onVer && onVer(item.id || item)}
                    />

                    <div className={styles.titleOverlay}>
                        <h3 className={styles.cardTitle}>{getTitle()}</h3>
                    </div>

                    <div className={styles.visualActions}>
                        {onEditar && (
                            <button
                                className={styles.editButton}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditar(item.id || item);
                                }}
                                title={labels.edit}
                            >
                                <i className="fa-solid fa-pen"></i>
                            </button>
                        )}
                        {onExcluir && (
                            <button
                                className={styles.deleteButton}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onExcluir(item.id || item);
                                }}
                                title={labels.delete}
                            >
                                <i className="fa-solid fa-trash"></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Layout de lista (padrão)
    return (
        <li className={styles.listItem}>
            <button
                className={styles.showButton}
                onClick={() => onVer && onVer(item.id || item)}
            >
                {getTitle()}
            </button>
            <div className={styles.listActions}>
                {onEditar && (
                    <button
                        className={styles.editAction}
                        onClick={() => onEditar(item.id || item)}
                        title={labels.edit}
                    >
                        <i className="fa-solid fa-pen" style={{ color: '#222' }}></i>
                    </button>
                )}
                {onExcluir && (
                    <button
                        className={styles.deleteAction}
                        onClick={() => onExcluir(item.id || item)}
                        title={labels.delete}
                    >
                        <i className="fa-solid fa-trash-can" style={{ color: '#222' }}></i>
                    </button>
                )}
            </div>
        </li>
    );
}
