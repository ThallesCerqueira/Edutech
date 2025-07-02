'use client';
import styles from './index.module.css';
import ItemCard from '../ItemCard';

export default function ItemList({
    items = [],
    onVer,
    onEditar,
    onExcluir,
    type = 'item',
    emptyMessage = 'Nenhum item encontrado.',
    emptySubMessage = 'Crie seu primeiro item!',
    emptyIcon = 'fa-solid fa-list'
}) {
    if (items.length === 0) {
        return (
            <div className={styles.emptyState}>
                <i className={emptyIcon} style={{ fontSize: '4rem', color: '#ccc', marginBottom: '1rem' }}></i>
                <p>{emptyMessage}</p>
                <p>{emptySubMessage}</p>
            </div>
        );
    }

    return (
        <ul className={styles.list}>
            {items.map((item) => (
                <ItemCard
                    key={item.id}
                    item={item}
                    onVer={onVer}
                    onEditar={onEditar}
                    onExcluir={onExcluir}
                    type={type}
                />
            ))}
        </ul>
    );
}
