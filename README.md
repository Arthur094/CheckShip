# 🚛 CheckShip - Gestão Inteligente de Frotas

![Project Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-orange)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Supabase%20%7C%20TypeScript-blue)
![License](https://img.shields.io/badge/License-Private-red)

> **Otimize operações, garanta a segurança e digitalize vistorias de frotas com flexibilidade total.**

## 📖 Sobre o Projeto

O **CheckShip** é uma plataforma SaaS Enterprise para gerenciamento de frotas e vistorias veiculares. Diferente de sistemas rígidos, o CheckShip utiliza uma arquitetura baseada em **estruturas dinâmicas (JSONB)**, permitindo que gestores criem checklists personalizados para qualquer tipo de veículo (caminhões, utilitários, máquinas pesadas) sem necessidade de alteração no código.

O sistema é projetado para operar em **duas frentes**:
1. **Painel Web (Admin):** Para gestão, configuração de templates, cadastro de veículos e análise de dados.
2. **App Mobile (Flutter - Em breve):** Para motoristas realizarem as vistorias em campo, mesmo offline.

---

## 🚀 Funcionalidades Principais

### ⚙️ Configuração de Checklists (Core)
- **Criação Dinâmica:** Interface "Drag & Drop" para criar áreas, subáreas e itens de vistoria.
- **Flexibilidade de Resposta:** Suporte para itens do tipo Conforme/Não Conforme, Texto, Foto Obrigatória, etc.
- **Versionamento:** Edição inteligente de templates existentes (`Upsert`).

### 🚚 Gestão de Frotas
- Cadastro completo de veículos.
- Vinculação de veículos a tipos específicos (Carreta, Cavalo Mecânico, Van).
- Histórico de vistorias por veículo.

### 👥 Controle de Acesso e Usuários
- Gestão de Motoristas e Gestores.
- Perfis de acesso granulares (RLS - Row Level Security).

---

## 🛠️ Tech Stack

### Frontend (Web)
- **Core:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/) (Tipagem estrita para segurança de dados)
- **Estilização:** TailwindCSS (para UI rápida e responsiva)
- **State Management:** React Hooks + Context API

### Backend (BaaS)
- **Plataforma:** [Supabase](https://supabase.com/)
- **Banco de Dados:** PostgreSQL
- **Segurança:** RLS (Row Level Security) para proteção de dados por tenant/usuário.
- **Storage:** Supabase Storage para fotos e evidências.

---

## 🏗️ Estrutura do Banco de Dados (Destaque)

O projeto utiliza uma abordagem híbrida Relacional + NoSQL dentro do PostgreSQL.
A tabela `checklist_templates` armazena a estrutura da vistoria em uma coluna `JSONB`:

```json
// Exemplo simplificado da estrutura armazenada
{
  "areas": [
    {
      "name": "Cabine",
      "items": [
        { "id": "uuid", "text": "Cinto de Segurança", "type": "conformity" }
      ]
    }
  ]
}