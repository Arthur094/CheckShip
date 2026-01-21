# Guia de Fluxo de Trabalho - CheckShip

## 🎯 Visão Geral dos Ambientes

| Ambiente | Branch | URL Frontend | Projeto Supabase |
|----------|--------|--------------|------------------|
| **Desenvolvimento** | `develop` | `localhost:3000` | Staging (`pfaoasasnepcrdahmudu`) |
| **Staging** | `develop` | `staging.checkship.com.br` | Staging (`pfaoasasnepcrdahmudu`) |
| **Produção** | `main` | `transportadorarolim.checkship.com.br` | Produção (`thztbankqpgtgiknzkaw`) |

---

## 📋 Fluxo Completo (Passo a Passo)

### 1️⃣ Abrir o Ambiente de Desenvolvimento Local

```powershell
# Navegue até a pasta do projeto
cd c:\Projetinhos\CheckShip

# Garanta que está na branch develop
git checkout develop

# Inicie o servidor local
npm run dev
```

🌐 Acesse: **http://localhost:3000**

> **Importante:** O localhost usa as credenciais do arquivo `.env.local`. Se quiser testar com staging, edite o arquivo para apontar para o projeto de staging.

---

### 2️⃣ Fazer Modificações no Código

1. **Edite os arquivos** na pasta `src/` usando o VS Code
2. O navegador atualiza automaticamente (hot reload)
3. Teste sua alteração no navegador local

---

### 3️⃣ Salvar as Modificações (Commit)

```powershell
# Verifique o que foi alterado
git status

# Adicione todos os arquivos modificados
git add .

# Faça o commit com uma mensagem descritiva
git commit -m "feat: descrição do que você fez"
```

**Dicas para mensagens de commit:**
- `feat:` → Nova funcionalidade
- `fix:` → Correção de bug
- `refactor:` → Reorganização de código
- `docs:` → Alteração em documentação

---

### 4️⃣ Enviar para Staging (Testar Online)

```powershell
# Envie suas alterações para o GitHub (branch develop)
git push origin develop
```

🚀 A Vercel detecta o push e faz o deploy automático em **staging.checkship.com.br**

⏱️ Aguarde ~1-2 minutos e acesse o staging para testar.

---

### 5️⃣ Testar no Staging

1. Acesse: **https://staging.checkship.com.br**
2. Faça login com usuário de teste (ex: `arthur.staging@checkship.com`)
3. Teste **todas as funcionalidades** que você alterou
4. Verifique se não quebrou nada existente

---

### 6️⃣ Promover para Produção

⚠️ **Só faça isso se o staging estiver funcionando perfeitamente!**

```powershell
# Mude para a branch main
git checkout main

# Atualize a main local
git pull origin main

# Traga as alterações do develop para a main
git merge develop

# Envie para o GitHub (dispara deploy em produção)
git push origin main

# Volte para a develop (para continuar trabalhando)
git checkout develop
```

🚀 A Vercel faz o deploy em **transportadorarolim.checkship.com.br**

---

## 🔧 Alterações no Banco de Dados

### Fluxo para Mudanças de Schema (Tabelas, Colunas, etc.)

1. **Crie o script SQL** na pasta `/database`
2. **Teste no Staging primeiro:**
   - Acesse: https://supabase.com/dashboard/project/pfaoasasnepcrdahmudu/sql
   - Cole e execute o script
3. **Se funcionar, aplique em Produção:**
   - Acesse: https://supabase.com/dashboard/project/thztbankqpgtgiknzkaw/sql
   - Cole e execute o mesmo script

---

## 🔌 Deploy de Edge Functions

Se você modificar arquivos em `supabase/functions/`:

```powershell
# Defina o token (válido por ~1 hora)
$env:SUPABASE_ACCESS_TOKEN="seu_token_aqui"

# Deploy para STAGING
npx supabase functions deploy NOME_DA_FUNCAO --project-ref pfaoasasnepcrdahmudu --no-verify-jwt

# Deploy para PRODUÇÃO (só após testar no staging!)
npx supabase functions deploy NOME_DA_FUNCAO --project-ref thztbankqpgtgiknzkaw --no-verify-jwt
```

---

## 🛠️ Scripts de Automação

Os scripts em `/scripts` são usados para importar dados em massa (usuários, veículos, templates).

### Configuração Inicial (primeira vez)

```powershell
# Navegue até a pasta scripts
cd scripts

# Copie o arquivo de exemplo de credenciais
copy .env.example .env

# Edite o arquivo .env com suas credenciais reais
# SUPABASE_URL=https://...
# SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Executar Scripts

```powershell
# Navegue até a pasta scripts
cd scripts

# Execute o script desejado
node import-users.js
node import-vehicles.js
node assign-vehicles.js
```

### Scripts Disponíveis

| Script | Função |
|--------|--------|
| `import-users.js` | Importa usuários do CSV `data/usuarios.csv` |
| `import-vehicles.js` | Importa veículos do CSV `data/veiculos.csv` |
| `assign-vehicles.js` | Atribui veículos a motoristas via `data/atribuicoes-veiculos.csv` |
| `import-template-*.js` | Importa templates de checklist específicos |
| `sync-users.js` | Sincroniza lista de usuários (deleta e cria) |

> ⚠️ **Atenção:** As credenciais ficam em `scripts/.env` que é ignorado pelo Git. Nunca commite esse arquivo!

---

## 📱 Build do App Mobile

```powershell
# Navegue para a pasta do mobile
cd mobile-client

# Instale dependências (se necessário)
npm install

# Gere o build Android
npm run build:android

# Abra no Android Studio
npm run open:android
```

---

## ⚠️ Checklist de Segurança (Antes de ir para Produção)

- [ ] Testei todas as funcionalidades alteradas no staging
- [ ] Não há erros no console do navegador
- [ ] Os dados estão sendo salvos corretamente
- [ ] Fiz login com diferentes tipos de usuário (GESTOR, MOTORISTA)
- [ ] Verifiquei se não quebrei nenhuma funcionalidade existente

---

## 🆘 Comandos de Emergência

### Reverter último commit (antes de dar push)
```powershell
git reset --soft HEAD~1
```

### Reverter alterações não commitadas
```powershell
git checkout -- .
```

### Ver histórico de commits
```powershell
git log --oneline -10
```

---

## 📊 Resumo Visual do Fluxo

```
┌─────────────┐    git push     ┌─────────────┐    git merge    ┌─────────────┐
│   LOCAL     │ ─────────────▶  │   STAGING   │ ─────────────▶  │  PRODUÇÃO   │
│ localhost   │    develop      │ staging...  │    main         │ transport...│
└─────────────┘                 └─────────────┘                 └─────────────┘
      │                               │                               │
      ▼                               ▼                               ▼
  Desenvolve                      Testa                          Usuários
   e testa                       online                           reais
```
