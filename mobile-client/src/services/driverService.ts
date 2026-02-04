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
                    group_id,
                    validate_docs,
                    validate_user_docs,
                    validate_vehicle_docs,
                    validate_trailer_docs
                `)
                .in('group_id', groupIds)
                .eq('status', 'published');

            if (templateError) throw templateError;

            console.log('✅ Templates (Published) carregados:', templates?.length);
            return templates || [];

        } catch (error) {
            console.log('📴 Offline ou erro ao buscar templates - usando cache');

            // FALLBACK CACHE: Busca do cache local
            const vehicles = cacheService.getVehicles();
            const vehicle = vehicles.find((v: any) => v.id === vehicleId);

            if (!vehicle?.vehicle_type_id) {
                console.log('⚠️ Veículo não encontrado no cache, retornando todos os templates');
                return cacheService.getTemplates(); // Retorna todos se não encontrar veículo
            }

            const assignments = cacheService.getTemplateAssignments();
            const allTemplates = cacheService.getTemplates();

            // Filtra templates pelo vehicle_type_id
            const relevantAssignments = assignments.filter(
                (a: any) => a.vehicle_type_id === vehicle.vehicle_type_id
            );

            if (relevantAssignments.length === 0) {
                console.log('⚠️ Nenhum assignment encontrado, retornando todos os templates');
                return allTemplates; // Melhor retornar todos que nada
            }

            const assignedTemplateIds = relevantAssignments.map((a: any) => a.checklist_template_id);

            // Tenta match direto por ID
            const matchedTemplates = allTemplates.filter((t: any) => assignedTemplateIds.includes(t.id));

            if (matchedTemplates.length > 0) {
                console.log('✅ Templates encontrados no cache:', matchedTemplates.length);
                return matchedTemplates;
            }

            // Fallback final: retorna todos os templates do cache
            console.log('📦 Retornando todos os templates do cache como fallback');
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
    },

    // 6. Validação de Documentos conforme regras do template
    async checkDocuments(vehicleId: string, template: any) {
        if (!template.validate_docs) return { ok: true };

        try {
            const userId = cacheService.getUserId();
            if (!userId) return { ok: true };

            // Step 1: Get vehicle details (to get trailer_id)
            const { data: vehicle, error: vError } = await supabase
                .from('vehicles')
                .select('id, plate, trailer_id')
                .eq('id', vehicleId)
                .single();

            if (vError) throw vError;

            // Step 2: Fetch all relevant docs
            const entityFilters = [`profile_id.eq.${userId}`, `vehicle_id.eq.${vehicle.id}`];
            if (vehicle.trailer_id) entityFilters.push(`trailer_id.eq.${vehicle.trailer_id}`);

            const { data: docs, error } = await supabase
                .from('management_documents')
                .select('*')
                .or(entityFilters.join(','));

            if (error) throw error;

            const today = new Date();
            const violations: { doc: string; expiry?: string; status: 'VENCIDO' | 'AUSENTE' }[] = [];

            // 1. Check for Expired Documents
            (docs || []).forEach(doc => {
                const expiry = new Date(doc.expiry_date);
                let checkThis = false;
                if (doc.profile_id && template.validate_user_docs) checkThis = true;
                if (doc.vehicle_id && template.validate_vehicle_docs) checkThis = true;
                if (doc.trailer_id && template.validate_trailer_docs) checkThis = true;

                if (checkThis && expiry < today && doc.status !== 'EM_RENOVACAO') {
                    violations.push({ doc: doc.document_type, expiry: doc.expiry_date, status: 'VENCIDO' });
                }
            });

            // 2. Check for Missing Mandatory Documents
            const MANDATORY = {
                profile: template.validate_user_docs ? ['CNH'] : [],
                vehicle: template.validate_vehicle_docs ? ['CRLV', 'CIV'] : [],
                trailer: (vehicle.trailer_id && template.validate_trailer_docs) ? ['CRLV', 'CIV'] : []
            };

            const userDocTypes = (docs || []).filter(d => d.profile_id === userId).map(d => d.document_type);
            const vehicleDocTypes = (docs || []).filter(d => d.vehicle_id === vehicle.id).map(d => d.document_type);
            const trailerDocTypes = vehicle.trailer_id ? (docs || []).filter(d => d.trailer_id === vehicle.trailer_id).map(d => d.document_type) : [];

            MANDATORY.profile.forEach(type => {
                if (!userDocTypes.includes(type)) violations.push({ doc: type, status: 'AUSENTE' });
            });
            MANDATORY.vehicle.forEach(type => {
                if (!vehicleDocTypes.includes(type)) violations.push({ doc: type, status: 'AUSENTE' });
            });
            MANDATORY.trailer.forEach(type => {
                if (!trailerDocTypes.includes(type)) violations.push({ doc: type, status: 'AUSENTE' });
            });

            if (violations.length > 0) {
                return { ok: false, violations };
            }

            return { ok: true };

        } catch (error) {
            console.error('❌ Erro na validação de documentos:', error);
            // Em caso de erro (ex: offline), permitimos prosseguir se não houver cache de documentos.
            return { ok: true };
        }
    }
};