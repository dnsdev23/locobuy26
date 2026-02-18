const axios = require('axios');

async function testBatch() {
    const urls = [
        'https://shopee.tw/product/162346875/11706173921', // Valid (The one we fixed)
        'https://shopee.tw/product/invalid/url',          // Invalid
    ];

    console.log('Testing Batch Import with', urls.length, 'URLs...');

    try {
        const res = await axios.post('http://localhost:3001/api/import/batch', { urls });
        console.log('Status:', res.status);
        console.log('Results:', JSON.stringify(res.data, null, 2));

        if (res.data.success.length > 0 && res.data.failed.length > 0) {
            console.log('SUCCESS: Handled both properties correctly.');
        } else {
            console.log('WARNING: Unexpected results distribution.');
        }

    } catch (e) {
        console.error('Batch Import Failed:', e.message);
        if (e.response) {
            console.error('Data:', e.response.data);
        }
    }
}

testBatch();
