# Checklists Focados em Motorista

- [ ] Fase 1: Atualização do Banco de Dados e Tipagem
  - [ ] Criar e atualizar tipagem TypeScript `types.ts` (`plate` e `km` null, + `target_entity`).
  - [ ] Aplicar alteração de schema no Supabase (`checklist_records` e `checklist_templates`).
- [ ] Fase 2: Plataforma Web (Gestão)
  - [ ] Ajustar formulário de Templates (Switch: Target == Veículo ou Motorista).
  - [ ] Ocultar aba "Tipo de Veículos" caso configurado para motorista.
  - [ ] Validar e garantir que os dados sem Placa/KM renderizem graciosamente ("N/A") nos painéis.
- [ ] Fase 3: App Mobile
  - [ ] Adaptar telas iniciais de inspeção (ignorar veículos se for Motorista).
  - [ ] Adaptar payloads baseados na função de quem gera (Supervisor escolhe, motorista é automático).
- [ ] Fase 4: Relatórios
  - [ ] Analisar `DriverPerformanceReport` e `RoutineComplianceReport` prevenindo crashes de variáveis undef.
- [ ] Fase 5: Deploy e Aprovação do Cliente
