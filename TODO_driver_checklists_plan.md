# [Goal Description]
Permitir que checklists tenham como "alvo" de inspeção o próprio **Motorista**, e não obrigatoriamente um **Veículo**. Registros devem adaptar-se para salvar de forma íntegra na base de dados (ausência de placa/KM), impactando as regras de front-end (web e relatórios) e app móvel.

## User Review Required
> [!IMPORTANT]
> Como isso afeta `plate` e `km_at_execution` no banco em produção, isso levanta riscos e exige planejamento. Para reduzir as chances de paralisar a frota ativa e garantir uma janela segura como você sugeriu.

**Estratégias de Teste e Deploy (Respondendo à sua dúvida):**
1. **O Código primeiro, Database depois:** As migrações de DB sugeridas (`DROP NOT NULL` nas colunas) **NÃO quebram retrocompatibilidade**! Um código ou aplicativo antigo ainda mandará placa/KM e continuará sendo gravado da mesma forma com sucesso. Podemos rodar esses scripts SQL a qualquer momento (preferencialmente horários tranquilos).
2. **Feature Flags/Deployment Controlado:** O front-end com os novos fluxos de UI que pularão tela de Veículos no app precisará ser validado isoladamente para não quebrar checklists pré-existentes e garantir que Checklists de Motoristas fluam bem.
3. **Agendamento com o Cliente:** Comunique a implementação no fim de semana ou período noturno do lançamento principal dessa feature no aplicativo final. 

## Proposed Changes

### Database e Tipagens `types.ts`
- Alteração segura da Tabela Supabase `checklist_records` (placa e KM não-obrigatórios).
- Inclusão da tipagem `/types.ts` (ex `ChecklistTemplate` contendo propriedade `target_entity: 'vehicle' | 'driver'`).

### Plataforma Administrativa (Web)
- Adição da configuração na criação e Edição Web.
- Tratamento de exceção em todos os grids de resultados que aguardam "Placa".

### App Móvel (CheckShip Mobile)
- Ao selecionar template, interceptar a UI condicionalmente antes do formulário, passando direto. Lidar com supervisor escolhendo os motoristas-alvos num select. 

## Verification Plan

### Testes Automatizados
- Validação completa do TS/React para tipagens e null handlers.

### Verificação Manual
- Construir Templates de Carro vs Template Motorista.
- Realizar teste "Dry-run" da inserção Mobile para validar integridade final da payload enviada à nuvem Supabase antes da subida oficial na loja.
