import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as puppeteer from 'puppeteer';
import { PickupLocation } from '../entities/pickup-location.entity';
import { User, UserRole } from '../entities/user.entity';
import { Product } from '../entities/product.entity';

@Injectable()
export class ImportService {
    constructor(
        @InjectRepository(PickupLocation)
        private locationRepo: Repository<PickupLocation>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        @InjectRepository(Product)
        private productRepo: Repository<Product>,
    ) { }

    async getLocations() {
        return this.locationRepo.find();
    }

    async getUsers() {
        return this.userRepo.find({
            where: [
                { role: UserRole.SELLER },
                { role: UserRole.LOCAL_STORE },
            ],
            select: ['id', 'name', 'email', 'avatar_url', 'role'], // Don't expose password
        });
    }

    async batchImport(urls: string[]) {
        const results = {
            success: [] as any[],
            failed: [] as any[]
        };

        // Get default location (first one)
        const defaultLocation = await this.locationRepo.findOne({ where: {} });
        if (!defaultLocation) {
            throw new Error('No pickup locations found. Please create one first.');
        }

        for (const url of urls) {
            if (!url.trim()) continue;

            try {
                // 1. Parse
                const parsed = await this.parseProduct(url);

                // 2. Create Product Entity
                // Need to fetch seller entity reference
                const seller = await this.userRepo.findOne({ where: { id: parsed.seller_id } });

                const product = this.productRepo.create({
                    name: parsed.name,
                    description: parsed.description,
                    price: parsed.price,
                    image_urls: parsed.image_url ? [parsed.image_url] : [],
                    external_link: parsed.original_url,
                    category: parsed.category,
                    is_available: true,

                    seller: seller,
                    pickup_location: defaultLocation,

                });

                await this.productRepo.save(product);
                results.success.push({ url, name: parsed.name });

                // Delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 1500));

            } catch (e) {
                console.error(`Failed to import ${url}:`, e.message);
                results.failed.push({ url, error: e.message });
            }
        }

        return results;
    }


    async fetchShopProducts(shopUrl: string) {
        console.log(`Fetching products from shop: ${shopUrl}`);
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        try {
            const page = await browser.newPage();

            // Block heavy resources
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                const resourceType = req.resourceType();
                if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            // Navigate to search page to ensure list view
            // Construct search URL: https://shopee.tw/shop/123/search
            // Or just append /search if it's a username url
            let searchUrl = shopUrl;
            if (!shopUrl.endsWith('/search')) {
                searchUrl = `${shopUrl.replace(/\/$/, '')}/search`;
            }

            console.log(`Navigating to ${searchUrl}...`);
            await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

            // Scroll to load lazy items
            await page.evaluate(async () => {
                await new Promise((resolve) => {
                    let totalHeight = 0;
                    const distance = 100;
                    const timer = setInterval(() => {
                        const scrollHeight = document.body.scrollHeight;
                        window.scrollBy(0, distance);
                        totalHeight += distance;

                        if (totalHeight >= scrollHeight) {
                            clearInterval(timer);
                            resolve(true);
                        }
                    }, 100);
                });
            });

            // Wait a bit after scroll
            await new Promise(r => setTimeout(r, 2000));

            // Extract items
            const products = await page.evaluate(() => {
                const results: any[] = [];
                // Selector strategy: Look for links with /product/ in href
                // and have some height/width to avoid hidden links
                const links = Array.from(document.querySelectorAll('a[href*="/product/"]'));

                links.forEach((a: any) => {
                    // Try to find container
                    // Shopee structure is complex and changes. 
                    // We look for nearest relative parent that might be a card

                    const name = a.innerText.split('\n')[0]; // First line is usually name
                    if (!name) return;

                    const href = a.href;
                    // Simple distinct check
                    if (!results.find(r => r.url === href)) {
                        // Attempt to find price
                        // Price is usually in a sibling or child
                        // Let's just return basic info for now
                        results.push({
                            name: name,
                            url: href,
                            price: 0, // Placeholder, hard to extract reliably without specific selectors
                            image: ''
                        });
                    }
                });
                return results;
            });

            console.log(`Found ${products.length} products`);
            return products.slice(0, 50); // Limit to 50

        } catch (e) {
            console.error('Puppeteer Error:', e);
            throw new InternalServerErrorException(`Failed to fetch shop products: ${e.message}`);
        } finally {
            await browser.close();
        }
    }

