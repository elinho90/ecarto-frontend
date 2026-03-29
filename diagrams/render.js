const puppeteer = require('puppeteer');
const path = require('path');

const diagrams = [
    { file: 'use_case.html', output: 'use_case_diagram.png', width: 1600, height: 1200 },
    { file: 'sequence_diagram.html', output: 'sequence_diagram.png', width: 1200, height: 2200 },
    { file: 'deployment_diagram.html', output: 'deployment_diagram.png', width: 1400, height: 1000 },
    { file: 'wireframes.html', output: 'wireframes.png', width: 1300, height: 900 },
];

(async () => {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });

    for (const d of diagrams) {
        console.log('Rendering ' + d.file + '...');
        const page = await browser.newPage();
        await page.setViewport({ width: d.width, height: d.height });

        const filePath = 'file:///' + path.resolve(__dirname, d.file).replace(/\\/g, '/');
        await page.goto(filePath, { waitUntil: 'networkidle0', timeout: 30000 });

        // Wait for Mermaid to render  
        await new Promise(resolve => setTimeout(resolve, 4000));

        const outputPath = path.resolve(__dirname, d.output);
        await page.screenshot({ path: outputPath, fullPage: true });
        console.log('  -> Saved: ' + outputPath);
        await page.close();
    }

    await browser.close();
    console.log('All diagrams rendered successfully!');
})();
