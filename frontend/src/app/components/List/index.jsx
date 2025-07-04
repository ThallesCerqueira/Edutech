'use client';
import styles from './index.module.css';
import Card from '../Card';

/**
 * Lista universal que funciona para qualquer tipo de itens
 * @param {Array} items - Array de itens para exibir
 * @param {Function} onVer - Callback para visualizar item
 * @param {Function} onEditar - Callback para editar item
 * @param {Function} onExcluir - Callback para excluir item
 * @param {string} type - Tipo dos itens ('exercicio', 'lista', 'mapa', 'item')
 * @param {string} layout - Layout dos cards ('list' ou 'visual') (padrão: 'list')
 * @param {string} emptyMessage - Mensagem quando lista vazia
 * @param {string} emptySubMessage - Submensagem quando lista vazia
 * @param {string} emptyIcon - Ícone quando lista vazia
 * @param {string} titleKey - Chave do campo título
 * @param {string} imageKey - Chave do campo da imagem
 * @param {string} defaultImage - Imagem padrão
 * @param {boolean} viewOnly - Se true, remove botões de edição/exclusão
 */
export default function List({
    items = [],
    onVer,
    onEditar,
    onExcluir,
    type = 'item',
    layout = 'list', // 'list' ou 'visual'
    emptyMessage = 'Nenhum item encontrado.',
    emptySubMessage = 'Crie seu primeiro item!',
    emptyIcon = 'fa-solid fa-list',
    titleKey = 'titulo',
    imageKey = 'caminho',
    defaultImage = '/mapaA.jpeg',
    viewOnly = false
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

    const containerClass = layout === 'visual' ? styles.visualGrid : styles.listContainer;

    const Container = layout === 'visual' ? 'div' : 'ul';

    return (
        <Container className={containerClass}>
            {items.map((item) => (
                <Card
                    key={item.id}
                    item={item}
                    onVer={onVer}
                    onEditar={viewOnly ? null : onEditar}
                    onExcluir={viewOnly ? null : onExcluir}
                    type={type}
                    layout={layout}
                    titleKey={titleKey}
                    imageKey={imageKey}
                    defaultImage={defaultImage}
                    viewOnly={viewOnly}
                />
            ))}
        </Container>
    );
}
