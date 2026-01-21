-- Ajuste na Função de Gatilho para evitar erros de banco
-- Utiliza ON CONFLICT para não quebrar se o perfil já existir (criado pelo app)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, phone)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Usuário Sem Nome'), -- Garante não nulo
    COALESCE(new.raw_user_meta_data->>'role', 'MOTORISTA'),              -- Garante não nulo
    new.phone -- Pode ser nulo, tabela permite
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    -- Só atualiza se o perfil existente estiver sem dados cruciais
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    role = COALESCE(public.profiles.role, EXCLUDED.role),
    phone = COALESCE(public.profiles.phone, EXCLUDED.phone),
    updated_at = NOW();

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
