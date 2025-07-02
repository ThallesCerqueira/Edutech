'use client';
import styles from "./page.module.css";
import Sidebar from "@/app/components/Sidebar";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import {
  ExerciciosPage,
  MapasPage,
  ListasPage,
  RelatoriosPage
} from "@/app/components/Pages";
import { useState } from "react";

export default function Page() {
  const [paginaAtiva, setPaginaAtiva] = useState('exercicios');

  const renderizarPagina = () => {
    switch (paginaAtiva) {
      case 'mapas':
        return <MapasPage />;
      case 'exercicios':
        return <ExerciciosPage />;
      case 'listas':
        return <ListasPage />;
      case 'relatorios':
        return <RelatoriosPage />;
      default:
        return <ExerciciosPage />;
    }
  };

  return (
    <ProtectedRoute>
      <div className={styles.container}>
        <Sidebar onPageChange={setPaginaAtiva} paginaAtiva={paginaAtiva} />
        <main>
          {renderizarPagina()}
        </main>
      </div>
    </ProtectedRoute>
  );
}
