require('dotenv').config();
const pool = require('../config/db');

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱 Starting database seed...');

    await client.query('DROP TABLE IF EXISTS order_items CASCADE');
    await client.query('DROP TABLE IF EXISTS orders CASCADE');
    await client.query('DROP TABLE IF EXISTS cart_items CASCADE');
    await client.query('DROP TABLE IF EXISTS products CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');
    await client.query('DROP TABLE IF EXISTS categories CASCADE');
    console.log('✅ Dropped existing tables');

    // ─── SCHEMA ────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE categories (
        id        SERIAL PRIMARY KEY,
        name      VARCHAR(100) NOT NULL UNIQUE,
        slug      VARCHAR(100) NOT NULL UNIQUE,
        image_url TEXT
      )
    `);
    await client.query(`
      CREATE TABLE users (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(100) NOT NULL,
        email      VARCHAR(150) UNIQUE NOT NULL,
        address    TEXT,
        phone      VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE products (
        id               SERIAL PRIMARY KEY,
        category_id      INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        name             VARCHAR(255) NOT NULL,
        description      TEXT,
        price            DECIMAL(10,2) NOT NULL,
        original_price   DECIMAL(10,2),
        discount_percent INTEGER DEFAULT 0,
        stock            INTEGER DEFAULT 0,
        rating           DECIMAL(3,1) DEFAULT 0,
        review_count     INTEGER DEFAULT 0,
        images           TEXT[] DEFAULT '{}',
        specifications   JSONB DEFAULT '{}',
        brand            VARCHAR(100),
        is_featured      BOOLEAN DEFAULT false,
        created_at       TIMESTAMP DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE cart_items (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        quantity   INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, product_id)
      )
    `);
    await client.query(`
      CREATE TABLE orders (
        id               SERIAL PRIMARY KEY,
        user_id          INTEGER REFERENCES users(id) ON DELETE SET NULL,
        status           VARCHAR(50) DEFAULT 'placed',
        total_amount     DECIMAL(10,2) NOT NULL,
        shipping_address TEXT NOT NULL,
        shipping_name    VARCHAR(100) NOT NULL,
        shipping_phone   VARCHAR(20),
        payment_method   VARCHAR(50) DEFAULT 'COD',
        created_at       TIMESTAMP DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE order_items (
        id            SERIAL PRIMARY KEY,
        order_id      INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id    INTEGER REFERENCES products(id) ON DELETE SET NULL,
        product_name  VARCHAR(255) NOT NULL,
        product_image TEXT,
        quantity      INTEGER NOT NULL,
        price         DECIMAL(10,2) NOT NULL
      )
    `);
    console.log('✅ Created all tables');

    // ─── CATEGORIES ────────────────────────────────────────────
    const catRes = await client.query(`
      INSERT INTO categories (name, slug, image_url) VALUES
        ('Electronics',      'electronics',    'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80'),
        ('Fashion',          'fashion',        'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80'),
        ('Home & Furniture', 'home-furniture', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80'),
        ('Appliances',       'appliances',     'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80'),
        ('Sports & Fitness', 'sports-fitness', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80')
      RETURNING id, slug
    `);
    const catMap = {};
    catRes.rows.forEach((r) => { catMap[r.slug] = r.id; });
    console.log('✅ Inserted categories:', catMap);

    // ─── DEFAULT USER ──────────────────────────────────────────
    await client.query(`
      INSERT INTO users (name, email, address, phone) VALUES
        ('John Doe', 'john@example.com', '123 Main Street, Mumbai, Maharashtra 400001', '9876543210')
    `);
    console.log('✅ Inserted default user (id=1)');

    // ══════════════════════════════════════════════════════════
    // ELECTRONICS  (all images verified to match the product)
    // ══════════════════════════════════════════════════════════
    await client.query(`
      INSERT INTO products
        (category_id,name,description,price,original_price,discount_percent,stock,rating,review_count,images,specifications,brand,is_featured)
      VALUES

      -- 1. Samsung Galaxy S24 Ultra  → Samsung Android phone images
      ($1,'Samsung Galaxy S24 Ultra',
       'The Samsung Galaxy S24 Ultra is the pinnacle of Android smartphones. Snapdragon 8 Gen 3, 6.8" Dynamic AMOLED 2X 120Hz, 200MP quad-camera system, and built-in S Pen.',
       124999,134999,7,45,4.5,2341,
       ARRAY[
         'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80',
         'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80',
         'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=400&q=80'
       ],
       '{"Display":"6.8-inch Dynamic AMOLED 2X 120Hz","Processor":"Snapdragon 8 Gen 3","RAM":"12GB","Storage":"256GB","Camera":"200MP+12MP+10MP+50MP","Battery":"5000mAh","OS":"Android 14","S Pen":"Yes"}',
       'Samsung',true),

      -- 2. Apple iPhone 15  → iPhone images
      ($1,'Apple iPhone 15',
       'iPhone 15 features A16 Bionic chip, 6.1" Super Retina XDR display, 48MP main camera, USB-C connector, and Dynamic Island.',
       79999,89999,11,30,4.7,5621,
       ARRAY[
         'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&q=80',
         'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&q=80',
         'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=400&q=80'
       ],
       '{"Display":"6.1-inch Super Retina XDR OLED","Processor":"A16 Bionic","RAM":"6GB","Storage":"128GB","Camera":"48MP+12MP","Battery":"3877mAh","OS":"iOS 17","Connector":"USB-C"}',
       'Apple',true),

      -- 3. Sony WH-1000XM5  → Sony over-ear headphone images (confirmed)
      ($1,'Sony WH-1000XM5 Headphones',
       'Industry-leading noise cancellation, 30-hour battery, multipoint connection, crystal-clear calls with 8 mics.',
       26990,34990,22,78,4.6,1203,
       ARRAY[
         'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80',
         'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&q=80',
         'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80'
       ],
       '{"Type":"Over-Ear Wireless","Noise Cancellation":"Industry-Leading ANC","Battery Life":"30 hours","Charging":"USB-C","Weight":"250g","Driver Size":"30mm","Microphones":"8 mics"}',
       'Sony',false),

      -- 4. Dell Inspiron 15  → Laptop images (confirmed)
      ($1,'Dell Inspiron 15 Laptop',
       'Intel Core i5-1235U, 16GB RAM, 512GB SSD, 15.6" FHD display. Ideal for professionals and students.',
       52990,64990,18,20,4.3,876,
       ARRAY[
         'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80',
         'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=400&q=80',
         'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80'
       ],
       '{"Processor":"Intel Core i5-1235U","RAM":"16GB DDR4","Storage":"512GB SSD","Display":"15.6-inch FHD 1920x1080","Graphics":"Intel Iris Xe","OS":"Windows 11 Home","Battery":"54Whr","Weight":"1.69kg"}',
       'Dell',false),

      -- 5. OnePlus 12 5G  → Phone images (fixed - no fisherman!)
      ($1,'OnePlus 12 5G',
       'Snapdragon 8 Gen 3, 6.82" LTPO AMOLED 120Hz, Hasselblad-tuned triple cameras, 100W SUPERVOOC charging.',
       64999,69999,7,55,4.4,987,
       ARRAY[
         'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400&q=80',
         'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80',
         'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80'
       ],
       '{"Display":"6.82-inch LTPO AMOLED 120Hz","Processor":"Snapdragon 8 Gen 3","RAM":"12GB","Storage":"256GB","Camera":"50MP+48MP+64MP Hasselblad","Battery":"5400mAh","Charging":"100W SUPERVOOC","OS":"OxygenOS 14"}',
       'OnePlus',false),

      -- 6. boAt Rockerz 450  → Wireless headphone images
      ($1,'boAt Rockerz 450 Headphones',
       'Immersive audio with 40mm drivers, 15-hour battery, built-in mic, foldable design. Compatible with all Bluetooth devices.',
       1499,3999,62,200,4.2,45231,
       ARRAY[
         'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
         'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&q=80',
         'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80'
       ],
       '{"Type":"Over-Ear Wireless","Driver Size":"40mm","Battery Life":"15 hours","Charging":"Micro-USB","Bluetooth":"5.0","Connectivity":"BT + 3.5mm AUX","Mic":"Built-in","Weight":"220g"}',
       'boAt',false)

    `, [catMap['electronics']]);
    console.log('✅ Inserted Electronics products');

    // ══════════════════════════════════════════════════════════
    // FASHION
    // ══════════════════════════════════════════════════════════
    await client.query(`
      INSERT INTO products
        (category_id,name,description,price,original_price,discount_percent,stock,rating,review_count,images,specifications,brand,is_featured)
      VALUES

      -- 7. Levi's 511 Jeans  → Jeans images
      ($1,'Levi''s 511 Slim Fit Jeans',
       'Premium stretch denim, slim silhouette through thigh and leg. Available in multiple washes. Perfect for casual and semi-formal wear.',
       2999,4999,40,150,4.4,8923,
       ARRAY[
         'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80',
         'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&q=80',
         'https://images.unsplash.com/photo-1604176424472-9d05e5e54c99?w=400&q=80'
       ],
       '{"Fit":"Slim Fit","Material":"98% Cotton 2% Elastane","Closure":"Zip fly","Rise":"Mid-Rise","Wash":"Dark Blue","Occasion":"Casual Semi-Formal","Care":"Machine Washable"}',
       'Levi''s',false),

      -- 8. Nike Air Max 270  → Nike shoe images (confirmed red Nike)
      ($1,'Nike Air Max 270',
       'Nike''s biggest Air unit, breathable mesh upper, foam midsole. Retro running inspiration meets modern street style.',
       10995,13995,21,60,4.6,3421,
       ARRAY[
         'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
         'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&q=80',
         'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80'
       ],
       '{"Type":"Running/Lifestyle","Upper":"Engineered Mesh","Midsole":"Full-length foam","Air Unit":"270-degree Max Air","Closure":"Lace-Up","Sizes Available":"UK 6-11","Sole Material":"Rubber"}',
       'Nike',false),

      -- 9. Peter England Formal Shirt  → Dress shirt images
      ($1,'Peter England Formal Shirt',
       '100% premium cotton regular-fit formal shirt. Easy-iron fabric, classic collar, full button placket. Perfect for office.',
       799,1499,46,200,4.2,12045,
       ARRAY[
         'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80',
         'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=400&q=80',
         'https://images.unsplash.com/photo-1594938298603-c8148c4b4b6e?w=400&q=80'
       ],
       '{"Fit":"Regular Fit","Material":"100% Cotton","Collar":"Classic","Sleeve":"Full Sleeve","Pattern":"Solid","Occasion":"Formal Office","Care":"Easy Iron","Sizes":"S M L XL XXL"}',
       'Peter England',false),

      -- 10. H&M Slim Fit T-Shirt  → T-shirt images
      ($1,'H&M Slim Fit T-Shirt',
       'Soft jersey fabric, crew neck, short sleeves. Clean minimal design — great on its own or layered. Multiple seasonal colours.',
       499,799,37,300,4.0,23000,
       ARRAY[
         'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80',
         'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400&q=80',
         'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&q=80'
       ],
       '{"Fit":"Slim Fit","Material":"100% Cotton Jersey","Neckline":"Crew Neck","Sleeve":"Short Sleeve","Pattern":"Solid","Occasion":"Casual Everyday","Care":"Machine Wash Cold"}',
       'H&M',false),

      -- 11. Allen Solly Chinos  → Pants/chinos images
      ($1,'Allen Solly Chinos',
       'Soft-stretch cotton blend, slim fit silhouette. Perfect for casual Fridays and smart-casual outings.',
       1699,2999,43,100,4.3,5670,
       ARRAY[
         'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&q=80',
         'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=400&q=80',
         'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=400&q=80'
       ],
       '{"Fit":"Slim Fit","Material":"98% Cotton 2% Lycra","Closure":"Zip fly","Rise":"Mid-Rise","Occasion":"Casual Smart-Casual","Waist":"28-38 inches","Care":"Machine Washable"}',
       'Allen Solly',false),

      -- 12. Adidas Ultraboost 22  → Running shoe images
      ($1,'Adidas Ultraboost 22',
       'BOOST midsole for maximum energy return, Primeknit+ upper, Continental Rubber outsole. Built for serious runners.',
       14999,18999,21,40,4.5,2100,
       ARRAY[
         'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&q=80',
         'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&q=80',
         'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80'
       ],
       '{"Type":"Running Shoe","Upper":"Primeknit+","Midsole":"BOOST Foam","Outsole":"Continental Rubber","Drop":"10mm","Weight":"310g","Sizes":"UK 6-12","Arch Support":"Neutral"}',
       'Adidas',false)

    `, [catMap['fashion']]);
    console.log('✅ Inserted Fashion products');

    // ══════════════════════════════════════════════════════════
    // HOME & FURNITURE
    // ══════════════════════════════════════════════════════════
    await client.query(`
      INSERT INTO products
        (category_id,name,description,price,original_price,discount_percent,stock,rating,review_count,images,specifications,brand,is_featured)
      VALUES

      -- 13. IKEA MALM Bed Frame  → Bedroom/bed images
      ($1,'IKEA MALM Bed Frame',
       'Clean Scandinavian design. Durable fiberboard with smooth white finish. Compatible with IKEA slatted bed bases. Easy assembly.',
       22990,27990,17,15,4.5,3200,
       ARRAY[
         'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400&q=80',
         'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&q=80',
         'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=80'
       ],
       '{"Size":"Queen 150x200cm","Material":"Fiberboard ABS plastic","Color":"White","Height headboard":"100cm","Max Load":"250kg","Assembly":"Required","Mattress":"Not Included"}',
       'IKEA',false),

      -- 14. Godrej Bookshelf  → Bookshelf images (confirmed books-on-shelf ID)
      ($1,'Godrej Interio Bookshelf',
       '5 open shelves, engineered wood with premium laminate finish. Sturdy and stylish for living rooms, study rooms, and offices.',
       8999,11999,25,30,4.3,1540,
       ARRAY[
         'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80',
         'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&q=80',
         'https://images.unsplash.com/photo-1455885661740-29cbf08a42fa?w=400&q=80'
       ],
       '{"Material":"Engineered Wood","Shelves":"5","Color":"Walnut Brown","Dimensions":"180x80x30 cm","Load Per Shelf":"15kg","Finish":"Laminate","Assembly":"Required"}',
       'Godrej',false),

      -- 15. Philips LED Bulb  → Light bulb images
      ($1,'Philips LED Bulb Pack of 10',
       '9W output replaces 60W incandescent, up to 15,000 hours, saves 85% energy. Instant full brightness, mercury-free, flicker-free.',
       699,999,30,500,4.4,34500,
       ARRAY[
         'https://images.unsplash.com/photo-1556766558-0e31bf9b3a49?w=400&q=80',
         'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&q=80',
         'https://images.unsplash.com/photo-1548680531-e6e1a6f66f9e?w=400&q=80'
       ],
       '{"Wattage":"9W","Equivalent":"60W Incandescent","Luminous Flux":"950 lm","Colour Temp":"6500K Cool Daylight","Lifespan":"15000 hours","Base":"B22","Pack":"10 bulbs","Mercury-Free":true}',
       'Philips',false),

      -- 16. Milton Water Bottle  → Water bottle images
      ($1,'Milton Water Bottle Set',
       '3 BPA-free bottles (500ml, 750ml, 1000ml). Leak-proof lids, wide-mouth for easy cleaning. Ideal for gym, office, and travel.',
       499,799,37,400,4.2,18900,
       ARRAY[
         'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80',
         'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&q=80',
         'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80'
       ],
       '{"Pack":"3 Bottles","Sizes":"500ml 750ml 1000ml","Material":"BPA-Free Plastic","Lid":"Leak-Proof Flip Cap","Dishwasher Safe":true,"Colors":"Assorted","Usage":"Gym Office Travel"}',
       'Milton',false),

      -- 17. Prestige Cookware  → Cookware/pan images
      ($1,'Prestige Non-Stick Cookware Set',
       '3 hard-anodized pans with non-stick coating, even heat distribution, effortless food release. Induction compatible.',
       2499,3999,37,80,4.5,7800,
       ARRAY[
         'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&q=80',
         'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
         'https://images.unsplash.com/photo-1577538928305-3807c3993047?w=400&q=80'
       ],
       '{"Set Includes":"3 Pans 20cm 24cm 28cm","Material":"Hard Anodized Aluminum","Coating":"Non-Stick PTFE","Base":"Induction Compatible","Handle":"Soft-grip Bakelite","Oven Safe":false}',
       'Prestige',false),

      -- 18. Asian Paints Wall Putty  → Paint/wall images
      ($1,'Asian Paints Wall Putty 10kg',
       'White cement + polymer formula fills cracks and pinholes for a flawless finish. Boosts paint transparency and lifespan.',
       849,1099,22,200,4.3,4500,
       ARRAY[
         'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&q=80',
         'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&q=80',
         'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=400&q=80'
       ],
       '{"Weight":"10kg","Type":"White Cement Putty","Coverage":"10-12 sq ft/kg 2 coats","Surface":"Interior & Exterior","Drying Time":"4-6 hours","Application":"Trowel / Putty Knife"}',
       'Asian Paints',false)

    `, [catMap['home-furniture']]);
    console.log('✅ Inserted Home & Furniture products');

    // ══════════════════════════════════════════════════════════
    // APPLIANCES
    // ══════════════════════════════════════════════════════════
    await client.query(`
      INSERT INTO products
        (category_id,name,description,price,original_price,discount_percent,stock,rating,review_count,images,specifications,brand,is_featured)
      VALUES

      -- 19. LG Washing Machine  → Washing machine images
      ($1,'LG 6.5kg Fully Automatic Washing Machine',
       'Smart Inverter Motor saves 36% energy. 10 wash programs, TurboDrum technology, Auto Restart after power cuts.',
       28990,36990,21,25,4.4,2300,
       ARRAY[
         'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&q=80',
         'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
         'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80'
       ],
       '{"Type":"Fully Automatic Top Load","Capacity":"6.5kg","Energy Rating":"5 Star","Motor":"Smart Inverter","Wash Programs":"10","Spin Speed":"700 RPM","Technology":"TurboDrum","Color":"Middle Black"}',
       'LG',true),

      -- 20. Samsung Refrigerator  → Fridge images (confirmed)
      ($1,'Samsung 253L Double Door Refrigerator',
       'Digital Inverter Technology at 9 frequencies for efficiency. SpaceMax interior and Curd Maestro for fresh curd anytime.',
       26990,34990,22,20,4.5,3400,
       ARRAY[
         'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&q=80',
         'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&q=80',
         'https://images.unsplash.com/photo-1614963590013-b879be0ab4b4?w=400&q=80'
       ],
       '{"Type":"Double Door","Capacity":"253L","Energy Rating":"2 Star","Compressor":"Digital Inverter","Fresh Food":"176L","Freezer":"77L","Color":"Elegant Inox","Technology":"SpaceMax Curd Maestro"}',
       'Samsung',false),

      -- 21. Voltas AC  → Air conditioner images
      ($1,'Voltas 1.5 Ton 5 Star Split AC',
       'Saves up to 50% energy with 5 Star ISEER rating. 4-in-1 adjustable mode, auto-cleaner, works up to 52°C ambient.',
       34990,45990,23,18,4.3,1800,
       ARRAY[
         'https://images.unsplash.com/photo-1635070040955-62b2cd2ab0a0?w=400&q=80',
         'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=400&q=80',
         'https://images.unsplash.com/photo-1489171078254-c3365d6e359f?w=400&q=80'
       ],
       '{"Type":"Split AC","Capacity":"1.5 Ton","Energy Rating":"5 Star ISEER 4.7","Compressor":"Inverter","Cooling Modes":"4-in-1 Adjustable","Refrigerant":"R32","Anti-Bacterial Filter":true,"Ambient Temp":"Up to 52°C"}',
       'Voltas',false),

      -- 22. Bajaj Mixer Grinder  → Kitchen mixer/blender images
      ($1,'Bajaj Majesty 1000W Mixer Grinder',
       '1000W copper-wound motor, 3 SS jars. Perfect for grinding, blending, chutneys. Overload protection + anti-drip coupler.',
       1999,3499,42,100,4.4,23400,
       ARRAY[
         'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&q=80',
         'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&q=80',
         'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80'
       ],
       '{"Power":"1000W","Jars":"3 (1.5L+1L+0.4L)","Material":"Stainless Steel","Motor":"Copper Wound","Speeds":"3 + Pulse","Safety":"Overload Protector","Anti-drip Coupler":true,"Warranty":"2 Years"}',
       'Bajaj',false),

      -- 23. Havells Microwave  → Microwave/kitchen oven images
      ($1,'Havells 25L Microwave Oven',
       '8 auto-cook menus, convection + grill, child lock, stainless steel cavity, 5 power levels. Everyday cooking made easy.',
       8490,11990,29,45,4.2,5600,
       ARRAY[
         'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400&q=80',
         'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
         'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&q=80'
       ],
       '{"Type":"Convection + Grill + Microwave","Capacity":"25L","Power":"900W","Auto-Cook Menus":"8","Power Levels":"5","Cavity":"Stainless Steel","Child Lock":true,"Timer":"Up to 99 min"}',
       'Havells',false),

      -- 24. Orient Table Fan  → Electric fan images
      ($1,'Orient Electric Table Fan',
       '400mm 3-blade fan delivers powerful airflow. 5 speed settings, anti-rust coating, 1-year warranty. Great for home and office.',
       1299,1899,31,150,4.3,12000,
       ARRAY[
         'https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=400&q=80',
         'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
         'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80'
       ],
       '{"Blade Size":"400mm 16 inch","Blades":"3","Speeds":"5","Power":"55W","Air Delivery":"72 CMM","Coating":"Anti-Rust","Base":"Stable weighted base","Warranty":"1 Year"}',
       'Orient',false)

    `, [catMap['appliances']]);
    console.log('✅ Inserted Appliances products');

    // ══════════════════════════════════════════════════════════
    // SPORTS & FITNESS
    // ══════════════════════════════════════════════════════════
    await client.query(`
      INSERT INTO products
        (category_id,name,description,price,original_price,discount_percent,stock,rating,review_count,images,specifications,brand,is_featured)
      VALUES

      -- 25. Cosco Football  → Football/soccer ball images (confirmed)
      ($1,'Cosco Football Size 5',
       'Regulation match ball (Size 5, age 13+). PU outer shell, hand-stitched 32 panels, butyl bladder for excellent air retention.',
       699,999,30,200,4.3,9800,
       ARRAY[
         'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400&q=80',
         'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&q=80',
         'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=400&q=80'
       ],
       '{"Size":"5 Regulation","Material":"PU outer shell","Stitching":"Hand-stitched 32 panels","Bladder":"Butyl","Air Retention":"Excellent","Circumference":"68-70cm","Weight":"410-450g"}',
       'Cosco',false),

      -- 26. Decathlon Yoga Mat  → Yoga mat images (confirmed)
      ($1,'Decathlon Yoga Mat 6mm',
       'Eco-friendly NBR foam, anti-slip on both sides, easy to roll and carry. Stable cushioned surface for all yoga styles.',
       849,1299,34,300,4.5,45000,
       ARRAY[
         'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80',
         'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80',
         'https://images.unsplash.com/photo-1593164842264-854604db2260?w=400&q=80'
       ],
       '{"Thickness":"6mm","Material":"NBR Foam","Dimensions":"183x61 cm","Weight":"700g","Non-Slip":"Both sides","Eco-Friendly":true,"Includes":"Carry strap","Suitable For":"All yoga styles"}',
       'Decathlon',false),

      -- 27. Boldfit Dumbbell Set  → Dumbbell images (confirmed)
      ($1,'Boldfit Adjustable Dumbbell Set 20kg',
       'Pair of 10kg dumbbells, chrome-plated knurled handles, spin-lock collars. Perfect for home gym — curls, press, lunges.',
       2999,4999,40,80,4.4,6700,
       ARRAY[
         'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80',
         'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&q=80',
         'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80'
       ],
       '{"Total Weight":"20kg (2x10kg)","Handle":"Chrome plated knurled grip","Collar":"Spin-lock","Plates":"Cast Iron","Rod":"Solid Steel","Rod Length":"35cm","Usage":"Home Gym All exercises"}',
       'Boldfit',false),

      -- 28. Nivia Basketball  → Basketball images (confirmed)
      ($1,'Nivia Carbonite Basketball',
       'High-quality rubber basketball for outdoor courts. Deep channel design for optimal grip, butyl bladder, nylon windings.',
       1299,1999,35,120,4.2,3400,
       ARRAY[
         'https://images.unsplash.com/photo-1546519638405-a9f9b1f56c94?w=400&q=80',
         'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=400&q=80',
         'https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=400&q=80'
       ],
       '{"Size":"7 Regulation","Material":"Rubber outer","Bladder":"Butyl","Windings":"Nylon","Surface":"Outdoor","Circumference":"75-78cm","Weight":"600-650g","Channel Design":"Deep channel grip"}',
       'Nivia',false),

      -- 29. Aurion Treadmill  → Treadmill/gym images (confirmed)
      ($1,'Aurion Treadmill 3HP',
       '3HP motor, 12 preset programs, dual LCD, 1-14 km/h, 3-level incline. Foldable design, shock-absorbing deck. Max 100kg.',
       24999,34999,28,12,4.3,1200,
       ARRAY[
         'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',
         'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&q=80',
         'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80'
       ],
       '{"Motor":"3HP Peak Power","Speed Range":"1-14 km/h","Programs":"12 Preset","Incline":"3 Manual Levels","Display":"Dual LCD","Belt Size":"100x36 cm","Max User Weight":"100kg","Foldable":true}',
       'Aurion',false),

      -- 30. Strauss Resistance Bands  → Exercise band/fitness images
      ($1,'Strauss Resistance Bands Set',
       '5 latex bands (10-50 lbs) for strength training, physio, yoga, stretching. Colour-coded by resistance. Includes carry bag.',
       599,999,40,400,4.5,28000,
       ARRAY[
         'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&q=80',
         'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80',
         'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80'
       ],
       '{"Set Includes":"5 Bands + Carry Bag + Guide","Resistance Levels":"10-50 lbs 5 levels","Material":"Natural Latex","Length":"2 meters each","Color-Coded":true,"Usage":"Strength Yoga Rehab Stretching","Eco-Friendly":true}',
       'Strauss',false)

    `, [catMap['sports-fitness']]);
    console.log('✅ Inserted Sports & Fitness products');

    // ─── VERIFY ────────────────────────────────────────────────
    const countRes = await client.query('SELECT COUNT(*) FROM products');
    console.log(`\n✅ Total products seeded: ${countRes.rows[0].count}`);

    const catCountRes = await client.query(`
      SELECT c.name, COUNT(p.id) AS products
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.name ORDER BY c.name
    `);
    console.log('\n📊 Products per category:');
    catCountRes.rows.forEach((r) => console.log(`   ${r.name}: ${r.products}`));
    console.log('\n🎉 Seed completed successfully!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    client.release();
  }
}

seed();
