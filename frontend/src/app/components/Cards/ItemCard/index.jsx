'use client';
import styles from './index.module.css';

export default function ItemCard({
    item,
    onVer,
    onEditar,
    onExcluir,
    titleKey = 'titulo',
    type = 'item' // 'exercicio', 'lista', 'item'
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
            default:
                return {
                    edit: 'Editar item',
                    delete: 'Excluir item'
                };
        }
    };

    const labels = getActionLabels();

    return (
        <li className={styles.item}>
            <button
                className={styles.mostrar}
                onClick={() => onVer && onVer(item.id || item)}
            >
                {getTitle()}
            </button>
            <div className={styles.botoes}>
                <button
                    className={styles.editar}
                    onClick={() => onEditar && onEditar(item.id || item)}
                    title={labels.edit}
                >
                    <i className="fa-solid fa-pen" style={{ color: '#222' }}></i>
                </button>
                <button
                    className={styles.excluir}
                    onClick={() => onExcluir && onExcluir(item.id || item)}
                    title={labels.delete}
                >
                    <i className="fa-solid fa-trash-can" style={{ color: '#222' }}></i>
                </button>
            </div>
        </li>
    );
}
