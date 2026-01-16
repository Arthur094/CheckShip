# ❌ Erro na Atribuição de Veículos

## 🔴 Problemas Encontrados

### 1. Erro de Schema (CRÍTICO)
```
"Could not find the 'user_id' column of 'vehicle_assignments' 
in the schema cache"
```

**Causa:** A tabela `vehicle_assignments` provavelmente não tem uma coluna chamada `user_id`, ou está usando `driver_id`, `profile_id`, ou outro nome.

**Ação Necessária:** Precisamos verificar o schema real da tabela.

### 2. Placas Não Encontradas

Muitas placas da planilha não foram encontradas no banco:
- **SNI4F95** (planilha) vs **SNJ4F95** (banco) ❌
- **SMN7B29** (planilha) vs **SMT7B29** (banco) ❌
- E outros...

**Causa:** Diferença de letras nas placas entre a planilha e o que foi cadastrado.

### 3. Emails Não Encontrados

Alguns emails da planilha não existem no banco:
- `manoel.neto@rolim.com.br`
- `luis.carlos@rolim.com.br`
- `mario.filho@rolim.com.br`
- E outros...

**Causa:** Os emails na planilha de atribuição são diferentes dos emails cadastrados.

---

## 🔍 Investigação Necessária

### Verificar Schema da Tabela

Execute no **Supabase SQL Editor:**

```sql
-- Ver estrutura da tabela vehicle_assignments
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'vehicle_assignments'
  AND table_schema = 'public'
ORDER BY ordinal_position;
```

**Resultado Esperado:**
```
column_name        | data_type | is_nullable
-------------------|-----------|-----------
id                 | uuid      | NO
vehicle_id        | uuid      | NO
driver_id         | uuid      | NO    <-- Pode ser este nome!
assigned_at       | timestamp | YES
```

### Verificar Placas Cadastradas

```sql
-- Listar todas as placas que começam com SN
SELECT plate FROM vehicles 
WHERE plate LIKE 'SN%' 
ORDER BY plate;

-- Comparar com as placas da planilha
```

### Verificar Emails Cadastrados

```sql
-- Procurar emails similares
SELECT email FROM profiles 
WHERE email LIKE '%manoel%' 
   OR email LIKE '%luis%'
   OR email LIKE '%mario%'
ORDER BY email;
```

---

## ✅ Correções Necessárias

### 1. Corrigir Nome da Coluna no Script

Se a coluna se chama `driver_id` em vez de `user_id`, precisamos atualizar o script `assign-vehicles.js`:

```javascript
// ANTES:
const payload = {
  vehicle_id: vehicleId,
  user_id: userId,  // ❌ Errado
  assigned_at: new Date().toISOString()
};

// DEPOIS:
const payload = {
  vehicle_id: vehicleId,
  driver_id: userId,  // ✅ Correto
  assigned_at: new Date().toISOString()
};
```

### 2. Corrigir Placas no CSV

Preciso que você me confirme qual é o correto:
- A placa na planilha original (SNI4F95)?
- A placa cadastrada no banco (SNJ4F95)?

Ou me envie a planilha original para eu verificar.

### 3. Corrigir Emails no CSV

Precisamos mapear os emails da planilha para os emails reais cadastrados no banco.

---

## 🚀 Próximo Passo

**POR FAVOR, EXECUTE ESTAS QUERIES NO SUPABASE:**

```sql
-- 1. Ver schema da tabela vehicle_assignments
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'vehicle_assignments'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Ver primeiros 5 registros (se houver)
SELECT * FROM vehicle_assignments LIMIT 5;

-- 3. Listar todas as placas cadastradas
SELECT plate FROM vehicles ORDER BY plate;
```

Depois me envie os resultados para eu corrigir o script e tentar novamente!

---

## 📋 Status Atual

- ❌ **0 veículos atribuídos**
- ❌ **27 erros** (100% de falha)
- ⚠️  **Aguardando investigação do schema**
