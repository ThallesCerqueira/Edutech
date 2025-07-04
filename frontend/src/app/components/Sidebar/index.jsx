'use client';
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./index.module.css";

export default function Sidebar({ onPageChange, paginaAtiva, onTrocarTurma }) {
  const { usuario, turmaSelecionada, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Filtrar itens de menu baseado no tipo de usuário
  const getMenuItems = () => {
    const allItems = [
      { id: 'mapas', icon: 'fa-map-location-dot', label: 'Mapas', allowedUsers: ['admin', 'professor'] },
      { id: 'listas-exercicios', icon: 'fa-list-check', label: 'Listas & Exercícios', allowedUsers: ['admin', 'professor', 'aluno'] },
      { id: 'turma', icon: 'fa-users', label: 'Turma', allowedUsers: ['admin', 'professor', 'aluno'] },
      { id: 'relatorios', icon: 'fa-chart-simple', label: 'Relatórios', allowedUsers: ['admin', 'professor'] },
    ];

    // Se é admin, mostrar todos os itens
    if (usuario?.tipo === 'admin') {
      return allItems;
    }

    // Filtrar baseado no tipo de usuário
    return allItems.filter(item => item.allowedUsers.includes(usuario?.tipo));
  };

  const menuItems = getMenuItems();

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

      {/* Informações da turma selecionada */}
      {usuario?.tipo !== 'admin' && turmaSelecionada && (
        <div className={styles.turmaInfo}>
          <div className={styles.turmaHeader}>
            <i className="fa-solid fa-users"></i>
            <span>{turmaSelecionada.nome}</span>
          </div>
          <button
            className={styles.trocarTurma}
            onClick={onTrocarTurma}
            title="Trocar de turma"
          >
            <i className="fa-solid fa-arrow-right-arrow-left"></i>
          </button>
        </div>
      )}

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
              <div className={styles.userMenuActions}>
                <button
                  className={styles.perfilButton}
                  onClick={() => {
                    setShowUserMenu(false);
                    onPageChange && onPageChange('perfil');
                  }}
                >
                  <i className="fa-solid fa-user-gear"></i>
                  Perfil
                </button>
                <button
                  className={styles.logoutButton}
                  onClick={handleLogout}
                >
                  <i className="fa-solid fa-sign-out-alt"></i>
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}