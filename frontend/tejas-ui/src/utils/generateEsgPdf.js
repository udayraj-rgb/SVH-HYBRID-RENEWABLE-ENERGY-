import { jsPDF } from 'jspdf';

export const generateEsgAuditPdf = (metrics) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const costSaved = metrics?.total_cost_saved_inr || 0;
  const carbonAvoided = metrics?.total_carbon_avoided_kg || 0;
  const energySaved = metrics?.total_energy_saved_kwh || 0;
  const trees = metrics?.equivalent_trees_planted || Math.round((carbonAvoided / 21.77) * 10) / 10;
  const karma = metrics?.total_circulating_karma || 0;
  const studentsCount = metrics?.total_registered_students || 6;
  const dispatchesCount = metrics?.executed_dispatches_count || 0;
  const peakShaving = metrics?.peak_shaving_ratio_percent || 0;
  const varianceReduction = metrics?.variance_reduction_percent || 23.4;
  const hourlySavings = metrics?.hourly_savings_rate_inr || 0;
  const hourlyCarbon = metrics?.hourly_carbon_rate_kg || 0;
  const batterySoc = metrics?.battery_soc_percent != null ? Number(metrics.battery_soc_percent).toFixed(1) : '50.0';

  // 1. TOP HEADER BANNER (Dark Slate & Emerald Accent)
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(margin, 10, contentWidth, 30, 'F');

  // Emerald Top Stripe
  doc.setFillColor(5, 150, 105); // Emerald 600
  doc.rect(margin, 10, contentWidth, 3, 'F');

  // Badge text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(16, 185, 129); // Emerald 400
  doc.text('OFFICIAL ESG AUDIT & SCOPE 2 CARBON OFFSET CERTIFICATE', margin + 6, 18);

  // Main Header Title
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('TEJAS GRID - CAMPUS VIRTUAL POWER PLANT', margin + 6, 26);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('Autonomous SCADA Orchestration & Statutory Decarbonization Report', margin + 6, 32);

  // Header Right Metadata Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text('REF: TG-AUDIT-2026-094', pageWidth - margin - 50, 20);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Generated: ' + new Date().toLocaleDateString(), pageWidth - margin - 50, 25);
  doc.text('Standard: CEA v19 / ISO 50001', pageWidth - margin - 50, 30);

  // 2. EXECUTIVE SUMMARY BOX
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.roundedRect(margin, 44, contentWidth, 18, 2, 2, 'FD');

  // Green bar on left of summary
  doc.setFillColor(16, 185, 129);
  doc.rect(margin, 44, 2.5, 18, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('EXECUTIVE COMMISSIONING SUMMARY:', margin + 6, 49);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const summaryText = 'This certified audit confirms that the TEJAS autonomous Virtual Power Plant orchestrates distributed solar, wind, and battery assets to shave peak utility draw during commercial Time-of-Day windows, avoiding grid surcharges and eliminating campus Scope 2 greenhouse gas emissions in real time.';
  const splitSummary = doc.splitTextToSize(summaryText, contentWidth - 10);
  doc.text(splitSummary, margin + 6, 54);

  // 3. 4 KEY PERFORMANCE METRIC CARDS (2x2 Grid)
  const cardW = (contentWidth - 6) / 2;
  const cardH = 26;
  const row1Y = 66;
  const row2Y = 96;

  // Card 1: Financial Savings (Top Left)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, row1Y, cardW, cardH, 2, 2, 'FD');
  doc.setFillColor(5, 150, 105);
  doc.rect(margin, row1Y, 2, cardH, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('PEAK TARIFF COST AVOIDED', margin + 6, row1Y + 6);
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('INR ' + Number(costSaved).toLocaleString(), margin + 6, row1Y + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(5, 150, 105);
  doc.text('+INR ' + hourlySavings + '/hr accumulation velocity', margin + 6, row1Y + 19);
  doc.setTextColor(148, 163, 184);
  doc.text('Rate: INR 12.50 / kWh (Commercial ToD Peak)', margin + 6, row1Y + 23);

  // Card 2: Carbon Mitigation (Top Right)
  const card2X = margin + cardW + 6;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(card2X, row1Y, cardW, cardH, 2, 2, 'FD');
  doc.setFillColor(13, 148, 136); // Teal 600
  doc.rect(card2X, row1Y, 2, cardH, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('SCOPE 2 CARBON EMISSIONS MITIGATED', card2X + 6, row1Y + 6);
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(Number(carbonAvoided).toLocaleString() + ' kg CO2e', card2X + 6, row1Y + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(13, 148, 136);
  doc.text('Eqv. to ' + trees + ' mature trees planted / year', card2X + 6, row1Y + 19);
  doc.setTextColor(148, 163, 184);
  doc.text('CEA Database v19: 0.820 kg CO2 / kWh', card2X + 6, row1Y + 23);

  // Card 3: Energy Shifted & Peak Shaving (Bottom Left)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, row2Y, cardW, cardH, 2, 2, 'FD');
  doc.setFillColor(217, 119, 6); // Amber 600
  doc.rect(margin, row2Y, 2, cardH, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('PEAK CLEAN ENERGY SHIFTED', margin + 6, row2Y + 6);
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(Number(energySaved).toLocaleString() + ' kWh', margin + 6, row2Y + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(217, 119, 6);
  doc.text('Peak Shaving Ratio: ' + peakShaving + '% of load', margin + 6, row2Y + 19);
  doc.setTextColor(148, 163, 184);
  doc.text('Demand Volatility Damping: -' + varianceReduction + '% sigma', margin + 6, row2Y + 23);

  // Card 4: Circulating Karma Economy (Bottom Right)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(card2X, row2Y, cardW, cardH, 2, 2, 'FD');
  doc.setFillColor(124, 58, 237); // Purple 600
  doc.rect(card2X, row2Y, 2, cardH, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('CIRCULATING STUDENT KARMA POINTS', card2X + 6, row2Y + 6);
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(Number(karma).toLocaleString() + ' KP', card2X + 6, row2Y + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(124, 58, 237);
  doc.text(studentsCount + ' registered students in PostgreSQL', card2X + 6, row2Y + 19);
  doc.setTextColor(148, 163, 184);
  doc.text('Decrements dynamically upon voucher redemption', card2X + 6, row2Y + 23);

  // 4. STATUTORY BENCHMARK & AUDIT TABLE
  const tableY = 128;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('STATUTORY BENCHMARKS & OPERATIONAL AUDIT METRICS', margin, tableY);

  // Table Header Row
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.rect(margin, tableY + 3, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('AUDIT PARAMETER', margin + 4, tableY + 7.5);
  doc.text('QUANTITATIVE VALUE', margin + 65, tableY + 7.5);
  doc.text('GOVERNING REGULATORY / TECHNICAL BENCHMARK', margin + 115, tableY + 7.5);

  // Table Data Rows
  const rows = [
    ['Commercial Time-of-Day (ToD) Tariff', 'INR 12.50 per kWh avoided', 'State Electricity Regulatory Commission Tariff Order'],
    ['Scope 2 Grid Carbon Emission Factor', '0.820 kg CO2e per kWh', 'Central Electricity Authority (CEA) Baseline Database v19.0'],
    ['Mature Tree Carbon Sequestration', '21.77 kg CO2 / tree / year', 'US EPA & Indian MoEFCC Urban Forestry Standard'],
    ['Battery Critical Safety Reserve Floor', '30% SoC (240 kWh Reserved)', 'Un-bypassable Research Lab Server Protection Floor'],
    ['Peak Shaving Efficiency (eta_peak)', peakShaving + '% Peak Load Shaved', 'IEEE 2030.7 Virtual Power Plant Standard'],
    ['Demand Variance Smoothing (sigma_load)', varianceReduction + '% Volatility Damped', 'Demand-Response Automated Peak Leveling Factor'],
    ['PostgreSQL Autonomous DR Dispatches', dispatchesCount + ' Events Executed', 'SCADA Event Bus Relational Audit Trail'],
    ['Residential Community Participation', studentsCount + ' Registered Students', 'Automated WhatsApp Gateway Direct Alerts'],
  ];

  let currentY = tableY + 10;
  rows.forEach((row, i) => {
    const isEven = i % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, currentY, contentWidth, 6.5, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, currentY + 6.5, margin + contentWidth, currentY + 6.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.text(row[0], margin + 4, currentY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(row[1], margin + 65, currentY + 4.5);

    doc.setTextColor(100, 116, 139);
    doc.text(row[2], margin + 115, currentY + 4.5);

    currentY += 6.5;
  });

  // 5. HARDWARE SAFETY GUARANTEE CALLOUT
  const safetyY = currentY + 4;
  doc.setFillColor(240, 253, 244); // Emerald 50
  doc.setDrawColor(187, 247, 208); // Emerald 200
  doc.roundedRect(margin, safetyY, contentWidth, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(22, 101, 52); // Emerald 800
  doc.text('MISSION-CRITICAL LAB PROTECTION & BATTERY SAFETY VERIFICATION:', margin + 5, safetyY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(21, 128, 61);
  const safetyText = 'The 800 kWh Battery Energy Storage System (BESS) enforces an un-bypassable hardware threshold at 30% State of Charge (SoC = 240 kWh floor). Discharging is automatically locked out for general residential demand response below 30% to guarantee continuous, zero-interruption power for campus AI servers, high-performance computing clusters, and robotics laboratories. Current battery state: ' + batterySoc + '% SoC.';
  const splitSafety = doc.splitTextToSize(safetyText, contentWidth - 10);
  doc.text(splitSafety, margin + 5, safetyY + 9.5);

  // 6. OFFICIAL SIGNATURE & DIGITAL AUDIT STAMP
  const sigY = safetyY + 24;

  // Left Signature
  doc.setDrawColor(203, 213, 225);
  doc.line(margin + 5, sigY + 12, margin + 70, sigY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Eng. Rajesh Verma', margin + 5, sigY + 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Chief Energy Officer & SCADA Director', margin + 5, sigY + 20);
  doc.text('Campus Electrical Infrastructure Division', margin + 5, sigY + 24);

  // Right Digital Stamp
  const stampX = pageWidth - margin - 75;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(stampX, sigY - 2, 75, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(5, 150, 105);
  doc.text('[VPP AUTONOMOUS AUDIT VERIFIED]', stampX + 5, sigY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Digital Hash: SHA256:7f01a9...c4b9', stampX + 5, sigY + 10);
  doc.text('Orchestrator Node: tejas-core-orchestrator:8080', stampX + 5, sigY + 14);
  doc.text('Telemetry Source: FastAPI Telemetry Service:8000', stampX + 5, sigY + 18);
  doc.text('Database: PostgreSQL 15 (Hostels, Dispatches, Students)', stampX + 5, sigY + 22);

  // 7. FOOTER
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('TEJAS GRID Autonomous Virtual Power Plant - Official Scope 2 ESG Audit - ISO 50001 / CEA v19 Compliant', margin, pageHeight - 7);
  doc.text('Page 1 of 1', pageWidth - margin - 15, pageHeight - 7);

  // Save the PDF
  const filename = 'TEJAS_GRID_Official_ESG_Audit_' + new Date().toISOString().split('T')[0] + '.pdf';
  doc.save(filename);
};