    async parseProduct(url: string) {
        let targetUrl = url;
        try {
            // Decode URL if it's encoded
            targetUrl = decodeURIComponent(url);
        } catch (e) {
            targetUrl = url;
        }

        try {
            // 0. Shopee API Special Handling
            if (targetUrl.includes('shopee') || targetUrl.includes('xiapi')) {
                const match = targetUrl.match(/-i\.(\d+)\.(\d+)/);
                if (match) {
                    const shopId = match[1];
                    const itemId = match[2];
                    const apiUrl = `https://shopee.tw/api/v4/item/get?itemid=${itemId}&shopid=${shopId}`;
                    try {
                        const { data: apiResp } = await axios.get(apiUrl, {
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                                'Referer': 'https://shopee.tw/',
                                'X-Requested-With': 'XMLHttpRequest'
                            },
                            timeout: 5000
                        });

                        if (apiResp && apiResp.data) {
                            const d = apiResp.data;
                            const price = d.price_min ? d.price_min / 100000 : (d.price / 100000);
                            const imageId = d.image || (d.images && d.images[0]);
                            const imageUrl = imageId ? `https://down-tw.img.susercontent.com/file/${imageId}` : '';
                            const options = d.models ? d.models.map((m: any) => m.name).filter((n: string) => n) : [];

                            // Map generic status
                            return {
                                name: d.name,
                                description: d.description || '',
                                price: price || 0,
                                image_url: imageUrl,
                                image_urls: d.images ? d.images.map((img: string) => `https://down-tw.img.susercontent.com/file/${img}`) : [],
                                original_url: targetUrl,
                                category: '外部匯入',
                                is_available: true,
                                options: options,
                                original_seller_name: `Shopee Seller (${shopId})`,
                            };
                        }
                    } catch (e) {
                        console.log('Shopee API extraction failed:', e.message);
                        // Continue to standard scraping
                    }
                }
            }

            const { data } = await axios.get(encodeURI(targetUrl), {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
                    'Referer': 'https://www.google.com/',
                },
                timeout: 10000,
            });

            const $ = cheerio.load(data);

            const title =
                $('meta[property="og:title"]').attr('content') ||
                $('title').text().trim();

            const image =
                $('meta[property="og:image"]').attr('content') ||
                $('meta[name="twitter:image"]').attr('content') ||
                $('link[rel="image_src"]').attr('href');

            const description =
                $('meta[property="og:description"]').attr('content') ||
                $('meta[name="description"]').attr('content');

            // Extraction variables
            let price = 0;
            let sellerName = '';
            let options: string[] = [];

            // 1. Try Schema.org JSON-LD
            $('script[type="application/ld+json"]').each((_, el) => {
                try {
                    const json = JSON.parse($(el).html());

                    // Helper to find price and offers
                    const extractData = (obj: any) => {
                        if (!obj) return;

                        // Price
                        if (!price) {
                            if (obj['@type'] === 'Offer' || obj['@type'] === 'AggregateOffer') {
                                if (obj.price) price = Number(obj.price);
                                if (obj.lowPrice) price = Number(obj.lowPrice);
                            }
                        }

                        // Seller
                        if (!sellerName) {
                            if (obj.offers) {
                                if (obj.offers.seller && obj.offers.seller.name) {
                                    sellerName = obj.offers.seller.name;
                                } else if (Array.isArray(obj.offers)) {
                                    // Check first offer
                                    if (obj.offers[0]?.seller?.name) sellerName = obj.offers[0].seller.name;
                                }
                            }
                            // Direct seller field (rare)
                            if (obj.seller && obj.seller.name) sellerName = obj.seller.name;
                            if (obj.brand && obj.brand.name) sellerName = obj.brand.name; // Fallback
                        }

                        // Recursion for offers (if nested deeply)
                        if (obj.offers) {
                            if (Array.isArray(obj.offers)) {
                                obj.offers.forEach(extractData);
                            } else {
                                extractData(obj.offers);
                            }
                        }
                    };

                    extractData(json);
                } catch (e) {
                    console.error('JSON-LD parse error', e);
                }
            });

            // Fallback for Seller Name if not found in JSON-LD
            if (!sellerName) {
                const shopName = $('.shop-name').text().trim() ||
                    $('.preferred-seller-badge').next().text().trim() ||
                    $('div[class*="shop-name"]').text().trim();
                if (shopName) sellerName = shopName;
            }

