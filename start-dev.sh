#!/bin/bash

# Script para iniciar o projeto completo
echo "🚀 Iniciando Edutech..."

# Verificar se estamos no diretório correto
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Erro: Execute este script na pasta raiz do projeto (onde estão as pastas backend e frontend)"
    exit 1
fi

# Função para verificar se uma porta está em uso
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Porta em uso
    else
        return 1  # Porta livre
    fi
}

# Verificar dependências do backend
echo "📦 Verificando dependências do backend..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do backend..."
    npm install
fi

# Verificar se a porta 3001 está livre
if check_port 3001; then
    echo "⚠️  A porta 3001 já está em uso. O backend pode já estar rodando."
    read -p "Deseja continuar mesmo assim? (y/n): " continue_backend
    if [ "$continue_backend" != "y" ]; then
        echo "❌ Cancelado pelo usuário."
        exit 1
    fi
fi

# Iniciar backend em background
echo "🔧 Iniciando backend na porta 3001..."
npm run dev &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Esperar um pouco para o backend iniciar
sleep 3

# Verificar dependências do frontend
echo "📦 Verificando dependências do frontend..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do frontend..."
    npm install
fi

# Verificar se a porta 3000 está livre
if check_port 3000; then
    echo "⚠️  A porta 3000 já está em uso. O frontend pode já estar rodando."
    read -p "Deseja continuar mesmo assim? (y/n): " continue_frontend
    if [ "$continue_frontend" != "y" ]; then
        echo "❌ Parando backend e cancelando..."
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
fi

# Iniciar frontend
echo "🎨 Iniciando frontend na porta 3000..."
echo ""
echo "📝 URLs do projeto:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "⚠️  Para parar os serviços, pressione Ctrl+C"
echo ""

# Iniciar frontend (este comando bloqueia)
npm run dev

# Se chegou aqui, o frontend foi interrompido
echo ""
echo "🛑 Parando backend..."
kill $BACKEND_PID 2>/dev/null
echo "✅ Serviços parados."
