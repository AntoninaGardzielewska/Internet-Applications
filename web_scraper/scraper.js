const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const URL = 'https://www.x-kom.pl/g-2/c/1663-tablety.html';
const outputPath = path.join(__dirname, 'xkom_products.csv');


function extractNumber(text) {
    if (!text) return null;
    const m = text.replace(/\s/g, '').replace(',', '.').match(/\d+(?:\.\d+)?/);
    return m ? parseFloat(m[0]) : null;
}

function parseMemoryToGB(mem) {
    if (!mem) return null;
    const s = String(mem).toLowerCase();
    const m = s.match(/(\d+(?:[.,]\d+)?)/);
    if (!m) return null;
    let num = parseFloat(m[1].replace(',', '.'));
    return isNaN(num) ? null : num;
}

async function debug_snapshot(page, label) {
    console.log(`Debug snapshot: ${label}`);
    await page.screenshot({ path: `debug/${label}.png`, fullPage: true });
    fs.writeFileSync(`debug/${label}.html`, await page.content(), 'utf8');
}

// Browser and page manual handling
async function handleManualVerification(browser, URL) {
    console.log('Initial wait failed. Launching browser in visible mode for manual verification...');
    try { await browser.close(); } catch (e) {}

    const newBrowser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await newBrowser.newPage();
    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
    );
    await page.goto(URL, { waitUntil: 'networkidle2' });

    console.log('Solve any CAPTCHA or verification manually, then press ENTER here to continue...');
    console.log('Remember to do not close the browser window.');
    await new Promise(resolve => {
        process.stdin.resume();
        process.stdin.once('data', () => {
            process.stdin.pause();
            resolve();
        });
    });

    try {
        await page.waitForSelector('[data-name="productCard"]', { timeout: 60000 });
    } catch (e) {
        console.warn('Could not find products even after manual solve.');
    }
    return { browser: newBrowser, page };
}

// Open page function
async function open_page(url) {
    let browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: { width: 1920, height: 1080 }
    });

    let page = await browser.newPage();
    console.log('Navigating to X-kom...');
    await page.goto(url, { waitUntil: 'networkidle0' });
    await debug_snapshot(page, 'initial_load');

    try {
        await page.waitForSelector('[data-name="productCard"]', { timeout: 3000 });
    } catch (waitErr) {
        const result = await handleManualVerification(browser, url);
        browser = result.browser;
        page = result.page;
    }
    return { browser, page };
}

// Data extraction
async function extractProductsFromPage(page) {
    const products = await page.evaluate(() => {
        const items = [];
        const productElements = document.querySelectorAll('[data-name="productCard"]');
        productElements.forEach(product => {
            try {
                const titleAnchor = product.querySelector('a[title]');
                const title = titleAnchor?.getAttribute('title')?.trim() || product.querySelector('h3')?.textContent.trim();
                const ariaPrice = product.querySelector('[aria-label^="Cena:"]')?.getAttribute('aria-label');
                const priceText = ariaPrice || product.querySelector('.parts__Price-sc-24f114ef-1')?.textContent?.trim();

                let memory = null;
                const featureLis = product.querySelectorAll('ul li');
                featureLis.forEach(li => {
                    const spans = li.querySelectorAll('span');
                    if (spans.length >= 2) {
                        const label = spans[0].textContent.trim().toLowerCase();
                        const value = spans[1].textContent.trim();
                        if (label.includes('pamięć') && !label.includes('ram')) {
                            memory = value;
                        }
                    }
                });

                items.push({ 
                    title: title || null, 
                    memory: memory ? memory.trim() : null, 
                    rawPrice: priceText || null 
                });
            } catch (e) {}
        });
        return items;
    });

    return products.map(p => {
        const price = extractNumber(p.rawPrice);
        const memoryGB = parseMemoryToGB(p.memory);
        const pricePerUnit = (price && memoryGB) ? +(price / memoryGB) : null;
        return { 
            title: p.title, 
            memory: p.memory, 
            price, 
            rawPrice: p.rawPrice, 
            pricePerUnit 
        };
    });
}

// Find next page URL
async function findNextPage(page) {
    return await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a'));
        for (const a of anchors) {
            const hrefAttr = a.getAttribute('href') || '';
            const full = a.href || hrefAttr;
            const txt = (a.innerText || '').trim().toLowerCase();
            const aria = (a.getAttribute('aria-label') || '').toLowerCase();

            if (aria.includes('następna') || txt.includes('następna')) return full;
        }
        return null;
    });
}

// save products to CSV
async function saveToCSV(products, outputPath) {
    const csvWriter = createCsvWriter({
        path: outputPath,
        header: [
            { id: 'title', title: 'Title' },
            { id: 'memory', title: 'Memory' },
            { id: 'price', title: 'Price (PLN)' },
            { id: 'rawPrice', title: 'Raw Price' },
            { id: 'pricePerUnit', title: 'Price per Unit (PLN/GB)' }
        ]
    });
    await csvWriter.writeRecords(products);
}

// Print products to console
function logProducts(products) {
    console.table(products, ['title', 'memory', 'price', 'pricePerUnit']);
    // products.forEach(product => {
    //     console.log(`\nTitle: ${product.title}`);
    //     console.log(`Memory: ${product.memory || 'N/A'}`);
    //     console.log(`Price: ${product.price ? product.price + ' PLN' : 'N/A'}`);
    //     console.log(`Price per Unit: ${product.pricePerUnit ? product.pricePerUnit.toFixed(2) + ' PLN/GB' : 'N/A'}`);
    //     console.log('-'.repeat(80));
    // });
}


// Main scraping process
// =========================
async function scrapeProducts() {
    console.log('Starting browser...');
    let browser;

    try {
        const result = await open_page(URL);

        browser = result.browser;
        const page = result.page;

        const MAX_PAGES = 3;
        const allProducts = [];
        let pageNumber = 1;

        while (pageNumber <= MAX_PAGES) {
            console.log(`Scraping page ${pageNumber} (URL: ${page.url()})`);
            await debug_snapshot(page, `Page_${pageNumber}`);

            const products = await extractProductsFromPage(page);
            allProducts.push(...products);

            const nextHref = await findNextPage(page);
            if (!nextHref || nextHref === page.url()) break;

            pageNumber++;
            await page.goto(nextHref, { waitUntil: 'networkidle2' });
            await new Promise(r => setTimeout(r, 1000));
        }

        allProducts.sort((a, b) => {
            const av = a.pricePerUnit ?? Infinity;
            const bv = b.pricePerUnit ?? Infinity;
            return av - bv;
        });

        await saveToCSV(allProducts, outputPath);
        console.log(`Scraped ${allProducts.length} products. Data saved to ${outputPath}`);
        logProducts(allProducts);

    } catch (error) {
        console.error('Error during scraping:', error);
    } finally {
        if (browser) await browser.close();
    }
}

// Run the scraper
scrapeProducts();
