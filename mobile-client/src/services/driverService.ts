import { supabase } from '../lib/supabase';

export const driverService = {
    // Busca veículos vinculados ao motorista logado
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

    // Busca inspeções recentes do motorista para o Dashboard
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

    // Busca templates disponíveis para o veículo selecionado
    async getAvailableTemplates(vehicleId: string) {
        const { data, error } = await supabase
            .from('vehicle_checklist_assignments')
            .select(`
        checklist_template_id,
        checklist_templates (
          id,
          name,
          description
        )
      `)
            .eq('vehicle_id', vehicleId);

        if (error) throw error;

        // Retorna os dados dos templates simplificados
        return data.map((item: any) => item.checklist_templates);
    }
};