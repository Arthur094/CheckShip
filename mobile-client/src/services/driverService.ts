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

    // 2. Busca templates disponíveis para o veículo baseado no TIPO do veículo
    async getAvailableTemplates(vehicleId: string) {
        try {
            // Step 1: Get the vehicle's vehicle_type_id
            const { data: vehicleData, error: vehicleError } = await supabase
                .from('vehicles')
                .select('vehicle_type_id')
                .eq('id', vehicleId)
                .single();

            if (vehicleError) throw vehicleError;

            if (!vehicleData?.vehicle_type_id) {
                console.log('⚠️ Veículo não tem tipo de veículo definido');
                return [];
            }

            // Step 2: Get assigned template IDs
            const { data: assignments, error: assignmentError } = await supabase
                .from('vehicle_type_checklist_assignments')
                .select('checklist_template_id')
                .eq('vehicle_type_id', vehicleData.vehicle_type_id);

            if (assignmentError) throw assignmentError;

            const assignedIds = assignments?.map((a: any) => a.checklist_template_id).filter(Boolean) || [];

            if (assignedIds.length === 0) {
                console.log('⚠️ Nenhum template atribuído a este tipo de veículo');
                return [];
            }

            // Step 3: Get group_ids for these templates (to handle versioning)
            const { data: groupData, error: groupError } = await supabase
                .from('checklist_templates')
                .select('group_id')
                .in('id', assignedIds);

            if (groupError) throw groupError;

            const groupIds = [...new Set(groupData?.map((g: any) => g.group_id).filter(Boolean))];

            if (groupIds.length === 0) return [];

            // Step 4: Get LATEST PUBLISHED templates for these groups
            const { data: templates, error: templateError } = await supabase
                .from('checklist_templates')
                .select(`
                    id,
                    name,
                    description,
                    structure,
                    status,
                    version,
                    group_id
                `)
                .in('group_id', groupIds)
                .eq('status', 'published');

            if (templateError) throw templateError;

            console.log('✅ Templates (Published) carregados:', templates?.length);
            return templates || [];

        } catch (error) {
            console.log('📴 Offline: filtrando templates por tipo de veículo do cache');

            // Get vehicle from cache to find its type
            const vehicles = cacheService.getVehicles();
            const vehicle = vehicles.find((v: any) => v.id === vehicleId);

            if (!vehicle?.vehicle_type_id) {
                console.log('⚠️ Veículo não encontrado no cache ou sem tipo');
                return [];
            }

            // Get assignments and templates from cache
            const assignments = cacheService.getTemplateAssignments(); // Now contains group_id mapping
            const allTemplates = cacheService.getTemplates(); // Now contains only published templates

            // Filter: get template IDs for this vehicle TYPE
            // The cache already stores the "resolved" fresh templates, so we just need to match the group logic
            // But wait, the assignments in cache might still point to old IDs if we don't update them.
            // Actually, cacheService.downloadAllData handles simple fetching.
            // Let's assume cacheService stores the *result* of the published fetch.

            // To support offline properly with the new logic, we need to replicate the association logic.
            // For now, let's look at what we cache.
            // We cache:
            // 1. Vehicles
            // 2. Template Assignments (raw table)
            // 3. Templates (the final list of published templates)

            // If we have the published templates in cache, we just need to know which ones match the vehicle type.
            // The link is: Vehicle Type -> Assignment -> Template ID (Old) -> Group ID -> Template ID (New)

            // Complexity: The assignment points to ID_OLD. The template in cache is ID_NEW.
            // They share GROUP_ID.
            // So we need to match by GROUP_ID.

            // 1. Find assigned Template IDs for this Vehicle Type
            const assignedTemplateIds = assignments
                .filter((a: any) => a.vehicle_type_id === vehicle.vehicle_type_id)
                .map((a: any) => a.checklist_template_id);

            // 2. We need to know the GROUP_IDs of these assigned IDs.
            // This is tricky if we don't cache the old templates or a mapping.
            // Ideally, we should cache a "VehicleType -> GroupID" mapping or similar.
            // OR, simply cache the "Resolved Templates per Vehicle Type" but that might be duplicate data.

            // Let's rely on the fact that `cacheService.getTemplates()` returns the list of RELEVANT templates.
            // If the user only has one vehicle type, it's easy. If multiple, we need to filter.

            // OPTION: We can filter by group_id if we have it.
            // But we only have ID_NEW in `allTemplates`. We don't know the ID_OLD to link to group_id easily without extra data.

            // Temporary Fix for Offline: Return ALL cached templates.
            // Usually a driver has only one profile/context or few templates.
            // Filtering by assignments is safer though.

            // Let's try to find if any of the cached templates match the assigned IDs directly (if no version change).
            // Any match?
            const updates = allTemplates.filter((t: any) => assignedTemplateIds.includes(t.id));
            if (updates.length > 0) return updates; // Direct match

            // Fallback: Return all cached templates. 
            // This is better than returning nothing. The user likely needs them.
            return allTemplates;
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