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

        // 1. Verify requester is GESTOR
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
                JSON.stringify({ error: 'Acesso negado. Apenas GESTORES podem atualizar usuários.' }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const { user_id, password, email, app_metadata, user_metadata } = await req.json()

        if (!user_id) throw new Error('User ID is required')

        // 2. Admin Client
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 3. Update Auth User
        const updateData: any = {}
        if (password) updateData.password = password
        if (email) updateData.email = email
        if (app_metadata) updateData.app_metadata = app_metadata
        if (user_metadata) updateData.user_metadata = user_metadata

        console.log('Atualizando usuário:', user_id, 'campos:', Object.keys(updateData))

        const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user_id,
            updateData
        )

        if (updateError) throw updateError

        return new Response(
            JSON.stringify(updatedUser),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        console.error('Erro na função admin-update-user:', error)
        return new Response(
            JSON.stringify({ error: error.message || 'Erro interno no servidor' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
