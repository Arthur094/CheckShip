interface CacheData {
    vehicles: any[];
    templates: any[];
    completedInspections: any[];
    userProfile: any;
    lastSync: string;
}

const CACHE_KEYS = {
    VEHICLES: 'checkship_my_vehicles',
    TEMPLATES: 'checkship_my_templates',
    TEMPLATE_ASSIGNMENTS: 'checkship_template_assignments',
    COMPLETED: 'checkship_completed_inspections',
    PROFILE: 'checkship_user_profile',
    USER_ID: 'checkship_user_id', // NOVO
    LAST_SYNC: 'checkship_last_sync'
};

const CACHE_EXPIRY_HOURS = 24;

export const cacheService = {
    // Download all essential data on login
    async downloadAllData(userId: string, supabase: any): Promise<void> {
        console.log('📥 Downloading data for offline use...');

        try {
            // Parallel download for speed
            const [vehicles, templateAssignments, templates, completed, profile] = await Promise.all([
                // 1. My vehicles
                supabase
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
                    .eq('profile_id', userId)
                    .eq('active', true)
                    .then((res: any) => res.data?.map((item: any) => item.vehicles) || []),

                // 2. Template assignments (vehicle-template mapping)
                (async () => {
                    const { data: assignments } = await supabase
                        .from('vehicle_assignments')
                        .select('vehicle_id')
                        .eq('profile_id', userId)
                        .eq('active', true);

                    if (!assignments || assignments.length === 0) return [];

                    const vehicleIds = assignments.map((a: any) => a.vehicle_id);

                    const { data: templateAssignments } = await supabase
                        .from('vehicle_checklist_assignments')
                        .select('vehicle_id, checklist_template_id')
                        .in('vehicle_id', vehicleIds);

                    return templateAssignments || [];
                })(),

                // 3. All templates
                (async () => {
                    const { data: assignments } = await supabase
                        .from('vehicle_assignments')
                        .select('vehicle_id')
                        .eq('profile_id', userId)
                        .eq('active', true);

                    if (!assignments || assignments.length === 0) return [];

                    const vehicleIds = assignments.map((a: any) => a.vehicle_id);

                    const { data: templateAssignments } = await supabase
                        .from('vehicle_checklist_assignments')
                        .select(`
                            checklist_template_id,
                            checklist_templates (*)
                        `)
                        .in('vehicle_id', vehicleIds);

                    if (!templateAssignments) return [];

                    // Remove duplicates
                    const uniqueTemplates = Array.from(
                        new Map(
                            templateAssignments
                                .map((item: any) => item.checklist_templates)
                                .filter((t: any) => t != null)
                                .map((t: any) => [t.id, t])
                        ).values()
                    );

                    return uniqueTemplates;
                })(),

                // 4. Completed inspections (last 30)
                supabase
                    .from('checklist_inspections')
                    .select(`
            id,
            status,
            completed_at,
            vehicles ( plate, model ),
            template:checklist_templates!checklist_template_id ( name )
          `)
                    .eq('inspector_id', userId)
                    .eq('status', 'completed')
                    .order('completed_at', { ascending: false })
                    .limit(30)
                    .then((res: any) => res.data || []),

                // 5. User profile
                supabase
                    .from('profiles')
                    .select('full_name, role, email')
                    .eq('id', userId)
                    .single()
                    .then((res: any) => res.data || {})
            ]);

            // Save to cache
            localStorage.setItem(CACHE_KEYS.VEHICLES, JSON.stringify(vehicles));
            localStorage.setItem(CACHE_KEYS.TEMPLATE_ASSIGNMENTS, JSON.stringify(templateAssignments));
            localStorage.setItem(CACHE_KEYS.TEMPLATES, JSON.stringify(templates));
            localStorage.setItem(CACHE_KEYS.COMPLETED, JSON.stringify(completed));
            localStorage.setItem(CACHE_KEYS.PROFILE, JSON.stringify(profile));
            localStorage.setItem(CACHE_KEYS.USER_ID, userId); // NOVO
            localStorage.setItem(CACHE_KEYS.LAST_SYNC, new Date().toISOString());

            console.log('✅ Cache atualizado:', {
                vehicles: vehicles.length,
                templateAssignments: templateAssignments.length,
                templates: templates.length,
                completed: completed.length
            });
        } catch (error) {
            console.error('❌ Erro ao baixar dados:', error);
            throw error;
        }
    },

    // Get cached vehicles
    getVehicles(): any[] {
        try {
            const data = localStorage.getItem(CACHE_KEYS.VEHICLES);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Erro ao ler cache de veículos:', error);
            return [];
        }
    },

    // Get cached templates
    getTemplates(): any[] {
        try {
            const data = localStorage.getItem(CACHE_KEYS.TEMPLATES);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Erro ao ler cache de templates:', error);
            return [];
        }
    },

    // Get cached template assignments (vehicle-template mapping)
    getTemplateAssignments(): any[] {
        try {
            const data = localStorage.getItem(CACHE_KEYS.TEMPLATE_ASSIGNMENTS);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Erro ao ler cache de assignments:', error);
            return [];
        }
    },

    // Get single template by ID from cache
    getTemplateById(templateId: string): any | null {
        try {
            const templates = this.getTemplates();
            return templates.find((t: any) => t.id === templateId) || null;
        } catch (error) {
            console.error('Erro ao buscar template por ID:', error);
            return null;
        }
    },

    // Get cached completed inspections
    getCompletedInspections(): any[] {
        try {
            const data = localStorage.getItem(CACHE_KEYS.COMPLETED);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Erro ao ler cache de concluídos:', error);
            return [];
        }
    },

    // Get cached user profile
    getUserProfile(): any {
        try {
            const data = localStorage.getItem(CACHE_KEYS.PROFILE);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erro ao ler cache de perfil:', error);
            return null;
        }
    },

    // Get cached user ID
    getUserId(): string | null {
        return localStorage.getItem(CACHE_KEYS.USER_ID);
    },

    // Get last sync timestamp
    getLastSync(): string | null {
        return localStorage.getItem(CACHE_KEYS.LAST_SYNC);
    },

    // Check if cache is fresh (< 24 hours old)
    isCacheFresh(): boolean {
        const lastSync = this.getLastSync();
        if (!lastSync) return false;

        const lastSyncDate = new Date(lastSync);
        const now = new Date();
        const hoursDiff = (now.getTime() - lastSyncDate.getTime()) / (1000 * 60 * 60);

        return hoursDiff < CACHE_EXPIRY_HOURS;
    },

    // Update specific cache entry
    updateVehicles(vehicles: any[]): void {
        localStorage.setItem(CACHE_KEYS.VEHICLES, JSON.stringify(vehicles));
        localStorage.setItem(CACHE_KEYS.LAST_SYNC, new Date().toISOString());
    },

    updateTemplates(templates: any[]): void {
        localStorage.setItem(CACHE_KEYS.TEMPLATES, JSON.stringify(templates));
        localStorage.setItem(CACHE_KEYS.LAST_SYNC, new Date().toISOString());
    },

    updateCompletedInspections(inspections: any[]): void {
        localStorage.setItem(CACHE_KEYS.COMPLETED, JSON.stringify(inspections));
        localStorage.setItem(CACHE_KEYS.LAST_SYNC, new Date().toISOString());
    },

    // Clear all cache (on logout)
    clearCache(): void {
        Object.values(CACHE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        console.log('🗑️ Cache limpo');
    },

    // Check if we have any cached data
    hasCachedData(): boolean {
        return this.getVehicles().length > 0 || this.getTemplates().length > 0;
    }
};
