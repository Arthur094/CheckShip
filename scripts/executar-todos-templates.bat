echo "🚀 Criando 5 templates SSMA restantes..."
echo ""
echo "📋 Template 4: Inspeção dos Extintores..."
node import-template-4-extintores.js
timeout /t 1 /nobreak > nul

echo ""
echo "📋 Template 5: Inspeção ADM 5S..."
node import-template-5-adm-5s.js
timeout /t 1 /nobreak > nul

echo ""
echo "📋 Template 6: Inspeção Infraestrutura..."
node import-template-6-infraestrutura.js
timeout /t 1 /nobreak > nul

echo ""
echo "📋 Template 7: Auditoria de Veículo (75+ itens)..."
node import-template-7-auditoria-veiculo.js
timeout /t 1 /nobreak > nul

echo ""
echo "📋 Template 8: Checklist de Veículos (130+ itens - MAIOR)..."
node import-template-8-checklist-veiculos.js

echo ""
echo "✅ Importação em lote concluída!"
