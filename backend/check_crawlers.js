const axios = require('axios');

// Full URL with Chinese characters (Encoded)
// This simulates exactly what the frontend sends to backend (Step 827)
const encodedUrl = "https://shopee.tw/%E8%BB%8A%E7%94%A8%E7%A9%BA%E8%AA%BF%E9%A6%99%E8%96%B0%E7%93%B6-%E8%BB%8A%E7%94%A8%E5%87%BA%E9%A2%A8%E5%8F%A3%E9%A6%99%E8%96%B0%E7%93%B6-%E6%93%B4%E9%A6%99%E7%A9%BA%E7%93%B6-%E9%A6%99%E6%B0%9B%E7%93%B6-%E6%93%B4%E9%A6%99%E7%93%B6-%E9%A6%99%E6%B0%B4%E7%93%B6-%E8%96%B0%E9%A6%99%E7%93%B6-%E7%B2%BE%E6%B2%B9%E7%93%B6-%E6%B1%BD%E8%BB%8A%E9%A6%99%E6%B0%B4%E7%93%B6-%E8%BB%8A%E7%94%A8%E9%A6%99-i.162346875.11706173921";

// Decoded URL (What backend logic uses internally)
const decodedUrl = decodeURIComponent(encodedUrl);

console.log('Encoded URL:', encodedUrl.substring(0, 50) + '...');
console.log('Decoded URL:', decodedUrl.substring(0, 50) + '...');

const UAs = [
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

async function check() {
    console.log('\n--- Testing Scraping ---');

    for (const ua of UAs) {
        console.log(`\nTesting User-Agent: ${ua.substring(0, 30)}...`);
        try {
            // Simulating the backend logic:
            // 1. Backend decodes URL (done above)
            // 2. Backend encodes specific parts?
            // My fix used: encodeURI(targetUrl) where targetUrl = decodedUrl

            const target = encodeURI(decodedUrl);
            console.log('Requesting:', target.substring(0, 50) + '...');

            const res = await axios.get(target, {
                headers: {
                    'User-Agent': ua,
                    'Referer': 'https://www.google.com/',
                    'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7'
                },
                timeout: 10000
            });

            console.log('Status:', res.status);
            console.log('Content-Type:', res.headers['content-type']);
            console.log('Body Length:', res.data.length);

            if (typeof res.data === 'string') {
                const titleMatch = res.data.match(/<title>(.*?)<\/title>/);
                console.log('Title Tag:', titleMatch ? titleMatch[1] : 'Not Found');

                if (res.data.includes('application/ld+json')) {
                    console.log('SUCCESS! Found ld+json');
                } else {
                    console.log('No ld+json found');
                }
            }
        } catch (e) {
            console.log('Error:', e.message, e.response ? e.response.status : '');
        }
    }
}
check();
