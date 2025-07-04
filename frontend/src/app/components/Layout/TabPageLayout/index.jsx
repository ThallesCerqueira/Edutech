'use client';
import styles from './index.module.css';

export default function TabPageLayout({
    children,
    title,
    subtitle,
    icon,
    className = '',
    headerActions = null,
    showContainer = true,
    fullHeight = false
}) {
    return (
        <div className={`${styles.tabPageWrapper} ${fullHeight ? styles.fullHeight : ''} ${className}`}>
            {showContainer ? (
                <div className={styles.container}>
                    {(title || headerActions) && (
                        <header className={styles.header}>
                            <div className={styles.titleSection}>
                                {icon && (
                                    <div className={styles.iconWrapper}>
                                        <i className={`fa-solid ${icon}`} aria-hidden="true"></i>
                                    </div>
                                )}
                                <div className={styles.titleContent}>
                                    {title && <h1 className={styles.title}>{title}</h1>}
                                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                                </div>
                            </div>
                            {headerActions && (
                                <div className={styles.headerActions}>
                                    {headerActions}
                                </div>
                            )}
                        </header>
                    )}

                    <main className={styles.content}>
                        {children}
                    </main>
                </div>
            ) : (
                <>
                    {(title || headerActions) && (
                        <header className={styles.header}>
                            <div className={styles.titleSection}>
                                {icon && (
                                    <div className={styles.iconWrapper}>
                                        <i className={`fa-solid ${icon}`} aria-hidden="true"></i>
                                    </div>
                                )}
                                <div className={styles.titleContent}>
                                    {title && <h1 className={styles.title}>{title}</h1>}
                                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                                </div>
                            </div>
                            {headerActions && (
                                <div className={styles.headerActions}>
                                    {headerActions}
                                </div>
                            )}
                        </header>
                    )}

                    <main className={styles.contentNoContainer}>
                        {children}
                    </main>
                </>
            )}
        </div>
    );
}
