const axios = require('axios');

async function test() {
    // Use the ID from Step 827 (which resulted in "新商品")
    const shopId = '162346875';
    const itemId = '11706173921';
    const apiUrl = `https://shopee.tw/api/v4/item/get?itemid=${itemId}&shopid=${shopId}`;

    console.log('Fetching:', apiUrl);
    try {
        const res = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://shopee.tw/',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        console.log('Status:', res.status);
        console.log('Keys:', Object.keys(res.data));

        if (res.data.data) {
            console.log('Data Name:', res.data.data.name);
            console.log('Data Price (raw):', res.data.data.price);
            console.log('Data Price Min (raw):', res.data.data.price_min);
            console.log('Data Models:', res.data.data.models ? res.data.data.models.length : 'None');
        } else {
            console.log('No Data field. Body:', JSON.stringify(res.data, null, 2).substring(0, 1000));
        }
    } catch (e) {
        console.error('Error:', e.message);
        if (e.response) console.log('Response:', e.response.status, e.response.data);
    }
}
test();
