import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('Missing Authorization header')
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // 1. Verificar se quem chama é GESTOR (Admin)
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      console.error('Erro ao obter usuário (getUser):', userError)
      return new Response(
        JSON.stringify({ error: 'Não autenticado', details: userError }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: requesterProfile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || requesterProfile?.role !== 'GESTOR') {
      return new Response(
        JSON.stringify({ error: 'Acesso negado. Apenas GESTORES podem criar usuários.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    console.log('Dados recebidos (admin-create-user):', body)

    const { email, password, full_name, role, document, phone, access_profile_id, force_password_change, active, company_id } = body

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email e senha são obrigatórios.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Cliente Admin para operações privilegiadas
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. Validação de Segurança: Verificar se perfil já existe (evitar duplicidade)
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existingProfile) {
      return new Response(
        JSON.stringify({ error: 'Já existe um perfil cadastrado com este e-mail.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Criar Usuário no Auth
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      phone: phone || undefined,
      user_metadata: {
        full_name,
        role,
        document,
        company_id: company_id || null,  // Incluído no JWT para RLS
      }
    })

    if (createError) throw createError

    // 5. Garantir criação do perfil com todos os dados
    if (newUser.user) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: newUser.user.id,
          email,
          full_name,
          role,
          document,
          phone,
          access_profile_id: access_profile_id || null,
          force_password_change: force_password_change || false,
          active: active !== undefined ? active : true,
          company_id: company_id || null,
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        console.error('Erro ao criar profile:', profileError)
        // Não abortamos, pois o user já foi criado, mas logamos
      }
    }

    return new Response(
      JSON.stringify(newUser),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Erro na função admin-create-user:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno no servidor' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
