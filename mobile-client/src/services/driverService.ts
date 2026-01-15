import { supabase } from '../lib/supabase';

export const driverService = {
    // 1. Busca veículos do motorista
    async getMyVehicles(profileId: string) {
        const { data, error } = await supabase
            .from('vehicle_assignments')
            .select(`
        active,
        vehicles (
          id,
          plate,
          model,
          brand,
          status,
          current_km
        )
      `)
            .eq('profile_id', profileId)
            .eq('active', true);

        if (error) throw error;
        return data.map((item: any) => item.vehicles);
    },

    async getVehicleDetail(vehicleId: string) {
        const { data, error } = await supabase
            .from('vehicles')
            .select('id, plate, model, brand')
            .eq('id', vehicleId)
            .single();

        if (error) throw error;
        return data;
    },

    // 2. Busca templates do veículo (A FUNÇÃO QUE ESTAVA FALTANDO)
    async getAvailableTemplates(vehicleId: string) {
        const { data, error } = await supabase
            .from('vehicle_checklist_assignments')
            .select(`
        checklist_template_id,
        checklist_templates (
          id,
          name,
          description,
          structure
        )
      `)
            .eq('vehicle_id', vehicleId);

        if (error) throw error;
        return data.map((item: any) => item.checklist_templates);
    },

    // 3. Busca detalhes do template
    async getTemplateDetail(templateId: string) {
        const { data, error } = await supabase
            .from('checklist_templates')
            .select('*')
            .eq('id', templateId)
            .single();

        if (error) throw error;
        return data;
    },

    // 4. Busca inspeções para o Dashboard
    async getRecentInspections(profileId: string) {
        const { data, error } = await supabase
            .from('checklist_inspections')
            .select(`
        id,
        status,
        started_at,
        vehicles ( plate, model )
      `)
            .eq('inspector_id', profileId)
            .order('started_at', { ascending: false })
            .limit(10);

        if (error) throw error;
        return data;
    },

    // 5. Salva a inspeção (Vamos usar na próxima tela)
    async submitInspection(payload: any) {
        const { data, error } = await supabase
            .from('checklist_inspections')
            .insert([payload])
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};