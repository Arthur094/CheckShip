const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    const htmlPath = path.resolve(__dirname, 'relatorio_30_dias.html');
    await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 2000));

    await page.pdf({
        path: path.resolve(__dirname, 'Relatorio_Operacional_30_Dias_CheckShip.pdf'),
        format: 'A4',
        printBackground: true,
        margin: { top: '15mm', bottom: '20mm', left: '15mm', right: '15mm' },
        displayHeaderFooter: false
    });

    console.log('PDF gerado com sucesso!');
    await browser.close();
})();
