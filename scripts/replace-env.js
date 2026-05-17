/**
 * replace-env.js
 * Injecte les variables d'environnement Cloudflare Pages
 * dans environment.prod.ts avant le build Angular.
 *
 * Usage : node scripts/replace-env.js
 */

const fs = require('fs');
const path = require('path');

const envFilePath = path.resolve(
    __dirname,
    '../src/environments/environment.prod.ts'
);

const requiredVars = ['SUPABASE_URL', 'SUPABASE_KEY'];

// Vérification des variables requises
const missing = requiredVars.filter((v) => !process.env[v]);
if (missing.length > 0) {
    console.error(`❌ Variables manquantes : ${missing.join(', ')}`);
    console.error(
        'Vérifiez la configuration dans le dashboard Cloudflare Pages.'
    );
    process.exit(1);
}

let content = fs.readFileSync(envFilePath, 'utf8');

content = content
    .replace('%%SUPABASE_URL%%', process.env.SUPABASE_URL)
    .replace('%%SUPABASE_KEY%%', process.env.SUPABASE_KEY);

fs.writeFileSync(envFilePath, content, 'utf8');
console.log('✅ Variables d\'environnement injectées avec succès.');
