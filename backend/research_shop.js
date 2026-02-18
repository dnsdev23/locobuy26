const axios = require('axios');

const SHOP_ID = '162346875';

async function researchShop() {
    console.log(`Testing API with Referer...`);

    // API Endpoint
    const listUrl = `https://shopee.tw/api/v4/shop/search_items?filter_sold_out=1&limit=30&offset=0&order=desc&shopid=${SHOP_ID}&sort_type=1`;

    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': `https://shopee.tw/shop/${SHOP_ID}/search`,
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
        };

        const res = await axios.get(listUrl, { headers });
        console.log('Status:', res.status);
        console.log('Items:', res.data.items ? res.data.items.length : 0);

        if (res.data.items && res.data.items.length > 0) {
            console.log('Sample:', res.data.items[0].item_basic.name);
        }

    } catch (e) {
        console.error('Error:', e.message);
        if (e.response) console.log('Status:', e.response.status);
    }
}

researchShop();
