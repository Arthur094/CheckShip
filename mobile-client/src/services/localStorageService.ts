export interface PendingInspection {
    id: string;
    checklist_template_id: string;
    vehicle_id: string;
    inspector_id: string;
    responses: any;
    status: string;
    started_at: string;
    completed_at: string;
    created_at: string;
    updated_at: string;
    pending: true;
    // Metadata para exibição
    vehiclePlate?: string;
    templateName?: string;
}

const STORAGE_KEY = 'checkship_pending_inspections';

export const localStorageService = {
    // Salvar inspeção pendente
    savePendingInspection(inspection: Omit<PendingInspection, 'id' | 'pending'>): string {
        const pending: PendingInspection = {
            ...inspection,
            id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            pending: true
        };

        const existing = this.getAllPending();
        existing.push(pending);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

        console.log('✅ Inspeção salva localmente:', pending.id);
        return pending.id;
    },

    // Buscar todas as inspeções pendentes
    getAllPending(): PendingInspection[] {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Erro ao buscar inspeções pendentes:', error);
            return [];
        }
    },

    // Buscar por ID
    getPendingById(id: string): PendingInspection | null {
        const all = this.getAllPending();
        return all.find(i => i.id === id) || null;
    },

    // Remover inspeção pendente (após sincronizar)
    removePending(id: string): boolean {
        try {
            const existing = this.getAllPending();
            const filtered = existing.filter(i => i.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
            console.log('🗑️ Inspeção removida do offline:', id);
            return true;
        } catch (error) {
            console.error('Erro ao remover inspeção pendente:', error);
            return false;
        }
    },

    // Limpar todas as pendentes (usar com cuidado!)
    clearAllPending(): void {
        localStorage.removeItem(STORAGE_KEY);
        console.log('🗑️ Todas as inspeções offline foram removidas');
    },

    // Contar pendentes
    getPendingCount(): number {
        return this.getAllPending().length;
    }
};
