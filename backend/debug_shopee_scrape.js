const axios = require('axios');
const cheerio = require('cheerio');

async function scrape() {
    // Encoded URL from user (Step 827)
    // https://shopee.tw/%...
    const url = "https://shopee.tw/%E8%BB%8A%E7%94%A8%E7%A9%BA%E8%AA%BF%E9%A6%99%E8%96%B0%E7%93%B6-%E8%BB%8A%E7%94%A8%E5%87%BA%E9%A2%A8%E5%8F%A3%E9%A6%99%E8%96%B0%E7%93%B6-%E6%93%B4%E9%A6%99%E7%A9%BA%E7%93%B6-%E9%A6%99%E6%B0%9B%E7%93%B6-%E6%93%B4%E9%A6%99%E7%93%B6-%E9%A6%99%E6%B0%B4%E7%93%B6-%E8%96%B0%E9%A6%99%E7%93%B6-%E7%B2%BE%E6%B2%B9%E7%93%B6-%E6%B1%BD%E8%BB%8A%E9%A6%99%E6%B0%B4%E7%93%B6-%E8%BB%8A%E7%94%A8%E9%A6%99-i.162346875.11706173921";

    console.log('Scraping:', url);
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
            }
        });
        const $ = cheerio.load(data);
        const title = $('title').text();
        const ogTitle = $('meta[property="og:title"]').attr('content');
        const desc = $('meta[name="description"]').attr('content');

        console.log('Title:', title);
        console.log('OG Title:', ogTitle);
        console.log('Description:', desc);

        // Find JSON-LD?
        $('script[type="application/ld+json"]').each((i, el) => {
            console.log('JSON-LD found:', $(el).html().substring(0, 500));
        });
    } catch (e) {
        console.error('Error:', e.message);
    }
}
scrape();
