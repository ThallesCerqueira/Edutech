'use client';
import styles from "./page.module.css";
import Sidebar from "@/app/components/Sidebar";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import ModalSelecaoTurma from "@/app/components/ModalSelecaoTurma";
import {
  ExerciciosPage,
  MapasPage,
  ListasPage,
  ListasExerciciosPage,
  RelatoriosPage,
  TurmaPage,
  PerfilPage
} from "@/app/components/Tabs";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";

export default function Page() {
  const [paginaAtiva, setPaginaAtiva] = useState('listas-exercicios');
  const { usuario, turmaSelecionada, selecionarTurma, isAuthenticated } = useAuth();
  const [showModalTurma, setShowModalTurma] = useState(false);

  useEffect(() => {
    // Verificar se precisa mostrar o modal de seleção de turma
    if (isAuthenticated() && usuario && usuario.tipo !== 'admin' && !turmaSelecionada) {
      setShowModalTurma(true);
    }
  }, [usuario, turmaSelecionada, isAuthenticated]);

  useEffect(() => {
    // Redirecionar para página apropriada baseada no tipo de usuário
    if (usuario) {
      const paginasPermitidas = {
        'admin': ['mapas', 'listas-exercicios', 'turma', 'relatorios', 'perfil'],
        'professor': ['mapas', 'listas-exercicios', 'turma', 'relatorios', 'perfil'],
        'aluno': ['listas-exercicios', 'turma', 'perfil']
      };

      const paginasDoUsuario = paginasPermitidas[usuario.tipo] || ['listas-exercicios'];

      if (!paginasDoUsuario.includes(paginaAtiva)) {
        setPaginaAtiva(paginasDoUsuario[0]);
      }
    }
  }, [usuario, paginaAtiva]);

  const handleTurmaSelected = (turma) => {
    selecionarTurma(turma);
    setShowModalTurma(false);
  };

  const handleTrocarTurma = () => {
    setShowModalTurma(true);
  };

  const renderizarPagina = () => {
    switch (paginaAtiva) {
      case 'mapas':
        return <MapasPage />;
      case 'exercicios':
        return <ExerciciosPage />;
      case 'listas':
        return <ListasPage />;
      case 'listas-exercicios':
        return <ListasExerciciosPage />;
      case 'turma':
        return <TurmaPage />;
      case 'relatorios':
        return <RelatoriosPage />;
      case 'perfil':
        return <PerfilPage />;
      default:
        return <ListasExerciciosPage />;
    }
  };

  return (
    <ProtectedRoute>
      <div className={styles.container}>
        <Sidebar
          onPageChange={setPaginaAtiva}
          paginaAtiva={paginaAtiva}
          onTrocarTurma={handleTrocarTurma}
        />
        <main>
          {renderizarPagina()}
        </main>
      </div>

      <ModalSelecaoTurma
        isOpen={showModalTurma}
        onTurmaSelected={handleTurmaSelected}
      />
    </ProtectedRoute>
  );
}
