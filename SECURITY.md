# Auditoria de Segurança - CheckShip

Este documento registra as vulnerabilidades identificadas e o status das remediações após o incidente de segurança em Abril de 2026.

## 1. Vulnerabilidades de Dependências (npm audit)

### html2pdf.js (< 0.14.0)
- **Severidade:** ALTA
- **Tipo:** Cross-Site Scripting (XSS)
- **Risco:** Um atacante pode injetar scripts maliciosos em PDFs gerados pelo sistema. Se o PDF for aberto por um administrador em um contexto inseguro, o script pode roubar cookies de sessão.
- **Status:** Pendente. Requer atualização para `0.14.0`.
- **Impacto da Correção:** Alteração em Breaking Change no método de exportação.

### xlsx (SheetJS - Todas as versões)
- **Severidade:** ALTA
- **Tipo:** Prototype Pollution & ReDoS (Regular Expression Denial of Service)
- **Risco:**
    - **Prototype Pollution:** Pode permitir que um atacante modifique o comportamento global de objetos JavaScript no sistema, levando a bypass de autenticação ou execução de código.
    - **ReDoS:** Planilhas maliciosas podem travar o servidor ou o navegador do usuário ao serem processadas.
- **Status:** Crítico. Não há correção automática via npm.
- **Plano de Ação:** Avaliar migração para `exceljs` ou implementar sanitização rigorosa no upload.

## 2. Guia de Remediação Concluído (Abril 2026)

Este incidente foi mitigado seguindo o protocolo de "Zero Downtime" para infraestrutura.

### Ações Realizadas
- [x] **Supabase:** Rotação de Segredo JWT e revogação das chaves `anon` e `service_role` comprometidas.
- [x] **Vercel:** Ativação de **Vercel Authentication (Standard Protection)** em todas as URLs de Preview.
- [x] **GitHub:** Auditoria de segurança em PATs, OAuth Apps e SSH Keys (Nenhuma anomalia encontrada).
- [x] **Limpeza de Ambiente:** Deleção de variáveis de ambiente órfãs (`scripts/.env`, `.env.staging.backup`) e remoção da `GEMINI_API_KEY` não utilizada.
- [x] **Google Admin:** Auditoria do Client ID suspicious finalizada pelo administrador.

## 3. Recomendações de Manutenção (Próximos Passos)
- [ ] **Reset de Senhas:** Recomenda-se realizar o reset de senhas/sessões dos motoristas em uma janela de manutenção programada.
- [ ] **Separação de Ambientes:** Implementar um projeto separado no Supabase para desenvolvimento local para evitar conexão direta com a Produção.
- [ ] **Correção de Dependências:** Testar a atualização do `html2pdf.js` para `0.14.0`.

## 4. Diretrizes de Segurança para Desenvolvedores
- Nunca prefixar chaves administrativas com `VITE_`.
- Manter o `Vercel Authentication` ativo para todas as Preview Deployments.
- Utilizar obrigatoriamente RLS (Row Level Security) em todas as tabelas do Supabase.
