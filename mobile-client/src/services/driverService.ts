import { supabase } from '../lib/supabase';
import { cacheService } from './cacheService';

export const driverService = {
    // 1. Busca veículos do motorista (com cache fallback)
    async getMyVehicles(profileId: string) {
        try {
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
            const vehicles = data.map((item: any) => item.vehicles);
            cacheService.updateVehicles(vehicles); // Atualiza cache
            return vehicles;
        } catch (error) {
            console.log('📴 Offline: usando cache de veículos');
            return cacheService.getVehicles();
        }
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

    // 2. Busca templates do veículo (com cache fallback)
    async getAvailableTemplates(vehicleId: string) {
        try {
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
            const templates = data.map((item: any) => item.checklist_templates);
            return templates;
        } catch (error) {
            console.log('📴 Offline: filtrando templates por veículo do cache');

            // Get assignments and templates from cache
            const assignments = cacheService.getTemplateAssignments();
            const allTemplates = cacheService.getTemplates();

            // Filter: get template IDs for this vehicle
            const templateIds = assignments
                .filter((a: any) => a.vehicle_id === vehicleId)
                .map((a: any) => a.checklist_template_id);

            // Return only templates for this vehicle
            return allTemplates.filter((t: any) => templateIds.includes(t.id));
        }
    },

    // 3. Busca detalhes do template (com cache fallback)
    async getTemplateDetail(templateId: string) {
        try {
            const { data, error } = await supabase
                .from('checklist_templates')
                .select('*')
                .eq('id', templateId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.log('📴 Offline: usando cache para template detail');
            const template = cacheService.getTemplateById(templateId);
            if (!template) {
                console.error('❌ Template não encontrado no cache:', templateId);
            }
            return template;
        }
    },

    // 4. Busca inspeções INCOMPLETAS para o Dashboard
    async getRecentInspections(profileId: string) {
        const { data, error } = await supabase
            .from('checklist_inspections')
            .select(`
        id,
        status,
        started_at,
        vehicles ( plate, model ),
        template:checklist_templates!checklist_template_id ( name )
      `)
            .eq('inspector_id', profileId)
            .neq('status', 'completed')
            .order('started_at', { ascending: false })
            .limit(10);

        if (error) throw error;
        return data;
    },


    // 4b. Busca inspeções COMPLETAS/SINCRONIZADAS (com cache fallback)
    async getCompletedInspections(profileId: string) {
        try {
            const { data, error } = await supabase
                .from('checklist_inspections')
                .select(`
            id,
            status,
            completed_at,
            vehicles ( plate, model ),
            template:checklist_templates!checklist_template_id ( name )
          `)
                .eq('inspector_id', profileId)
                .eq('status', 'completed')
                .order('completed_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            cacheService.updateCompletedInspections(data); // Atualiza cache
            return data;
        } catch (error) {
            console.log('📴 Offline: usando cache de concluídos');
            return cacheService.getCompletedInspections();
        }
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