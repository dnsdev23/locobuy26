const axios = require('axios');

async function test_import() {
    const encodedUrl = "https://shopee.tw/%E8%BB%8A%E7%94%A8%E7%A9%BA%E8%AA%BF%E9%A6%99%E8%96%B0%E7%93%B6-%E8%BB%8A%E7%94%A8%E5%87%BA%E9%A2%A8%E5%8F%A3%E9%A6%99%E8%96%B0%E7%93%B6-%E6%93%B4%E9%A6%99%E7%A9%BA%E7%93%B6-%E9%A6%99%E6%B0%9B%E7%93%B6-%E6%93%B4%E9%A6%99%E7%93%B6-%E9%A6%99%E6%B0%B4%E7%93%B6-%E8%96%B0%E9%A6%99%E7%93%B6-%E7%B2%BE%E6%B2%B9%E7%93%B6-%E6%B1%BD%E8%BB%8A%E9%A6%99%E6%B0%B4%E7%93%B6-%E8%BB%8A%E7%94%A8%E9%A6%99-i.162346875.11706173921";

    console.log('Testing Import with URL:', encodedUrl.substring(0, 50) + '...');

    try {
        const res = await axios.post('http://localhost:3001/api/import/parse', { url: encodedUrl });

        console.log('Status:', res.status);
        console.log('Parsed Data:');
        console.log(' - Name:', res.data.name);
        console.log(' - Seller Name:', res.data.original_seller_name);
        console.log(' - Seller ID:', res.data.seller_id); // Check this!
        console.log(' - Options Count:', res.data.options ? res.data.options.length : 0);
        console.log(' - Options:', res.data.options);
        console.log(' - Description Preview:', (res.data.description || '').substring(0, 200).replace(/\n/g, ' '));

        // Validation
        if (res.data.original_seller_name && res.data.original_seller_name.includes('負評王')) {
            console.log('SUCCESS: Seller Name extracted correctly!');
        }

        if (res.data.options && res.data.options.length > 0) {
            console.log('SUCCESS: Options extracted via fallback!');
        } else {
            console.log('WARNING: Still no options found. Check description content above.');
        }

    } catch (e) {
        console.error('Import Failed:', e.message);
    }
}
test_import();
