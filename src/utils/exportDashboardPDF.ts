// @ts-ignore
import html2pdf from 'html2pdf.js';

interface DashboardExportData {
  totalInspections: number;
  completedInspections: number;
  rejectedInspections: number;
  uniqueInspectors: number;
  uniqueVehicles: number;
  avgDaily: number;
  totalUsers: number;
  activeUsers: number;
  motoristas: number;
  gestores: number;
  analistas: number;
  outros: number;
  totalVehicles: number;
  activeVehicles: number;
  inactiveVehicles: number;
  totalTrailers: number;
  activeTrailers: number;
  inactiveTrailers: number;
  conformItems: number;
  nonConformItems: number;
  conformityRate: number;
  conformityBreakdown: { answer: string; count: number; type: 'conforme' | 'nao_conforme' | 'info' }[];
  weeklyData: { weekStart: string; inspections: number; inspectors: number; vehicles: number }[];
  dailyData: { day: string; inspections: number }[];
  topInspectors: { name: string; inspections: number; completed: number }[];
  topVehicles: { plate: string; model: string; inspections: number }[];
  topTemplates: { name: string; uses: number; percent: number }[];
}

const fmt = (n: number) => n.toLocaleString('pt-BR');
const fmtDate = (iso: string) => iso.split('-').reverse().join('/');

function isWeekend(iso: string): boolean {
  const d = new Date(iso + 'T12:00:00Z');
  return d.getUTCDay() === 0 || d.getUTCDay() === 6;
}

function getRankClass(i: number): string {
  if (i === 0) return 'rank-1';
  if (i === 1) return 'rank-2';
  if (i === 2) return 'rank-3';
  return 'rank-other';
}

export function exportDashboardToPDF(data: DashboardExportData, startDate: string, endDate: string): void {
  const periodLabel = `${fmtDate(startDate)} — ${fmtDate(endDate)}`;
  const now = new Date();
  const generatedAt = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  const completionRate = data.totalInspections > 0 ? ((data.completedInspections / data.totalInspections) * 100).toFixed(0) : '0';

  const weeklyGrowth = (() => {
    if (data.weeklyData.length < 2) return null;
    const first = data.weeklyData[0].inspections;
    const last = data.weeklyData[data.weeklyData.length - 1].inspections;
    if (first === 0) return null;
    return Math.round(((last - first) / first) * 100);
  })();

  const maxDaily = Math.max(...data.dailyData.map(d => d.inspections), 1);
  const evoColCount = Math.min(data.weeklyData.length, 4);

  // Build HTML — all dimensions in mm/px, NO vh/vw units (html2canvas doesn't support them)
  // Container is 210mm wide, with 15mm internal padding to simulate A4 margins
  // html2pdf margin is set to 0 so we control all spacing ourselves
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
:root{--primary:#0f2b46;--primary-light:#1a4971;--accent:#2196F3;--accent-light:#E3F2FD;--success:#10B981;--success-light:#D1FAE5;--warning:#F59E0B;--warning-light:#FEF3C7;--danger:#EF4444;--danger-light:#FEE2E2;--gray-50:#F8FAFC;--gray-100:#F1F5F9;--gray-200:#E2E8F0;--gray-300:#CBD5E1;--gray-400:#94A3B8;--gray-500:#64748B;--gray-600:#475569;--gray-700:#334155;--gray-800:#1E293B;--gray-900:#0F172A}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;color:var(--gray-800);background:white;font-size:11px;line-height:1.5;-webkit-font-smoothing:antialiased}

/* COVER: fixed A4 height (297mm) so it fills exactly one PDF page */
.cover{height:297mm;display:flex;flex-direction:column;justify-content:center;align-items:center;background:linear-gradient(135deg,var(--primary) 0%,var(--primary-light) 50%,var(--accent) 100%);color:white;text-align:center;position:relative;overflow:hidden}
.cover::before{content:'';position:absolute;top:-50%;right:-50%;width:100%;height:100%;background:radial-gradient(circle,rgba(255,255,255,0.05) 0%,transparent 70%);border-radius:50%}
.cover::after{content:'';position:absolute;bottom:-30%;left:-30%;width:80%;height:80%;background:radial-gradient(circle,rgba(33,150,243,0.15) 0%,transparent 70%);border-radius:50%}
.cover-content{position:relative;z-index:1}
.cover-logo{font-size:48px;font-weight:800;letter-spacing:-2px;margin-bottom:8px}
.cover-logo span{color:var(--accent)}
.cover-subtitle{font-size:13px;font-weight:300;letter-spacing:4px;text-transform:uppercase;opacity:0.8;margin-bottom:60px}
.cover-title{font-size:32px;font-weight:700;margin-bottom:12px;letter-spacing:-0.5px}
.cover-period{font-size:16px;font-weight:300;opacity:0.9;margin-bottom:6px}
.cover-company{font-size:14px;font-weight:400;opacity:0.7}
.cover-footer{position:absolute;bottom:30px;font-size:10px;opacity:0.5;z-index:1}

/* CONTENT PAGE — 8mm padding gives ~764px content width at 794px container */
.page{padding:8mm}
.section{margin-bottom:24px}
.section-header{display:flex;align-items:center;gap:8px;margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid var(--primary)}
.section-icon{width:28px;height:28px;background:var(--primary);border-radius:6px;flex-shrink:0;font-size:14px;line-height:28px;text-align:center;overflow:hidden}
.icon-emoji{display:inline-block;transform:translateY(-1px)}
.section-title{font-size:16px;font-weight:700;color:var(--primary);letter-spacing:-0.3px;line-height:28px}

/* KPI */
.kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px}
.kpi-card{background:var(--gray-50);border:1px solid var(--gray-200);border-radius:8px;padding:12px;text-align:center;position:relative;overflow:hidden}
.kpi-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px}
.kpi-card.blue::before{background:var(--accent)}.kpi-card.green::before{background:var(--success)}.kpi-card.orange::before{background:var(--warning)}.kpi-card.red::before{background:var(--danger)}.kpi-card.dark::before{background:var(--primary)}
.kpi-value{font-size:24px;font-weight:800;color:var(--gray-900);letter-spacing:-1px;line-height:1.1}
.kpi-label{font-size:9px;font-weight:600;color:var(--gray-500);text-transform:uppercase;letter-spacing:0.5px;margin-top:3px}
.kpi-sub{font-size:8px;color:var(--gray-400);margin-top:2px}