            // Options extraction (simplified for Googlebot response)
            // Googlebot often sees a simplified page without the full React state.
            // We search for specific variation text if available.
            try {
                const scriptContent = $('script').filter((i, el) => {
                    const html = $(el).html();
                    return html && (html.includes('tier_variations') || html.includes('"models"'));
                }).html();

                if (scriptContent) {
                    const match = scriptContent.match(/"models":\s*(\[.*?\])/);
                    if (match) {
                        const models = JSON.parse(match[1]);
                        options = models.map((m: any) => m.name).filter((n: string) => n);
                    }
                }

                // Fallback: Extract from Description if no structured models found
                if (options.length === 0 && description) {
                    // Look for lines starting with "規格", "顏色", "款式", "Options", "Variants"
                    const lines = description.split('\n');
                    for (const line of lines) {
                        const trimmed = line.trim();
                        // Simple heuristic: if line contains "規格" or "顏色" and has commas/slashes
                        if ((trimmed.includes('規格') || trimmed.includes('顏色') || trimmed.includes('款式')) &&
                            (trimmed.includes(',') || trimmed.includes('/') || trimmed.includes('，') || trimmed.includes('、'))) {
                            // Extract the part after the colon?
                            const parts = trimmed.split(/[:：]/);
                            if (parts.length > 1) {
                                const values = parts[1].split(/[,/，、]/).map(v => v.trim()).filter(v => v);
                                if (values.length > 1) {
                                    options = [...options, ...values];
                                }
                            }
                        }
                    }
                    // Deduplicate
                    options = [...new Set(options)];
                }

            } catch (e) {
                console.log('Option extraction failed:', e.message);
            }
            // 2. Platform specific extraction
            if (targetUrl.includes('shopee')) {
                // Shopee is client-side rendered, meta tags are best bet without Puppeteer
                if (!price) {
                    const metaPrice = $('meta[property="product:price:amount"]').attr('content');
                    if (metaPrice) price = Number(metaPrice);
                }
                // Shopee doesn't server-side render seller usually
            } else if (targetUrl.includes('ruten')) {
                if (!price) {
                    const priceText = $('.rt-text-price-integer').first().text();
                    if (priceText) price = Number(priceText.replace(/[^0-9.]/g, ''));
                }
                if (!sellerName) {
                    sellerName = $('.seller-disc .user-name, .seller-name').first().text().trim();
                }
                // Options
                $('.item-spec-value').each((_, el) => {
                    const txt = $(el).text().trim();
                    if (txt) options.push(txt);
                });
            } else if (targetUrl.includes('yahoo')) {
                if (!price) {
                    const priceEl = $('.main-intro .price').first().text() || $('.current-price').first().text();
                    if (priceEl) price = Number(priceEl.replace(/[^0-9.]/g, ''));
                }
                if (!sellerName) {
                    sellerName = $('.seller-name, .store-name').first().text().trim();
                }
            }

            // 3. Fallback for options (heuristics)
            if (options.length === 0) {
                // Look for common variant containers
                $('div[class*="sku"], div[class*="variant"], ul[class*="attr"]').each((_, el) => {
                    if (options.length > 5) return; // Limit
                    const txt = $(el).text().trim();
                    if (txt && txt.length < 50) options.push(txt);
                });
            }

            // Clean up options
            options = [...new Set(options)].filter(o => o.length > 1 && o.length < 30).slice(0, 5);

            // 3. Auto-create Seller Account
            let sellerId = '';
            if (sellerName) {
                try {
                    sellerId = await this.findOrCreateSeller(sellerName);
                } catch (e) {
                    console.error('Failed to auto-create seller:', e);
                }
            }

            return {
                name: title,
                description: description || '',
                price: price || 0,
                image_url: image || '',
                image_urls: [],
                original_url: targetUrl,
                category: '外部匯入',
                is_available: true,
                options: options,
                original_seller_name: sellerName || 'Shopee Seller',
                seller_id: sellerId,
            };
        } catch (e) {
            console.log('Product parsing failed:', e.message);
            throw new Error('無法解析此商品網址 (支援 Shopee, Yahoo, Ruten)');
        }
    }

    private async findOrCreateSeller(name: string): Promise<string> {
        if (!name) return '';
        // 1. Try to find by name
        const existing = await this.userRepo.findOne({ where: { name } });
        if (existing) return existing.id;

        // 2. Create new
        const slug = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10).toLowerCase() || 'seller';
        const email = `import_${slug}_${Date.now()}@shopee.local`;

        try {
            const newUser = this.userRepo.create({
                name: name,
                email: email,
                password: '$2b$10$EpIxQiwdc6wu62.62Pr0mu.somehashedpassword',
                role: UserRole.SELLER,
                is_active: true,
                avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
            } as any);

            const saved = await this.userRepo.save(newUser);
            const user = Array.isArray(saved) ? saved[0] : saved;
            return user.id;
        } catch (e) {
            console.log('Create user failed:', e.message);
            return '';
        }
    }
}
