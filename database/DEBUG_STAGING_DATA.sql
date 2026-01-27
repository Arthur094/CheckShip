
-- =====================================================
-- DEBUG DE DADOS DO USUÁRIO (STAGING)
-- Execute este script no SQL Editor
-- Substitua 'seu-email@exemplo.com' pelo seu email de login
-- =====================================================

SELECT 
    id,
    email,
    role,         -- Tem que ser exatamente 'GESTOR'
    company_id,   -- Não pode ser NULL
    created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;
