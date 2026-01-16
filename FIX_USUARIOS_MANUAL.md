# Como Corrigir Usuários Criados Manualmente

## 🔴 Problema

Você inseriu usuários manualmente via SQL no `auth.users` e `profiles`, causando:
- ❌ Erro: "Database error querying schema"
- ❌ Login falha com erro 500
- ❌ Senhas não funcionam

## ✅ Solução: Deletar e Recriar Corretamente

### Passo 1: Limpar Usuários Incorretos

No **Supabase SQL Editor**, execute:

```sql
-- Deletar perfis criados manualmente
DELETE FROM public.profiles 
WHERE email LIKE '%rolim.com.br%' 
  OR email LIKE '%@checkship%';

-- Deletar usuários do Auth
-- (Precisa ser feito via Dashboard ou API Admin)
```

### Passo 2: Criar Usuários Corretamente

Escolha **UMA** das 3 opções abaixo:

---

## Opção 1: Via Supabase Dashboard (MAIS FÁCIL) ⭐

1. **Acesse Supabase Dashboard**
   - https://app.supabase.com
   - Selecione projeto CheckShip

2. **Vá em Authentication → Users**

3. **Clique "Add User" → "Create new user"**

4. **Preencha os dados:**
   ```
   Email: adeilson.santos@rolim.com.br
   Password: senha123 (ou qualquer senha)
   ✅ Auto Confirm User (IMPORTANTE!)
   ```

5. **Após criar, copie o UUID do usuário**

6. **Vá em Table Editor → profiles**

7. **Edite o perfil recém-criado:**
   ```
   id: (já preenchido automaticamente)
   email: adeilson.santos@rolim.com.br
   full_name: Adeilson Santos
   role: MOTORISTA (ou GESTOR para admin)
   document: CPF dele
   phone: Telefone dele
   active: true
   ```

8. **Repita para cada usuário**

---

## Opção 2: Via Edge Function (RECOMENDADO PARA MUITOS USUÁRIOS)

### Na plataforma **Admin Web**:

1. Login como **admin@checkship.com**
2. Vá em **"Usuários"**
3. Clique **"Novo Usuário"**
4. Preencha:
   - Nome Completo
   - E-mail
   - Senha
   - Perfil (GESTOR, MOTORISTA, OPERADOR)
   - CPF
   - Telefone
5. Clique **"Salvar"**

A Edge Function `admin-create-user` vai:
- ✅ Criar o usuário no `auth.users` corretamente
- ✅ Hashear a senha
- ✅ Confirmar o email automaticamente
- ✅ Criar o perfil sincronizado

---

## Opção 3: Via SQL (Função Administrativa)

Use a função **`auth.admin.create_user()`** no SQL Editor:

```sql
-- Criar usuário via função administrativa
SELECT auth.admin.create_user(
  email => 'adeilson.santos@rolim.com.br',
  password => 'senha123',
  email_confirmed => true,
  user_metadata => jsonb_build_object(
    'full_name', 'Adeilson Santos',
    'role', 'MOTORISTA'
  )
);
```

**⚠️ Nota:** Esta função pode não estar disponível em todos os projetos Supabase.

---

## 📋 Lista de Usuários para Criar

Com base na sua necessidade, crie:

### Admin/Gestor
```
Email: admin@checkship.com
Senha: (escolha uma senha forte)
Nome: Admin CheckShip
Perfil: GESTOR
```

### Motorista Exemplo
```
Email: adeilson.santos@rolim.com.br
Senha: Adeilson@2026
Nome: Adeilson Santos
Perfil: MOTORISTA
CPF: xxx.xxx.xxx-xx
Telefone: (xx) xxxxx-xxxx
```

### Operador Exemplo
```
Email: abmael.silva@rolim.com.br
Senha: Abmael@2026
Nome: Abmael Silva
Perfil: OPERADOR
```

---

## ✅ Verificação

Depois de criar os usuários corretamente:

1. **Teste Login na Plataforma Web:**
   - https://checkship-admin.vercel.app
   - Use email e senha definidos

2. **Teste Login no Mobile:**
   - https://checkship-mobile.vercel.app
   - Use email e senha de motorista/operador

3. **Verifique as Tabelas:**
   ```sql
   -- Verificar auth.users
   SELECT id, email, email_confirmed_at, created_at 
   FROM auth.users;
   
   -- Verificar profiles
   SELECT id, email, full_name, role, active 
   FROM public.profiles;
   ```

4. **UUIDs devem estar sincronizados:**
   - O `id` em `profiles` deve ser igual ao `id` em `auth.users`

---

## 🚨 Notas Importantes

- ✅ **SEMPRE** use `Auto Confirm User` ao criar no Dashboard
- ✅ **SEMPRE** defina `active = true` no perfil
- ✅ **NUNCA** insira manualmente em `auth.users`
- ✅ Senhas devem ter pelo menos 6 caracteres
- ✅ O `id` em profiles é gerado automaticamente pelo trigger

---

## 🔧 Troubleshooting

### Erro: "Email not confirmed"
→ Marque "Auto Confirm User" ao criar

### Erro: "Invalid login credentials"
→ Confirme que a senha está correta
→ Tente resetar a senha no Dashboard

### Erro: "User not found in profiles"
→ Verifique se o trigger `handle_new_user` está ativo
→ Execute no SQL Editor:
```sql
-- Verificar se trigger existe
SELECT * FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
```

### Perfil não aparece na tabela
→ Crie manualmente via Table Editor usando o UUID do auth.users
