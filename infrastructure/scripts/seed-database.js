/**
 * Script: seed-database.js
 * Descrição: Insere dados iniciais (stores e products) no PostgreSQL
 * Uso: node seed-database.js --env staging
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Configurações do banco
const configs = {
    staging: {
        host: 'localhost',
        port: 5433,
        database: 'business_staging',
        user: 'business',
        password: process.env.POSTGRES_PASSWORD_STAGING || 'staging_senha_forte_123'
    },
    production: {
        host: 'localhost',
        port: 5432,
        database: 'business_production',
        user: 'business',
        password: process.env.POSTGRES_PASSWORD_PRODUCTION || 'production_senha_muito_forte_789'
    }
};

// Parse argumentos
const args = process.argv.slice(2);
const envIndex = args.indexOf('--env');
const env = envIndex !== -1 ? args[envIndex + 1] : 'staging';

if (!['staging', 'production'].includes(env)) {
    console.error('❌ Erro: Ambiente deve ser "staging" ou "production"');
    console.log('Uso: node seed-database.js --env staging');
    process.exit(1);
}

console.log(`\n🚀 Seed do banco de dados - Ambiente: ${env}\n`);

const config = configs[env];
const client = new Client(config);

async function seedStores() {
    console.log('📦 Inserindo lojas (stores)...\n');
    
    const storesDir = path.join(__dirname, '../../config/stores');
    const storeFiles = fs.readdirSync(storesDir).filter(f => f.endsWith('.json'));
    
    let inserted = 0;
    
    for (const file of storeFiles) {
        const storePath = path.join(storesDir, file);
        const storeData = JSON.parse(fs.readFileSync(storePath, 'utf8'));
        
        try {
            await client.query(`
                INSERT INTO stores (
                    store_id, 
                    maintainer_id, 
                    maintainer_name,
                    store_name,
                    profit_margin,
                    project_year,
                    active,
                    config
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (store_id) DO UPDATE SET
                    maintainer_id = EXCLUDED.maintainer_id,
                    maintainer_name = EXCLUDED.maintainer_name,
                    store_name = EXCLUDED.store_name,
                    profit_margin = EXCLUDED.profit_margin,
                    project_year = EXCLUDED.project_year,
                    config = EXCLUDED.config,
                    updated_at = NOW()
            `, [
                storeData.store_id,
                storeData.maintainer_id,
                storeData.maintainer_name,
                storeData.store_name,
                storeData.profit_margin,
                storeData.project_year,
                storeData.active !== false,
                JSON.stringify(storeData)
            ]);
            
            console.log(`✅ ${storeData.store_id} - ${storeData.store_name}`);
            inserted++;
        } catch (error) {
            console.error(`❌ Erro ao inserir ${storeData.store_id}:`, error.message);
        }
    }
    
    console.log(`\n📊 ${inserted} loja(s) inserida(s)\n`);
}

async function seedProducts() {
    console.log('📦 Inserindo produtos (products)...\n');
    
    const productsDir = path.join(__dirname, '../../config/products');
    const productFiles = fs.readdirSync(productsDir).filter(f => f.endsWith('.json'));
    
    let inserted = 0;
    
    for (const file of productFiles) {
        const productPath = path.join(productsDir, file);
        const productData = JSON.parse(fs.readFileSync(productPath, 'utf8'));
        
        try {
            await client.query(`
                INSERT INTO products (
                    product_id,
                    name,
                    grade,
                    prices,
                    shipping,
                    erp_config,
                    image_main,
                    gallery_images,
                    active
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (product_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    grade = EXCLUDED.grade,
                    prices = EXCLUDED.prices,
                    shipping = EXCLUDED.shipping,
                    erp_config = EXCLUDED.erp_config,
                    image_main = EXCLUDED.image_main,
                    gallery_images = EXCLUDED.gallery_images,
                    active = EXCLUDED.active,
                    updated_at = NOW()
            `, [
                productData.product_id,
                productData.name,
                productData.grade,
                JSON.stringify(productData.prices),
                JSON.stringify(productData.shipping),
                JSON.stringify(productData.erp),
                productData.images?.main || null,
                JSON.stringify(productData.images?.gallery || []),
                productData.active !== false
            ]);
            
            console.log(`✅ ${productData.product_id} - ${productData.name}`);
            inserted++;
        } catch (error) {
            console.error(`❌ Erro ao inserir ${productData.product_id}:`, error.message);
        }
    }
    
    console.log(`\n📊 ${inserted} produto(s) inserido(s)\n`);
}

async function main() {
    try {
        // Conectar ao banco
        console.log('🔌 Conectando ao PostgreSQL...\n');
        await client.connect();
        console.log('✅ Conectado!\n');
        
        // Seed stores
        await seedStores();
        
        // Seed products
        await seedProducts();
        
        console.log('🎉 Seed concluído com sucesso!\n');
        
    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();

