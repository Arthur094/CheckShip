# Pontos Pendentes - CheckShip

## 🔴 Críticos (Requerem Atenção Imediata)

### 1. ~~RLS da Tabela `profiles` Desativado~~ ✅ RESOLVIDO
**Situação:** ~~O Row Level Security da tabela `profiles` estava desativado em produção.~~ **Corrigido!**

**Solução Aplicada:**
- Armazenado `company_id` no `user_metadata` do JWT durante o cadastro
- Atualizada função `get_user_company_id()` para ler do JWT
- Criadas novas policies RLS que leem do JWT (sem recursão)
- RLS reativado em produção
- Script: `database/SCRIPT_FIX_PROFILES_RLS.sql`

---

### 2. ~~Service Role Key Exposta em Scripts~~ ✅ RESOLVIDO
**Situação:** ~~Os scripts em `/scripts/*.js` contêm a `SUPABASE_SERVICE_ROLE_KEY` hardcoded.~~ **Corrigido!**

**Solução Aplicada:**
- Criado arquivo `scripts/.env` com as credenciais (ignorado pelo git)
- Criado arquivo `scripts/.env.example` como template
- Criado módulo `scripts/config.js` centralizado que lê do `.env`
- Todos os 17 scripts atualizados para usar o módulo

---

## 🟡 Importantes (Melhorias Recomendadas)

### 3. Ambiente Local Aponta para Produção
**Situação:** O arquivo `.env.local` da raiz contém as credenciais de **produção**.

**Risco:** Desenvolver localmente pode afetar dados reais.

**Solução Proposta:**
- Criar `.env.development` com credenciais de staging
- Criar `.env.production` com credenciais de produção
- Ajustar o Vite para ler o arquivo correto por ambiente

---

### 4. Chunk de Build Muito Grande
**Situação:** O build gera um arquivo JS de ~1.7MB, acima do recomendado (500KB).

**Impacto:** Carregamento mais lento para usuários.

**Solução Proposta:**
- Implementar code-splitting com `React.lazy()` e `Suspense`
- Separar bibliotecas grandes (Recharts) em chunks separados

---

### 5. Mobile Client com Credenciais Separadas
**Situação:** O `mobile-client/.env.local` pode estar desatualizado ou apontando para o ambiente errado.

**Ação:** Verificar se está usando staging ou produção e se as credenciais estão corretas.

---

## 🟢 Opcionais (Boas Práticas)

### 6. Automatizar Deploy de Edge Functions
**Situação:** O deploy de Edge Functions é manual via CLI.

**Solução Proposta:**
- Configurar GitHub Actions para deploy automático quando houver mudanças em `supabase/functions/`

---

### 7. Testes Automatizados
**Situação:** Não há testes automatizados configurados.

**Solução Proposta:**
- Adicionar Vitest ou Jest para testes unitários
- Configurar testes de integração básicos

---

### 8. Monitoramento e Logs
**Situação:** Não há sistema de monitoramento de erros em produção.

**Solução Proposta:**
- Integrar Sentry ou LogRocket para capturar erros
- Configurar alertas para falhas críticas

---

## 📊 Priorização Sugerida

| # | Item | Esforço | Impacto | Prioridade |
|---|------|---------|---------|------------|
| 1 | RLS profiles | Alto | Crítico | 🔴 1º |
| 2 | Service Key exposta | Médio | Crítico | 🔴 2º |
| 3 | Ambiente local | Baixo | Médio | 🟡 3º |
| 4 | Chunk grande | Médio | Baixo | 🟢 4º |
| 5 | Mobile env | Baixo | Baixo | 🟢 5º |
