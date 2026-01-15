# Instruções: Criar e Logar como Admin

## Passo 1: Criar Usuário no Supabase Auth

1. Acesse o painel do Supabase: https://app.supabase.com
2. Selecione seu projeto CheckShip
3. Vá em **Authentication** → **Users**
4. Clique em **Add user** → **Create new user**
5. Preencha:
   - Email: `admin@checkship.com` (ou qualquer email)
   - Password: `admin123` (ou qualquer senha segura)
   - ✅ Marque **Auto Confirm User**
6. Clique em **Create user**
7. **COPIE o UUID** do usuário criado (vai parecer com: `550e8400-e29b-41d4-a716-446655440000`)

## Passo 2: Criar Perfil GESTOR na Tabela Profiles

1. No Supabase, vá em **Table Editor** → **profiles**
2. Clique em **Insert** → **Insert row**
3. Preencha:
   - `id`: Cole o UUID que você copiou do Auth
   - `email`: `admin@checkship.com` (mesmo email do Auth)
   - `full_name`: `Admin Master`
   - `role`: `GESTOR` (em maiúsculas)
   - `active`: `true`
   - `document`: (deixe vazio ou preencha)
   - `phone`: (deixe vazio ou preencha)
4. Clique em **Save**

## Passo 3: Executar Script RLS Completo

1. No Supabase, vá em **SQL Editor**
2. Abra o arquivo `SCRIPT_COMPLETE_RLS.sql`
3. Copie TODO o conteúdo e cole no editor
4. Clique em **RUN** (ou pressione Ctrl+Enter)
5. Verifique se aparece "Success. No rows returned" (isso é normal)

## Passo 4: Fazer Login na Plataforma Web

1. Abra o navegador em `http://localhost:3000`
2. Você verá a tela de login
3. Entre com:
   - Email: `admin@checkship.com`
   - Senha: `admin123` (ou a senha que você definiu)
4. Clique em **Entrar**

Se tudo estiver correto, você será redirecionado para o Dashboard e terá acesso total a:
- ✅ Usuários
- ✅ Veículos
- ✅ Checklists
- ✅ Inspeções

## Troubleshooting

**Se os usuários ainda não aparecerem:**
- Abra o Console do navegador (F12)
- Vá na aba **Network**
- Recarregue a página de Usuários
- Procure pela requisição à tabela `profiles`
- Veja se há erro 401 ou 403 (permissão negada)
- Se houver, volte e execute o `SCRIPT_COMPLETE_RLS.sql` novamente

**Se o login falhar:**
- Verifique se o email e senha estão corretos
- Certifique-se de que marcou **Auto Confirm User** ao criar
- Verifique no Table Editor se o perfil com o mesmo `id` existe em `profiles`
