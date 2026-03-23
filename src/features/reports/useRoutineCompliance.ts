import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export interface ComplianceRow {
  driver_id: string;
  driver_name: string;
  occurrences: number;
}

export interface RoutineDetailRow {
  inspection_date: string;
  checklist_names: string;
  vehicle_plates: string;
}

interface UseRoutineComplianceReturn {
  data: ComplianceRow[];
  isLoading: boolean;
  error: string | null;
  run: (params: { templateIds: string[]; startDate: string; endDate: string }) => Promise<void>;
  fetchDetails: (params: { driverId: string; templateIds: string[]; startDate: string; endDate: string }) => Promise<RoutineDetailRow[]>;
}

export function useRoutineCompliance(): UseRoutineComplianceReturn {
  const [data, setData] = useState<ComplianceRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (params: { templateIds: string[]; startDate: string; endDate: string }) => {
    setIsLoading(true);
    setError(null);
    setData([]);

    try {
      const { data: result, error: rpcError } = await supabase.rpc('get_routine_compliance', {
        p_template_ids: params.templateIds,
        p_start_date: params.startDate,
        p_end_date: params.endDate,
      });

      if (rpcError) throw rpcError;

      setData((result as ComplianceRow[]) || []);
    } catch (err: any) {
      console.error('Erro ao gerar relatório:', err);
      setError(err.message || 'Erro ao gerar relatório');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDetails = async (params: { driverId: string; templateIds: string[]; startDate: string; endDate: string }) => {
    try {
      const { data: result, error: rpcError } = await supabase.rpc('get_routine_compliance_details', {
        p_driver_id: params.driverId,
        p_template_ids: params.templateIds,
        p_start_date: params.startDate,
        p_end_date: params.endDate,
      });

      if (rpcError) throw rpcError;
      return (result as RoutineDetailRow[]) || [];
    } catch (err: any) {
      console.error('Erro ao buscar detalhes da rotina:', err);
      throw err;
    }
  };

  return { data, isLoading, error, run, fetchDetails };
}
