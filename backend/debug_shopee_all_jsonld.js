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

        // Iterate ALL JSON-LD scripts
        $('script[type="application/ld+json"]').each((i, el) => {
            const json = $(el).html();
            try {
                const data = JSON.parse(json);
                console.log(`\n--- JSON-LD Script #${i + 1} Type: ${data['@type']} ---`);

                if (data['@type'] === 'Product') {
                    console.log('Name:', data.name);

                    // Seller?
                    if (data.offers && data.offers.seller) {
                        console.log('Seller (from offers):', data.offers.seller.name);
                    }

                    // Variants? (Look for 'mpn', 'sku', or custom fields)
                    // Shopee JSON-LD often has minimalist offers
                    console.log('Keys in Product:', Object.keys(data));
                }
            } catch (e) {
                console.log(`Script #${i + 1} Parse Error: ${e.message}`);
            }
        });

    } catch (e) {
        console.error('Error:', e.message);
    }
}
analyze();
