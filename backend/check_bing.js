const axios = require('axios');

async function check_bing() {
    const encodedUrl = "https://shopee.tw/%E8%BB%8A%E7%94%A8%E7%A9%BA%E8%AA%BF%E9%A6%99%E8%96%B0%E7%93%B6-%E8%BB%8A%E7%94%A8%E5%87%BA%E9%A2%A8%E5%8F%A3%E9%A6%99%E8%96%B0%E7%93%B6-%E6%93%B4%E9%A6%99%E7%A9%BA%E7%93%B6-%E9%A6%99%E6%B0%9B%E7%93%B6-%E6%93%B4%E9%A6%99%E7%93%B6-%E9%A6%99%E6%B0%B4%E7%93%B6-%E8%96%B0%E9%A6%99%E7%93%B6-%E7%B2%BE%E6%B2%B9%E7%93%B6-%E6%B1%BD%E8%BB%8A%E9%A6%99%E6%B0%B4%E7%93%B6-%E8%BB%8A%E7%94%A8%E9%A6%99-i.162346875.11706173921";
    const target = encodeURI(decodeURIComponent(encodedUrl));

    console.log('Testing Bingbot...');
    try {
        const res = await axios.get(target, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Bingbot/2.0; +http://www.bing.com/bingbot.htm)',
                'Referer': 'https://www.bing.com/',
                'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7'
            },
            timeout: 10000
        });

        if (res.data.includes('models') || res.data.includes('tier_variations')) {
            console.log('SUCCESS: Bingbot found models/variations!');
            const match = res.data.match(/"models":\s*(\[.*?\])/);
            if (match) console.log(match[1].substring(0, 200));
        } else {
            console.log('FAIL: Bingbot also served simplified page.');
        }

    } catch (e) {
        console.error('Error:', e.message);
    }
}
check_bing();
