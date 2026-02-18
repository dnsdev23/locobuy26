const puppeteer = require('puppeteer');

const SHOP_ID = '162346875';
const URL = `https://shopee.tw/shop/${SHOP_ID}/search`;

async function testPuppeteer() {
    console.log(`Launching Browser...`);
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();

        // Block images/fonts to speed up
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        console.log(`Navigating to ${URL}...`);
        await page.goto(URL, { waitUntil: 'networkidle2' });

        // Wait for items to load
        // Shopee items usually have a class like .shop-search-result-view__item or similar
        // Let's perform a generic selector check

        const title = await page.title();
        console.log(`Page Title: ${title}`);

        // Scroll down a bit to trigger lazy loading
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await new Promise(r => setTimeout(r, 2000));

        // Extract items
        const items = await page.evaluate(() => {
            const results = [];
            // Try different selectors commonly used by Shopee
            const nodes = document.querySelectorAll('a[href*="/product/"]');

            nodes.forEach(n => {
                const name = n.innerText.split('\n')[0]; // Simple logic
                const href = n.getAttribute('href');
                if (name && href) {
                    results.push({ name, href });
                }
            });
            return results;
        });

        console.log(`Found ${items.length} items`);
        if (items.length > 0) {
            console.log('Sample:', items[0]);
        }

    } catch (e) {
        console.error('Puppeteer Error:', e);
    } finally {
        await browser.close();
    }
}

// Check if puppeteer is installed
try {
    require.resolve('puppeteer');
    testPuppeteer();
} catch (e) {
    console.log('Puppeteer not installed. Please run: npm install puppeteer');
}
