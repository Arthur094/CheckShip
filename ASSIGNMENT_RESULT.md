# ✅ Atribuição de Veículos - Resultado Parcial

## 📊 Resultado

**Total:** 27 atribuições tentadas
- ✅ **Sucesso:** 6 veículos (22%)
- ❌ **Erro:** 21 (78%)

---

## ✅ Veículos Atribuídos com Sucesso

| Placa | Motorista | Email |
|-------|-----------|-------|
| SNI5E89 | José Wilson da Silva | jose.silva@rolim.com.br |
| SNJ9G38 | Reginaldo Batista dos Santos | reginaldo.santos@rolim.com.br |
| PTY0B49 | Reginaldo Batista dos Santos | reginaldo.santos@rolim.com.br |
| PTT0E23 | José Wilson da Silva | jose.silva@rolim.com.br |
| ROF0B59 | Francisco das Chagas Carneiro Lobo | francisco.lobo@rolim.com.br |
| ROV6J52 | Juarez Almeida da Silva | juarez.silva@rolim.com.br |

---

## ❌ Erros Encontrados

### Categoria 1: Placas Divergentes (12 erros)

Placas na planilha **diferentes** das cadastradas no banco:

| Planilha | Provável no Banco | Status |
|----------|-------------------|--------|
| SNI4F95  | SNJ4F95 | ❓ Verificar |
| SMN7B29  | SMT7B29 | ❓ Verificar |
| ROW8A29  | ROW3A29 | ❓ Verificar |
| SMQ1F73  | SMO1F73 | ❓ Verificar |
| OXR0717  | OXR8A27/OXR8A85 | ❓ Verificar |
| PRV8A85  | ? | ❓ Verificar |
| OJB4648  | ? | ❓ Verificar |
| ROJ9D44  | ROJ0J44 | ❓ Verificar |
| PSY3076  | PSY3D76 | ❓ Verificar |
| ROY6H96  | ROY5J60/ROY0J96/ROY6H96 | ❓ Verificar |
| PSE6415  | ? | ❓ Verificar |
| RON2J58  | RON0J58 | ❓ Verificar |
| ROJ9D56  | ROJ0D56 | ❓ Verificar |

### Categoria 2: Emails Não Cadastrados (9 erros)

Emails na planilha **não existem** no banco `profiles`:

| Email (Planilha) | Provável Email Correto |
|-----------------|------------------------|
| manoel.neto@rolim.com.br | manoel.souza@rolim.com.br ❓ |
| luis.carlos@rolim.com.br | luis.teixeira@rolim.com.br ou luis.silva@rolim.com.br ❓ |
| mario.filho@rolim.com.br | ? ❓ |
| gustavo.cardoso@rolim.com.br | gustavo.santos@rolim.com.br ❓ |
| antonio.dutra@rolim.com.br | antonio.bezerra@rolim.com.br ou antonio.filho@rolim.com.br ❓ |
| edson.costa@rolim.com.br | edson.oliveira@rolim.com.br ❓ |
| maklawd.silva@rolim.com.br | marilano.silva@rolim.com.br ❓ |
| ronilson.gomes@rolim.com.br | ronilson.silva@rolim.com.br ❓ |
| jose.gadeia@rolim.com.br | ? ❓ |

---

## 🔍 Queries para Investigação

### 1. Procurar Placas Similares

```sql
-- Procurar placas que começam com SN
SELECT plate FROM vehicles WHERE plate LIKE 'SN%' ORDER BY plate;

-- Procurar placas que começam com RO
SELECT plate FROM vehicles WHERE plate LIKE 'RO%' ORDER BY plate;

-- Procurar placa específica
SELECT plate FROM vehicles WHERE plate LIKE '%J9D56%';
```

### 2. Procurar Emails Similares

```sql
-- Procurar por nome "Manoel"
SELECT email, full_name FROM profiles 
WHERE full_name ILIKE '%manoel%' 
ORDER BY email;

-- Procurar por nome "Luis"
SELECT email, full_name FROM profiles 
WHERE full_name ILIKE '%luis%' 
ORDER BY email;

-- Procurar por nome "Mario"
SELECT email, full_name FROM profiles 
WHERE full_name ILIKE '%mario%' 
ORDER BY email;
```

### 3. Ver Todos os Emails Cadastrados

```sql
-- Listar todos motoristas
SELECT email, full_name FROM profiles 
WHERE role = 'MOTORISTA' 
ORDER BY full_name;
```

---

## ✅ Soluções Possíveis

### Solução 1: Corrigir Planilha Original (RECOMENDADO)

1. **Verificar a planilha original** para confirmar as placas corretas
2. **Corrigir o CSV** `atribuicoes-veiculos.csv` com placas e emails corretos
3. **Executar novamente:** `node assign-vehicles.js`

### Solução 2: Atribuição Manual via SQL

Execute atribuições manualmente para os casos problemáticos:

```sql
-- Exemplo: Atribuir veículo SNJ4F95 a joneide.azevedo
INSERT INTO vehicle_assignments (vehicle_id, profile_id, assigned_at)
SELECT v.id, p.id, NOW()
FROM vehicles v, profiles p
WHERE v.plate = 'SNJ4F95'  -- Placa correta do banco
  AND p.email = 'joneide.alves@rolim.com.br';  -- Email correto

-- Verificar se funcionou
SELECT v.plate, p.full_name, p.email
FROM vehicle_assignments va
JOIN vehicles v ON v.id = va.vehicle_id
JOIN profiles p ON p.id = va.profile_id
ORDER BY v.plate;
```

### Solução 3: Criar CSV Corrigido Automaticamente

Posso criar um script que:
1. Busca as placas mais similares no banco
2. Busca os emails mais similares
3. Gera um CSV corrigido para você revisar

---

## 📋 Próximos Passos

**O que você prefere fazer?**

1. ✅ Me enviar a **planilha original** para eu criar o CSV correto (MAIS RÁPIDO)
2. 🔍 Executar as **queries SQL** acima e me enviar os resultados para eu corrigir manualmente
3. 🤖 Eu criar um **script inteligente** que tenta adivinhar as correspondências corretas

**Enquanto isso, os 6 veículos já atribuídos estão funcionando! Você pode testá-los no app mobile.**
