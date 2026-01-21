# Pontos Pendentes - CheckShip

## 🔴 Críticos (Requerem Atenção Imediata)

### 1. RLS da Tabela `profiles` Desativado
**Situação:** O Row Level Security da tabela `profiles` foi desativado em produção para contornar erro de recursão infinita.

**Risco:** Qualquer usuário autenticado pode, em teoria, ver todos os perfis do sistema (não apenas da sua empresa).

**Solução Proposta:**
- Refatorar a policy usando `auth.jwt()` para obter o `company_id` diretamente do token JWT (sem consultar a tabela `profiles`)
- Ou armazenar o `company_id` no `user_metadata` durante o cadastro e ler via `auth.jwt()->>'user_metadata'->>'company_id'`

---

### 2. Service Role Key Exposta em Scripts
**Situação:** Os scripts em `/scripts/*.js` contêm a `SUPABASE_SERVICE_ROLE_KEY` hardcoded.

**Risco:** Se o repositório se tornar público ou vazar, a chave dá acesso total ao banco.

**Solução Proposta:**
- Criar arquivo `.env` na pasta `/scripts` com as credenciais
- Modificar os scripts para ler de `process.env`
- Adicionar `/scripts/.env` ao `.gitignore`

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
