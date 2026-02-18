const axios = require('axios');
const cheerio = require('cheerio');

// Use the problematic URL
const encodedUrl = "https://shopee.tw/%E8%BB%8A%E7%94%A8%E7%A9%BA%E8%AA%BF%E9%A6%99%E8%96%B0%E7%93%B6-%E8%BB%8A%E7%94%A8%E5%87%BA%E9%A2%A8%E5%8F%A3%E9%A6%99%E8%96%B0%E7%93%B6-%E6%93%B4%E9%A6%99%E7%A9%BA%E7%93%B6-%E9%A6%99%E6%B0%9B%E7%93%B6-%E6%93%B4%E9%A6%99%E7%93%B6-%E9%A6%99%E6%B0%B4%E7%93%B6-%E8%96%B0%E9%A6%99%E7%93%B6-%E7%B2%BE%E6%B2%B9%E7%93%B6-%E6%B1%BD%E8%BB%8A%E9%A6%99%E6%B0%B4%E7%93%B6-%E8%BB%8A%E7%94%A8%E9%A6%99-i.162346875.11706173921";
const decodedUrl = decodeURIComponent(encodedUrl);
const target = encodeURI(decodedUrl);

async function analyze() {
    console.log('Analyzing:', target.substring(0, 50) + '...');
    try {
        const res = await axios.get(target, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                'Referer': 'https://www.google.com/',
                'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7'
            }
        });

        const $ = cheerio.load(res.data);

        // 1. Check JSON-LD for Offers/Variants/Seller
        const jsonLd = $('script[type="application/ld+json"]').html();
        if (jsonLd) {
            console.log('--- JSON-LD Data ---');
            try {
                const data = JSON.parse(jsonLd);
                // Check Seller
                if (data.offers && data.offers.seller) {
                    console.log('Seller:', data.offers.seller.name);
                } else if (data.seller) {
                    console.log('Seller (Direct):', data.seller.name);
                }

                // Check Variants (often in data.mpn, data.sku, or data.offers)
                if (Array.isArray(data.offers)) {
                    console.log('Offer Count:', data.offers.length);
                    // data.offers usually just has price/avail, maybe not variant name
                }
                // Shopee might put variants in description or separate fields
            } catch (e) {
                console.log('JSON-LD Parse Error:', e.message);
            }
        }

        // 2. Check Global State Scripts
        // Look for window.__SHOPEE_SERVER_STATE__ or similar
        $('script').each((i, el) => {
            const content = $(el).html();
            if (content && content.includes('__SHOPEE_SERVER_STATE__')) {
                console.log('--- Shopee Server State Found ---');
                // Extract part of it to verify structure? Too huge to dump.
                // Just confirm existence.
            }
            if (content && content.includes('models')) {
                console.log('--- Script with "models" found ---');
                // Try to extract models
                const match = content.match(/"models":\s*(\[.*?\])/);
                if (match) {
                    console.log('Models snippet:', match[1].substring(0, 200));
                }
            }
        });

    } catch (e) {
        console.error('Error:', e.message);
    }
}
analyze();