/* TABLES */
table{width:100%;border-collapse:collapse;font-size:10px}
thead th{background:var(--primary);color:white;padding:5px 6px;text-align:left;font-weight:600;font-size:8px;text-transform:uppercase;letter-spacing:0.3px;vertical-align:middle}
thead th:first-child{border-radius:6px 0 0 0}thead th:last-child{border-radius:0 6px 0 0}
tbody td{padding:4px 6px;border-bottom:1px solid var(--gray-100);vertical-align:middle}
tbody tr:nth-child(even){background:var(--gray-50)}
.text-right{text-align:right}.text-center{text-align:center}
.badge{display:inline-block;padding:2px 6px;border-radius:10px;font-size:8px;font-weight:600}
.badge-success{background:var(--success-light);color:#065F46}
.badge-warning{background:var(--warning-light);color:#92400E}
.badge-danger{background:var(--danger-light);color:#991B1B}

/* CONFORMITY */
.conformity-box{background:linear-gradient(135deg,#F0FDF4,#ECFDF5);border:1px solid #BBF7D0;border-radius:10px;padding:16px;text-align:center}
.conformity-value{font-size:44px;font-weight:800;color:var(--success);letter-spacing:-2px;line-height:1}
.conformity-label{font-size:11px;font-weight:600;color:#065F46;margin-top:4px}
.conformity-detail{font-size:9px;color:var(--gray-500);margin-top:6px}
.conformity-bar{width:100%;height:10px;background:var(--danger-light);border-radius:5px;overflow:hidden;margin-top:10px}
.conformity-bar-fill{height:100%;background:linear-gradient(90deg,var(--success),#34D399);border-radius:5px}

/* BAR CHART */
.bar-chart{margin:6px 0}
.bar-row{display:flex;align-items:center;gap:6px;margin-bottom:2px}
.bar-label{width:40px;font-size:8px;color:var(--gray-500);text-align:right;flex-shrink:0}
.bar-track{flex:1;height:12px;background:var(--gray-100);border-radius:3px;overflow:hidden}
.bar-fill{height:100%;background:linear-gradient(90deg,var(--accent),#64B5F6);border-radius:3px;min-width:2px;display:flex;align-items:center;justify-content:flex-end;padding-right:3px}
.bar-fill-value{font-size:7px;font-weight:700;color:white}
.bar-fill.peak{background:linear-gradient(90deg,var(--primary),var(--primary-light))}
.bar-fill.weekend{background:linear-gradient(90deg,var(--gray-300),var(--gray-400))}

/* LAYOUT */
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.insights{background:var(--accent-light);border:1px solid #BBDEFB;border-radius:10px;padding:14px 16px}
.insight-item{display:flex;gap:6px;margin-bottom:6px;font-size:9.5px;line-height:1.4}
.insight-icon{flex-shrink:0;font-size:11px;width:16px;text-align:center}
.evo-grid{display:grid;grid-template-columns:repeat(${evoColCount},1fr);gap:6px;margin-bottom:14px}
.evo-card{background:var(--gray-50);border:1px solid var(--gray-200);border-radius:6px;padding:8px;text-align:center}
.evo-week{font-size:8px;font-weight:600;color:var(--gray-500);text-transform:uppercase;letter-spacing:0.3px}
.evo-value{font-size:18px;font-weight:800;color:var(--primary);margin:2px 0}
.evo-detail{font-size:7px;color:var(--gray-400)}
.evo-growth{font-size:8px;font-weight:700;margin-top:2px}

/* PAGE HEADER */
.page-header{display:flex;justify-content:space-between;align-items:center;padding-bottom:10px;border-bottom:1px solid var(--gray-200);margin-bottom:20px}
.page-header-logo{font-size:13px;font-weight:700;color:var(--primary)}
.page-header-logo span{color:var(--accent)}
.page-header-info{font-size:8px;color:var(--gray-400);text-align:right}

/* RANKING */
.rank-num{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;font-size:9px;font-weight:700}
.rank-1{background:#FEF3C7;color:#92400E}.rank-2{background:var(--gray-200);color:var(--gray-700)}.rank-3{background:#FED7AA;color:#9A3412}.rank-other{background:var(--gray-100);color:var(--gray-500)}
.footer-note{margin-top:24px;padding-top:10px;border-top:1px solid var(--gray-200);font-size:8px;color:var(--gray-400);text-align:center}
</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="cover">
  <div class="cover-content">
    <div class="cover-logo">Check<span>Ship</span></div>
    <div class="cover-subtitle">Plataforma de Inspeção Veicular</div>
    <div class="cover-title">Relatório Operacional</div>
    <div class="cover-period">${periodLabel}</div>
    <div class="cover-company" style="margin-top:20px">Transportadora Rolim</div>
  </div>
  <div class="cover-footer">Gerado automaticamente em ${generatedAt} — CheckShip v1.0</div>
</div>

<!-- PAGE 2: RESUMO EXECUTIVO -->
<div class="page">
  <div class="page-header">
    <div class="page-header-logo">Check<span>Ship</span></div>
    <div class="page-header-info">Relatório Operacional<br>${periodLabel}</div>
  </div>

  <div class="section">
    <div class="section-header">
      <div class="section-icon"><span class="icon-emoji">📊</span></div>
      <div class="section-title">Resumo Executivo</div>
    </div>
    <div class="kpi-grid">
      <div class="kpi-card blue">
        <div class="kpi-value">${fmt(data.totalInspections)}</div>
        <div class="kpi-label">Inspeções Realizadas</div>
        <div class="kpi-sub">${completionRate}% concluídas</div>
      </div>
      <div class="kpi-card dark">
        <div class="kpi-value">${data.uniqueInspectors}</div>
        <div class="kpi-label">Inspetores Ativos</div>
        <div class="kpi-sub">de ${data.motoristas} motoristas</div>
      </div>
      <div class="kpi-card green">
        <div class="kpi-value">${data.conformityRate}%</div>
        <div class="kpi-label">Taxa de Conformidade</div>
        <div class="kpi-sub">${fmt(data.conformItems)} de ${fmt(data.conformItems + data.nonConformItems)} itens</div>
      </div>
      <div class="kpi-card orange">
        <div class="kpi-value">~${data.avgDaily}</div>
        <div class="kpi-label">Média Diária</div>
        <div class="kpi-sub">inspeções/dia</div>
      </div>
      <div class="kpi-card blue">
        <div class="kpi-value">${data.uniqueVehicles}</div>
        <div class="kpi-label">Veículos Inspecionados</div>
        <div class="kpi-sub">de ${data.activeVehicles} ativos</div>
      </div>
      <div class="kpi-card ${weeklyGrowth !== null && weeklyGrowth > 0 ? 'green' : 'orange'}">
        <div class="kpi-value">${weeklyGrowth !== null ? `${weeklyGrowth > 0 ? '+' : ''}${weeklyGrowth}%` : 'N/A'}</div>
        <div class="kpi-label">Crescimento Semanal</div>
        <div class="kpi-sub">${data.weeklyData[0]?.inspections || 0} → ${data.weeklyData[data.weeklyData.length - 1]?.inspections || 0}</div>
      </div>
    </div>
  </div>

  <div class="two-col">
    <div class="section">
      <div class="section-header">
        <div class="section-icon"><span class="icon-emoji">👥</span></div>
        <div class="section-title">Usuários</div>
      </div>
      <table>
        <thead><tr><th>Perfil</th><th class="text-right">Qtd</th><th class="text-right">%</th></tr></thead>
        <tbody>
          <tr><td>Motoristas</td><td class="text-right"><strong>${data.motoristas}</strong></td><td class="text-right">${data.totalUsers > 0 ? ((data.motoristas / data.totalUsers) * 100).toFixed(1) : '0'}%</td></tr>
          <tr><td>Gestores</td><td class="text-right"><strong>${data.gestores}</strong></td><td class="text-right">${data.totalUsers > 0 ? ((data.gestores / data.totalUsers) * 100).toFixed(1) : '0'}%</td></tr>
          <tr><td>Outros</td><td class="text-right"><strong>${data.outros}</strong></td><td class="text-right">${data.totalUsers > 0 ? ((data.outros / data.totalUsers) * 100).toFixed(1) : '0'}%</td></tr>
          <tr style="background:var(--accent-light)"><td><strong>Total</strong></td><td class="text-right"><strong>${data.totalUsers}</strong></td><td class="text-right"><span class="badge badge-success">${data.activeUsers}/${data.totalUsers} ativos</span></td></tr>
        </tbody>
      </table>
    </div>
    <div class="section">
      <div class="section-header">
        <div class="section-icon"><span class="icon-emoji">🚛</span></div>
        <div class="section-title">Frota</div>
      </div>
      <table>
        <thead><tr><th>Ativo</th><th class="text-right">Total</th><th class="text-right">Ativos</th><th class="text-right">Inativos</th></tr></thead>
        <tbody>
          <tr><td>Veículos</td><td class="text-right">${data.totalVehicles}</td><td class="text-right"><span class="badge badge-success">${data.activeVehicles}</span></td><td class="text-right">${data.inactiveVehicles > 0 ? `<span class="badge badge-warning">${data.inactiveVehicles}</span>` : '0'}</td></tr>
          <tr><td>Carretas</td><td class="text-right">${data.totalTrailers}</td><td class="text-right"><span class="badge badge-success">${data.activeTrailers}</span></td><td class="text-right">${data.inactiveTrailers > 0 ? `<span class="badge badge-warning">${data.inactiveTrailers}</span>` : '0'}</td></tr>
          <tr style="background:var(--accent-light)"><td><strong>Total Frota</strong></td><td class="text-right"><strong>${data.totalVehicles + data.totalTrailers}</strong></td><td class="text-right"><strong>${data.activeVehicles + data.activeTrailers}</strong></td><td class="text-right"><strong>${data.inactiveVehicles + data.inactiveTrailers}</strong></td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="section" style="margin-top:20px">
    <div class="section-header">
      <div class="section-icon"><span class="icon-emoji">✅</span></div>
      <div class="section-title">Conformidade e Não Conformidade</div>
    </div>
    <div class="two-col">
      <div class="conformity-box">
        <div class="conformity-value">${data.conformityRate}%</div>
        <div class="conformity-label">Taxa de Conformidade Geral</div>
        <div class="conformity-bar"><div class="conformity-bar-fill" style="width:${data.conformityRate}%"></div></div>
        <div class="conformity-detail" style="margin-top:6px">✅ ${fmt(data.conformItems)} itens conformes &nbsp;|&nbsp; ⚠️ ${fmt(data.nonConformItems)} itens não conformes</div>
      </div>
      <div>
        <table>
          <thead><tr><th>Resposta</th><th class="text-right">Contagem</th><th class="text-center">Status</th></tr></thead>
          <tbody>
            ${data.conformityBreakdown.map(item => `<tr><td>${item.answer === 'Negativo' ? 'Negativo (Bafômetro)' : item.answer}</td><td class="text-right">${fmt(item.count)}</td><td class="text-center"><span class="badge ${item.type === 'conforme' ? 'badge-success' : 'badge-danger'}">${item.type === 'conforme' ? 'Conforme' : 'Não Conforme'}</span></td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<!-- PAGE 3: EVOLUÇÃO & CHECKLISTS -->
<div class="page">
  <div class="page-header">
    <div class="page-header-logo">Check<span>Ship</span></div>
    <div class="page-header-info">Relatório Operacional<br>${periodLabel}</div>
  </div>

  <div class="section">
    <div class="section-header">
      <div class="section-icon"><span class="icon-emoji">📈</span></div>
      <div class="section-title">Evolução Semanal</div>
    </div>
    <div class="evo-grid">
      ${data.weeklyData.map((week, i) => {
        const prev = i > 0 ? data.weeklyData[i - 1] : null;
        const growth = prev && prev.inspections > 0 ? Math.round(((week.inspections - prev.inspections) / prev.inspections) * 100) : null;
        const isLast = i === data.weeklyData.length - 1;
        return `<div class="evo-card" ${isLast ? 'style="border-color:var(--accent);background:var(--accent-light)"' : ''}>
          <div class="evo-week">Semana ${i + 1}</div>
          <div class="evo-value" ${isLast ? 'style="color:var(--accent)"' : ''}>${week.inspections}</div>
          <div class="evo-detail">${week.inspectors} inspetores • ${week.vehicles} veículos</div>
          ${growth !== null ? `<div class="evo-growth" style="color:${growth >= 0 ? 'var(--success)' : 'var(--warning)'}">
            ${growth >= 0 ? '▲' : '▼'} ${growth > 0 ? '+' : ''}${growth}%
          </div>` : ''}
        </div>`;
      }).join('')}
    </div>
  </div>

  <div class="section">
    <div class="section-header">
      <div class="section-icon"><span class="icon-emoji">📅</span></div>
      <div class="section-title">Volume Diário de Inspeções</div>
    </div>
    <div class="bar-chart">
      ${data.dailyData.map(d => {
        const pct = (d.inspections / maxDaily) * 100;
        const isPeak = d.inspections === maxDaily;
        const weekend = isWeekend(d.day);
        const [, m, day] = d.day.split('-');
        return `<div class="bar-row"><div class="bar-label">${day}/${m}</div><div class="bar-track"><div class="bar-fill ${isPeak ? 'peak' : weekend ? 'weekend' : ''}" style="width:${Math.max(pct, 3)}%"><span class="bar-fill-value">${d.inspections}${isPeak ? ' 🏆' : ''}</span></div></div></div>`;
      }).join('')}
    </div>
    <div style="font-size:8px;color:var(--gray-400);margin-top:4px">
      <span style="display:inline-block;width:8px;height:8px;background:linear-gradient(90deg,var(--accent),#64B5F6);border-radius:2px"></span> Dia útil &nbsp;&nbsp;
      <span style="display:inline-block;width:8px;height:8px;background:linear-gradient(90deg,var(--gray-300),var(--gray-400));border-radius:2px"></span> Fim de semana &nbsp;&nbsp;
      <span style="display:inline-block;width:8px;height:8px;background:linear-gradient(90deg,var(--primary),var(--primary-light));border-radius:2px"></span> Pico
    </div>
  </div>

  <div class="section" style="margin-top:16px">
    <div class="section-header">
      <div class="section-icon"><span class="icon-emoji">📋</span></div>
      <div class="section-title">Checklists Mais Utilizados</div>
    </div>
    <table>
      <thead><tr><th>#</th><th>Template</th><th class="text-right">Aplicações</th><th class="text-right">% do Total</th></tr></thead>
      <tbody>
        ${data.topTemplates.map((tpl, i) => `<tr><td>${i + 1}</td><td>${tpl.name}</td><td class="text-right">${i < 3 ? `<strong>${fmt(tpl.uses)}</strong>` : fmt(tpl.uses)}</td><td class="text-right">${tpl.percent}%</td></tr>`).join('')}
      </tbody>
    </table>
  </div>
</div>

<!-- PAGE 4: RANKINGS & INSIGHTS -->
<div class="page">
  <div class="page-header">
    <div class="page-header-logo">Check<span>Ship</span></div>
    <div class="page-header-info">Relatório Operacional<br>${periodLabel}</div>
  </div>

  <div class="two-col">
    <div class="section">
      <div class="section-header">
        <div class="section-icon"><span class="icon-emoji">🏆</span></div>
        <div class="section-title">Top 10 Inspetores</div>
      </div>
      <table>
        <thead><tr><th>#</th><th>Inspetor</th><th class="text-right">Insp.</th><th class="text-center">Conclusão</th></tr></thead>
        <tbody>
          ${data.topInspectors.map((ins, i) => {
            const rate = ins.inspections > 0 ? Math.round((ins.completed / ins.inspections) * 100) : 0;
            return `<tr><td><span class="rank-num ${getRankClass(i)}">${i + 1}</span></td><td>${ins.name}</td><td class="text-right">${i < 3 ? `<strong>${ins.inspections}</strong>` : ins.inspections}</td><td class="text-center"><span class="badge badge-success">${rate}%</span></td></tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <div class="section-header">
        <div class="section-icon"><span class="icon-emoji">🚗</span></div>
        <div class="section-title">Top 10 Veículos</div>
      </div>
      <table>
        <thead><tr><th>#</th><th>Placa</th><th class="text-right">Inspeções</th></tr></thead>
        <tbody>
          ${data.topVehicles.map((v, i) => `<tr><td><span class="rank-num ${getRankClass(i)}">${i + 1}</span></td><td>${i < 3 ? `<strong>${v.plate}</strong>` : v.plate}</td><td class="text-right">${i < 3 ? `<strong>${v.inspections}</strong>` : v.inspections}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>

  <div class="section" style="margin-top:20px">
    <div class="section-header">
      <div class="section-icon"><span class="icon-emoji">💡</span></div>
      <div class="section-title">Insights e Recomendações</div>
    </div>
    <div class="insights">
      ${weeklyGrowth !== null && weeklyGrowth > 0 ? `<div class="insight-item"><span class="insight-icon">📈</span><span><strong>Adoção crescente:</strong> Crescimento de ${weeklyGrowth}% no volume semanal de inspeções.</span></div>` : ''}
      <div class="insight-item"><span class="insight-icon">✅</span><span><strong>Conformidade de ${data.conformityRate}%</strong> — ${data.conformityRate >= 95 ? 'excelente padrão de qualidade' : 'atenção necessária para itens não conformes'}.</span></div>
      ${data.inactiveVehicles > 0 ? `<div class="insight-item"><span class="insight-icon">🔧</span><span><strong>${data.inactiveVehicles} veículos inativos:</strong> Verificar se estão em manutenção ou devem ser reativados.</span></div>` : ''}
      ${data.motoristas > data.uniqueInspectors ? `<div class="insight-item"><span class="insight-icon">👤</span><span><strong>${data.motoristas - data.uniqueInspectors} motoristas sem inspeções no período:</strong> Avaliar necessidade de treinamento ou incentivo.</span></div>` : ''}
      ${data.nonConformItems > 0 ? `<div class="insight-item"><span class="insight-icon">⚠️</span><span><strong>${fmt(data.nonConformItems)} itens não conformes:</strong> Rastrear individualmente para identificar padrões recorrentes.</span></div>` : ''}
      ${data.rejectedInspections > 0 ? `<div class="insight-item"><span class="insight-icon">🚫</span><span><strong>${data.rejectedInspections} inspeções rejeitadas:</strong> Investigar motivos de reprovação.</span></div>` : ''}
    </div>
  </div>

  <div class="footer-note">
    Este relatório foi gerado automaticamente pela plataforma <strong>CheckShip</strong> em ${generatedAt}.<br>
    Dados do período de ${periodLabel}.<br>
    © 2026 CheckShip — Plataforma de Inspeção Veicular
  </div>
</div>
</body>
</html>`;

  const container = document.createElement('div');
  container.style.width = '794px'; // A4 width at 96dpi
  container.style.background = 'white';
  container.innerHTML = html;
  document.body.appendChild(container);

  const opt = {
    margin: 0,
    filename: `Relatorio_Operacional_CheckShip_${startDate}_${endDate}.pdf`,
    image: { type: 'png' as const, quality: 1 },
    html2canvas: { scale: 2, useCORS: true, logging: false, width: 794 },
    jsPDF: { unit: 'px', format: 'a4', orientation: 'portrait' as const, hotfixes: ['px_scaling'] },
    pagebreak: { mode: ['css'], avoid: ['.section', '.two-col'] },
  };

  html2pdf().set(opt).from(container).save().then(() => {
    document.body.removeChild(container);
  });
}
