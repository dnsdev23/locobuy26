const axios = require('axios');

async function test() {
    // 162346875 / 11706173921
    const shopId = '162346875';
    const itemId = '11706173921';
    const apiUrl = `https://shopee.tw/api/v4/item/get?itemid=${itemId}&shopid=${shopId}`;

    console.log('Fetching:', apiUrl);
    try {
        const res = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
                'Referer': 'https://shopee.tw/',
                'Origin': 'https://shopee.tw',
                'X-Requested-With': 'XMLHttpRequest',
                'X-Shopee-Language': 'zh-Hant',
                'X-Api-Source': 'pc',
                'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"'
            }
        });
        console.log('Status:', res.status);
        console.log('Keys:', Object.keys(res.data));

        if (res.data.data) {
            console.log('Data Name:', res.data.data.name);
            console.log('Data Price:', res.data.data.price_min / 100000); // Usually 100000 scale
        } else {
            console.log('No Data field. Body:', JSON.stringify(res.data).substring(0, 500));
        }
    } catch (e) {
        console.error('Error:', e.message);
        if (e.response) console.log('Response:', e.response.status, e.response.data);
    }
}
test();
