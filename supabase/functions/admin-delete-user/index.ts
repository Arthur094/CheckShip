import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    console.log('admin-delete-user: Request received', req.method)

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Ler body PRIMEIRO (antes de qualquer outra operação)
        const body = await req.json()
        console.log('admin-delete-user: Body parsed', JSON.stringify(body))

        const { user_id } = body

        if (!user_id) {
            console.log('admin-delete-user: user_id missing')
            return new Response(
                JSON.stringify({ error: 'user_id é obrigatório' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            console.log('admin-delete-user: No auth header')
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

        // 1. Verificar quem está chamando
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        console.log('admin-delete-user: getUser result', user?.id, userError?.message)

        if (userError || !user) {
            return new Response(
                JSON.stringify({ error: 'Não autenticado', details: userError?.message }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 2. Cliente Admin para operações privilegiadas
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 3. Verificar se quem chama é GESTOR (usando admin para evitar RLS)
        const { data: requesterProfile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        console.log('admin-delete-user: Profile check', requesterProfile?.role, profileError?.message)

        if (profileError || requesterProfile?.role !== 'GESTOR') {
            return new Response(
                JSON.stringify({ error: 'Acesso negado. Apenas GESTORES podem excluir usuários.' }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 4. Excluir Usuário no Auth
        console.log('admin-delete-user: Deleting user', user_id)
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user_id)

        if (deleteError) {
            console.log('admin-delete-user: Delete error', deleteError.message)

            // Se usuário não existe no Auth, tenta deletar apenas o profile
            if (deleteError.message === 'User not found') {
                console.log('admin-delete-user: User not in Auth, deleting profile directly')
                const { error: profileDeleteError } = await supabaseAdmin
                    .from('profiles')
                    .delete()
                    .eq('id', user_id)

                if (profileDeleteError) {
                    console.log('admin-delete-user: Profile delete error', profileDeleteError.message)
                    throw profileDeleteError
                }

                console.log('admin-delete-user: Profile deleted successfully')
                return new Response(
                    JSON.stringify({ message: 'Perfil excluído com sucesso (usuário já não existia no Auth)' }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            throw deleteError
        }

        console.log('admin-delete-user: User deleted successfully')
        return new Response(
            JSON.stringify({ message: 'Usuário excluído com sucesso' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        console.error('admin-delete-user: Error', error.message)
        return new Response(
            JSON.stringify({ error: error.message || 'Erro interno' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})

