const axios = require('axios');

async function run() {
    try {
        // 1. Get Seller ID
        console.log('Fetching users...');
        // We need to login first if endpoints are protected, but ImportController is public (no @UseGuards at controller level in snippet).
        // Let's try without auth first.
        const usersResp = await axios.get('http://localhost:3001/api/import/users');
        // Assuming usersResp.data is User[]
        const user = usersResp.data.find(u => u.email && u.email.includes('seller'));
        if (!user) throw new Error('No seller found among ' + usersResp.data.length + ' users');
        console.log('Using Seller:', user.name, user.id);

        // 2. Get Location ID
        console.log('Fetching locations...');
        const locResp = await axios.get('http://localhost:3001/api/import/locations');
        const loc = locResp.data[0];
        if (!loc) throw new Error('No location found');
        console.log('Using Location:', loc.name, loc.id);

        // 3. Parse Shopee URL
        // Provided URL in Step 827
        const fullUrl = "https://shopee.tw/%E8%BB%8A%E7%94%A8%E7%A9%BA%E8%AA%BF%E9%A6%99%E8%96%B0%E7%93%B6-%E8%BB%8A%E7%94%A8%E5%87%BA%E9%A2%A8%E5%8F%A3%E9%A6%99%E8%96%B0%E7%93%B6-%E6%93%B4%E9%A6%99%E7%A9%BA%E7%93%B6-%E9%A6%99%E6%B0%9B%E7%93%B6-%E6%93%B4%E9%A6%99%E7%93%B6-%E9%A6%99%E6%B0%B4%E7%93%B6-%E8%96%B0%E9%A6%99%E7%93%B6-%E7%B2%BE%E6%B2%B9%E7%93%B6-%E6%B1%BD%E8%BB%8A%E9%A6%99%E6%B0%B4%E7%93%B6-%E8%BB%8A%E7%94%A8%E9%A6%99-i.162346875.11706173921?extraParams=%7B%22display_model_id%22%3A82230650710%2C%22model_selection_logic%22%3A3%7D";

        console.log('Parsing URL...');
        const parseResp = await axios.post('http://localhost:3001/api/import/parse', { url: fullUrl });
        const productData = parseResp.data;
        console.log('Parsed successfully:', productData.name);

        // 4. Create Product
        const payload = {
            name: productData.name,
            description: productData.description || '',
            price: productData.price,
            image_urls: productData.image_urls || [productData.image_url],
            category: productData.category,
            is_available: true,
            seller_id: user.id,
            pickup_location_id: loc.id,
            stock: 10,
            external_link: productData.original_url
        };

        // Append options to description
        if (productData.options && productData.options.length) {
            payload.description += '\n\nOptions: ' + productData.options.join(', ');
        }
        // Append original seller
        if (productData.original_seller_name) {
            payload.description += '\n\nSource: ' + productData.original_seller_name;
        }

        console.log('Creating product...');
        try {
            const createResp = await axios.post('http://localhost:3001/api/products', payload);
            console.log('Product created! ID:', createResp.data.id);

            // Output for Agent to capture
            console.log('IMPORTED_PRODUCT_ID:' + createResp.data.id);
        } catch (createError) {
            // If 401 Unauthorized, we might need token.
            console.error('Create failed:', createError.response ? createError.response.status : createError.message);
            if (createError.response && createError.response.status === 401) {
                console.log('Auth required. Logging in...');
                // Login as seller
                const loginResp = await axios.post('http://localhost:3001/api/auth/login', {
                    email: 'seller1@example.com',
                    password: 'password123'
                });
                const token = loginResp.data.access_token;
                console.log('Got token. Retrying create...');
                const retryResp = await axios.post('http://localhost:3001/api/products', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('Product created! ID:', retryResp.data.id);
                console.log('IMPORTED_PRODUCT_ID:' + retryResp.data.id);
            } else {
                console.error('Detailed Error:', JSON.stringify(createError.response.data));
            }
        }

    } catch (e) {
        console.error('Error:', e.response ? e.response.data : e.message);
        if (e.response) console.error('Status:', e.response.status);
    }
}

run();
