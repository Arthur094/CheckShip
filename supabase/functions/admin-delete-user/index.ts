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
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        // 1. Verificar se quem chama é GESTOR (Admin)
        const { data: { user } } = await supabaseClient.auth.getUser()
        if (!user) throw new Error('Não autenticado')

        const { data: requesterProfile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profileError || requesterProfile?.role !== 'GESTOR') {
            return new Response(
                JSON.stringify({ error: 'Acesso negado. Apenas GESTORES podem excluir usuários.' }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const { user_id } = await req.json()

        if (!user_id) throw new Error('user_id é obrigatório')

        // 2. Cliente Admin para operações privilegiadas
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 3. Excluir Usuário no Auth (Cascade deletará o perfil devido à FK)
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
            user_id
        )

        if (deleteError) throw deleteError

        return new Response(
            JSON.stringify({ message: 'Usuário excluído com sucesso' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
