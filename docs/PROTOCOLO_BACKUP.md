# Protocolo de Backup - CheckShip

## ⚠️ IMPORTANTE
Você está desenvolvendo **DIRETAMENTE EM PRODUÇÃO**. Backups são sua rede de segurança.

---

## 📅 Quando Fazer Backup

### ✅ Obrigatório (Sempre fazer backup)
- [ ] Antes de **ALTER TABLE** (adicionar/remover/modificar colunas)
- [ ] Antes de **DROP TABLE** ou **DROP COLUMN**
- [ ] Antes de **mudanças em RLS policies** (Row Level Security)
- [ ] Antes de **Edge Functions** que manipulam dados diretamente
- [ ] Antes de **funcionalidades complexas** (Versionamento, Filiais, etc.)

### ⚠️ Recomendado (Bom senso)
- [ ] Antes de deploy de **nova feature com + de 3 tabelas envolvidas**
- [ ] Antes de **scripts de migração de dados** (UPDATE em massa, etc.)
- [ ] Toda **sexta-feira** (backup semanal de rotina)

### ❌ NÃO precisa
- Mudanças de UI/CSS
- Lógica de negócio sem alteração de schema
- Mudanças em componentes React

---

## ✅ Backups Automáticos Existentes

### Backups Diários (Supabase)
- ✅ **Já configurado**: Backups automáticos diários à meia-noite (horário da região do projeto)
- ✅ **Retenção**: Últimos backups disponíveis no dashboard
- ✅ **Inclui**: Todas as tabelas, schemas, RLS policies, funções
- ⚠️ **NÃO inclui**: **Arquivos no Storage** (fotos de inspeções)

> [!WARNING]
> **Limitação Crítica**: Os backups automáticos **NÃO incluem objetos do Storage**.
> 
> Isso significa que **fotos anexadas nas inspeções** não estão nos backups automáticos, apenas as referências (URLs) no banco de dados. Se precisar restaurar um backup, as fotos anexadas após o backup serão perdidas.

---

## 🔧 Como Fazer Backup Manual (Quando Necessário)

### Backup Manual do Banco de Dados
**Quando fazer**: Antes de schema changes críticos.

**Como o botão "Create Backup" não está disponível no seu painel:**
1. Confie nos **Backups Diários** (verifique se o último foi gerado com sucesso na aba "Scheduled backups").
2. Para segurança extra imediata, você pode fazer um dump via CLI (se instalado) ou apenas garantir que não houve grandes inserções de dados desde o último backup automático da madrugada.

> [!TIP]
> Em mudanças **aditivas** (criar tabela, adicionar coluna), o risco é baixo. Em mudanças **destrutivas** (drop table, drop column), espere o backup da madrugada seguinte ou use o CLI.

### Backup do Storage (Fotos) - Opcional
⚠️ **Atenção**: Não há backup automático de fotos. Se isso for crítico:

**Opção 1: Via Dashboard** (Manual)
1. Storage → Buckets → (bucket de fotos)
2. Download manual dos arquivos importantes

**Opção 2: Via CLI** (Automático - requer configuração)
```bash
# Requer Supabase CLI instalado
supabase db dump --file dump_producao/backup.sql
# Para Storage, seria necessário script customizado
```

> [!NOTE]
> **Pragmatismo**: Dado o prazo apertado, **aceitar o risco de perda de fotos** é razoável no curto prazo. Fotos podem ser re-anexadas pelos motoristas se necessário. Foco em manter o schema do banco íntegro.

---

## 🔄 Restauração (Rollback)

### Se algo deu errado no código:
1. **Vercel Dashboard** → Deployments
2. Encontre o deploy anterior (que estava funcionando)
3. Clique nos **3 pontinhos** → **Redeploy**
4. ⏱️ Tempo: ~2 minutos

### Se algo deu errado no banco de dados:
1. **Supabase Dashboard** → Database → Backups
2. Encontre o backup **ANTES da mudança problemática**
3. Clique em **Restore**
4. ⚠️ **ATENÇÃO**: Isso vai **sobrescrever** o banco atual
5. Confirme e aguarde 5-10 minutos
6. ⏱️ Tempo: ~5-10 minutos

---

## 📁 Organização de Backups Locais

```
dump_producao/
├── backup_pre_transicao.sql          # Backup antes de migrar de Staging
├── backup_2026-01-26_versionamento.sql  # Exemplo: antes de implementar versionamento
├── backup_2026-02-01_filiais.sql    # Exemplo: antes de implementar multi-tenant
└── backup_semanal_2026-01-31.sql    # Backup de rotina semanal
```

**Convenção de nomenclatura**:
- `backup_YYYY-MM-DD_<feature>.sql` para features específicas
- `backup_semanal_YYYY-MM-DD.sql` para backups de rotina

---

## ✅ Checklist Pré-Deploy (Schema Changes)

Antes de fazer commit + push de mudanças no schema:

- [ ] Criar **backup manual** no Supabase
- [ ] Revisar SQL da migration (se houver)
- [ ] Testar localmente (conectado em prod, mas **SEM executar a migration**)
- [ ] Ter **SQL de rollback** pronto (se aplicável)
- [ ] Deploy em **horário seguro** (evitar horário comercial se possível)
- [ ] Validar em produção imediatamente após deploy

---

## 🚨 Em Caso de Emergência

### Se quebrou TUDO e você não sabe o que fazer:
1. **RESPIRA** 🧘
2. **NÃO FAÇA MAIS NADA** no banco ou código
3. Acesse Supabase Dashboard → Backups
4. Restaure o backup mais recente
5. Acesse Vercel → Redeploy a versão anterior
6. Analise o que deu errado com calma

### Contatos de Suporte
- **Supabase Support**: [support.supabase.com](https://support.supabase.com)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)

---

## 📊 Histórico de Backups Importantes

| Data | Motivo | Arquivo Local | Status |
|------|--------|---------------|--------|
| 2026-01-26 | Transição Staging → Produção | `backup_pre_transicao.sql` | ✅ OK |
| | | | |

**Instruções**: Atualizar esta tabela sempre que fizer um backup importante.
