# Importação em Massa de Usuários - CheckShip

## 🔍 Diagnóstico do Problema

Você criou um usuário pela plataforma e ele apareceu em `profiles` mas NÃO em `auth.users`.

**Possíveis causas:**
1. Edge Function `admin-create-user` falhou silenciosamente
2. Service Role Key não está configurada
3. Erro de permissão no Supabase Auth Admin API

## ✅ Solução Rápida: Script de Importação em Massa

### Passo 1: Criar CSV com os Usuários

Crie um arquivo `usuarios.csv` na raiz do projeto:

```csv
email,password,full_name,role,document,phone
adeilson.santos@rolim.com.br,Senha123,Adeilson Santos,MOTORISTA,123.456.789-01,(11) 98765-4321
abmael.silva@rolim.com.br,Senha123,Abmael Silva,MOTORISTA,987.654.321-09,(11) 91234-5678
joao.souza@rolim.com.br,Senha123,João Souza,OPERADOR,111.222.333-44,(11) 99999-8888
```

**Formato:**
- `email`: Email do usuário (obrigatório, único)
- `password`: Senha temporária (pode ser igual para todos)
- `full_name`: Nome completo
- `role`: GESTOR, MOTORISTA ou OPERADOR
- `document`: CPF (com ou sem formatação)
- `phone`: Telefone (opcional)

---

### Passo 2: Instalar Dependências

```bash
npm install csv-parser
```

---

### Passo 3: Criar Script de Importação

Crie o arquivo `import-users.js` na raiz do projeto:

```javascript
const fs = require('fs');
const csv = require('csv-parser');
const https = require('https');

// ⚠️ CONFIGURE AQUI
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'sua-service-role-key-aqui';

// Lista para armazenar usuários do CSV
const users = [];

// Ler CSV
fs.createReadStream('usuarios.csv')
  .pipe(csv())
  .on('data', (row) => {
    users.push(row);
  })
  .on('end', async () => {
    console.log(`📋 ${users.length} usuários encontrados no CSV`);
    console.log('🚀 Iniciando importação...\n');

    let success = 0;
    let errors = 0;

    for (const user of users) {
      try {
        await createUser(user);
        success++;
        console.log(`✅ ${user.email} criado com sucesso (${success}/${users.length})`);
      } catch (error) {
        errors++;
        console.error(`❌ ${user.email} falhou:`, error.message);
      }
      
      // Delay para não sobrecarregar a API
      await sleep(500);
    }

    console.log('\n✅ Importação concluída!');
    console.log(`   Sucesso: ${success}`);
    console.log(`   Erros: ${errors}`);
  });

// Função para criar usuário via Supabase Admin API
async function createUser(user) {
  const { email, password, full_name, role, document, phone } = user;

  const payload = {
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name,
      role: role || 'MOTORISTA'
    }
  };

  const options = {
    hostname: SUPABASE_URL.replace('https://', ''),
    path: '/auth/v1/admin/users',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', async () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const authUser = JSON.parse(data);
          
          // Criar perfil manualmente (caso trigger não funcione)
          await createProfile(authUser.id, email, full_name, role, document, phone);
          resolve(authUser);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(payload));
    req.end();
  });
}

// Função para criar perfil
async function createProfile(userId, email, full_name, role, document, phone) {
  const payload = {
    id: userId,
    email,
    full_name,
    role: role || 'MOTORISTA',
    document: document || null,
    phone: phone || null,
    active: true
  };

  const options = {
    hostname: SUPABASE_URL.replace('https://', ''),
    path: '/rest/v1/profiles',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Prefer': 'return=minimal'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        resolve();
      } else {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          console.warn(`⚠️  Perfil não criado automaticamente para ${email}`);
          resolve(); // Não falha se perfil já existir
        });
      }
    });

    req.on('error', reject);
    req.write(JSON.stringify(payload));
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

### Passo 4: Configurar Variáveis

1. **Obter Service Role Key:**
   - Supabase Dashboard → Settings → API
   - Copie a **service_role key** (⚠️ NUNCA exponha publicamente!)

2. **Editar `import-users.js`:**
   ```javascript
   const SUPABASE_URL = 'https://xxxxxx.supabase.co';
   const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbG...'; // Service role key
   ```

---

### Passo 5: Executar Importação

```bash
node import-users.js
```

**Resultado esperado:**
```
📋 86 usuários encontrados no CSV
🚀 Iniciando importação...

✅ adeilson.santos@rolim.com.br criado com sucesso (1/86)
✅ abmael.silva@rolim.com.br criado com sucesso (2/86)
✅ joao.souza@rolim.com.br criado com sucesso (3/86)
...

✅ Importação concluída!
   Sucesso: 86
   Erros: 0
```

---

## 🔧 Troubleshooting

### Erro: "User already exists"
→ Usuário já foi criado. Pule ou delete antes.

### Erro: "Invalid API key"
→ Verifique se copiou a **service_role key** correta (não é a anon key!)

### Perfil não aparece automaticamente
→ O script já cria o perfil manualmente como fallback

### Erro de permissão ao criar perfil
→ Verifique políticas RLS da tabela `profiles`
→ Service role key bypassa RLS, então deve funcionar

---

## ⚡ Alternativa: Via Supabase Dashboard (Manual)

Se preferir fazer manualmente pelo Dashboard:

1. **Prepare planilha Excel/Google Sheets** com os dados
2. **Para cada usuário:**
   - Supabase → Authentication → Users → Add User
   - Email: `xxx@rolim.com.br`
   - Password: `SenhaTemporaria123`
   - ✅ Auto Confirm User
   - Click "Create user"
   - **Copie o UUID gerado**
3. **Edite o perfil:**
   - Table Editor → profiles
   - Encontre o perfil com aquele UUID
   - Edite: full_name, role, document, phone
   - ✅ active = true

⚠️ **Isso levará MUITO tempo para 86 usuários!**

---

## 📊 Verificação Pós-Importação

```sql
-- Verificar quantos usuários foram criados
SELECT COUNT(*) FROM auth.users;
SELECT COUNT(*) FROM public.profiles;

-- Listar todos os usuários
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.full_name,
  p.role,
  p.active
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- Verificar se há usuários sem perfil
SELECT u.id, u.email 
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;
```

---

## 🎯 Próximos Passos

1. Prepare o CSV com os 86 usuários
2. Configure o script com suas credenciais
3. Execute: `node import-users.js`
4. Aguarde ~45 segundos (500ms por usuário)
5. Verifique no Supabase se todos foram criados
6. Teste login com alguns usuários

💡 **Dica:** Defina uma senha padrão temporária (ex: `CheckShip@2026`) e peça para os usuários trocarem no primeiro acesso.
