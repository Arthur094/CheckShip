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
    // Analysis workflow fields
    analysis_status?: string | null;
    analysis_current_step?: number;
    analysis_total_steps?: number | null;
}

export interface DraftInspection {
    id: string;
    key: string; // `${vehicleId}_${templateId}`
    vehicleId: string;
    templateId: string;
    vehiclePlate: string;
    templateName: string;
    responses: Record<string, any>;
    created_at: string;
    updated_at: string;
}


const STORAGE_KEY = 'checkship_pending_inspections';
const DRAFTS_KEY = 'checkship_draft_inspections';

/**
 * Strips Base64 data URLs from a responses object.
 * Replaces imageUrl values starting with 'data:' with '[synced]' to free memory
 * while preserving the answer structure for reference.
 */
export function purgeBase64FromResponses(responses: Record<string, any>): Record<string, any> {
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(responses)) {
        const val = responses[key];
        if (val && typeof val === 'object' && typeof val.imageUrl === 'string' && val.imageUrl.startsWith('data:')) {
            cleaned[key] = { ...val, imageUrl: '[synced]', isOffline: false };
        } else {
            cleaned[key] = val;
        }
    }
    return cleaned;
}

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

    // Remover inspeção pendente e limpar Base64 associado (após sincronizar)
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

    /**
     * Strips Base64 imageUrls from ALL pending inspections without removing them.
     * Call this periodically or after a failed sync attempt to free localStorage space.
     */
    purgeAllBase64(): void {
        try {
            const existing = this.getAllPending();
            let changed = false;
            const cleaned = existing.map(inspection => {
                if (!inspection.responses) return inspection;
                const cleanedResponses = purgeBase64FromResponses(inspection.responses);
                // Only update if something actually changed
                const didChange = JSON.stringify(cleanedResponses) !== JSON.stringify(inspection.responses);
                if (didChange) changed = true;
                return { ...inspection, responses: cleanedResponses };
            });
            if (changed) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
                console.log('🧹 Base64 purgado das inspeções pendentes');
            }
        } catch (error) {
            console.error('Erro ao purgar Base64:', error);
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
    },

    // === DRAFT MANAGEMENT ===

    // Salvar rascunho de inspeção
    saveDraft(draft: Omit<DraftInspection, 'id' | 'key'>): string {
        const key = `${draft.vehicleId}_${draft.templateId}`;
        const fullDraft: DraftInspection = {
            ...draft,
            id: `draft_${Date.now()}`,
            key,
            updated_at: new Date().toISOString()
        };

        const existing = this.getAllDrafts();
        const filtered = existing.filter(d => d.key !== key); // Remove rascunho anterior do mesmo checklist
        filtered.push(fullDraft);
        localStorage.setItem(DRAFTS_KEY, JSON.stringify(filtered));

        console.log('💾 Rascunho salvo:', key);
        return fullDraft.id;
    },

    // Buscar rascunho específico por veículo + template
    getDraft(vehicleId: string, templateId: string): DraftInspection | null {
        const key = `${vehicleId}_${templateId}`;
        const all = this.getAllDrafts();
        return all.find(d => d.key === key) || null;
    },

    // Buscar todos os rascunhos
    getAllDrafts(): DraftInspection[] {
        try {
            const data = localStorage.getItem(DRAFTS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Erro ao buscar rascunhos:', error);
            return [];
        }
    },

    // Remover rascunho
    removeDraft(key: string): boolean {
        try {
            const existing = this.getAllDrafts();
            const filtered = existing.filter(d => d.key !== key);
            localStorage.setItem(DRAFTS_KEY, JSON.stringify(filtered));
            console.log('🗑️ Rascunho removido:', key);
            return true;
        } catch (error) {
            console.error('Erro ao remover rascunho:', error);
            return false;
        }
    },

    // Contar rascunhos
    getDraftsCount(): number {
        return this.getAllDrafts().length;
    }
};
