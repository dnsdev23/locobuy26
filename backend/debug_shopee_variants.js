const axios = require('axios');
const cheerio = require('cheerio');

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

        // 1. JSON-LD for Seller
        $('script[type="application/ld+json"]').each((i, el) => {
            const json = $(el).html();
            try {
                const data = JSON.parse(json);
                if (data['@type'] === 'Product') {
                    console.log('Product Name:', data.name);
                    if (data.offers && data.offers.seller) {
                        console.log('Seller Name:', data.offers.seller.name);
                    }
                    console.log('Offers Type:', Array.isArray(data.offers) ? 'Array' : typeof data.offers);
                    if (data.offers) {
                        console.log('Offers Content:', JSON.stringify(data.offers).substring(0, 500));
                    }
                }
            } catch (e) { }
        });

        // 2. Global State for Variants
        // Shopee usually puts full model list in window.__SHOPEE_SERVER_STATE__? No, maybe just initial state.
        // Or in a standard <script> that sets some global variable.
        // Let's dump all scripts that contain "models" or "tier_variations"
        $('script').each((i, el) => {
            const html = $(el).html();
            if (html && (html.includes('models') || html.includes('tier_variations'))) {
                console.log(`Script #${i} contains models/variations!`);
                const match = html.match(/"models":(\[.*?\])/);
                if (match) {
                    console.log('Models JSON found!');
                    console.log(match[1].substring(0, 500));
                }

                // Try parsing tier_variations
                const matchTier = html.match(/"tier_variations":(\[.*?\])/);
                if (matchTier) {
                    console.log('Tier Variations JSON found!');
                    console.log(matchTier[1].substring(0, 500));
                }
            }
        });

    } catch (e) {
        console.error('Error:', e.message);
    }
}
analyze();
