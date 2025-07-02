'use client';
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./index.module.css";

export default function Sidebar({ onPageChange, paginaAtiva }) {
  const { usuario, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const menuItems = [
    { id: 'mapas', icon: 'fa-map-location-dot', label: 'Mapas' },
    { id: 'exercicios', icon: 'fa-file-pen', label: 'Exercícios' },
    { id: 'listas', icon: 'fa-list-ul', label: 'Listas' },
    { id: 'relatorios', icon: 'fa-chart-simple', label: 'Relatórios' },
  ];

  const handleLogout = () => {
    if (confirm('Deseja realmente sair?')) {
      logout();
    }
  };

  return (
    <nav className={styles.sidebar}>
      <div>
        <Image src="/logo.png" alt="Edutech Logo" width={40} height={40} />
      </div>
      <div className={styles.navButtons}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={paginaAtiva === item.id ? styles.active : ''}
            onClick={() => onPageChange && onPageChange(item.id)}
            title={item.label}
          >
            <i className={`fa-solid ${item.icon}`}></i>
          </button>
        ))}
        <div className={styles.userSection}>
          <button
            className={styles.user}
            onClick={() => setShowUserMenu(!showUserMenu)}
            title={usuario ? `${usuario.nome} (${usuario.tipo})` : 'Usuário'}
          >
            <i className="fa-solid fa-user"></i>
          </button>
          {showUserMenu && (
            <div className={styles.userMenu}>
              <div className={styles.userInfo}>
                <strong>{usuario?.nome || 'Usuário'}</strong>
                <span>{usuario?.email}</span>
                <small>{usuario?.tipo}</small>
              </div>
              <button
                className={styles.logoutButton}
                onClick={handleLogout}
              >
                <i className="fa-solid fa-sign-out-alt"></i>
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}