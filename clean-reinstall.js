/**
 * Script to clean and reinstall dependencies
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📦 Cleaning project and reinstalling dependencies...');

try {
  // Remove problematic files
  const filesToRemove = [
    '.next',
    'node_modules/.cache',
  ];

  filesToRemove.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
      console.log(`🗑️  Removing ${file}...`);
      try {
        if (fs.lstatSync(fullPath).isDirectory()) {
          fs.rmSync(fullPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(fullPath);
        }
      } catch (err) {
        console.warn(`⚠️  Warning: Could not remove ${file}:`, err.message);
      }
    }
  });

  // Clean npm cache
  console.log('🧹 Cleaning npm cache...');
  execSync('npm cache clean --force', { stdio: 'inherit' });

  // Install dependencies
  console.log('📥 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Apply our patched TypeScript configurations
  console.log('🛠️  Applying TypeScript configuration patches...');
  
  // Update googleai tsconfig
  const googleaiTsConfigPath = path.join(__dirname, 'node_modules/@genkit-ai/googleai/tsconfig.json');
  if (fs.existsSync(googleaiTsConfigPath)) {
    fs.writeFileSync(googleaiTsConfigPath, JSON.stringify({
      "compilerOptions": {
        "target": "ES2020",
        "module": "NodeNext",
        "moduleResolution": "NodeNext",
        "esModuleInterop": true,
        "declaration": true,
        "strict": false,
        "skipLibCheck": true,
        "isolatedModules": true,
        "sourceMap": true,
        "outDir": "dist",
        "rootDir": "src",
        "baseUrl": "."
      },
      "include": ["src/**/*"],
      "exclude": ["node_modules", "dist"]
    }, null, 2));
  }
  
  // Update genkit tsconfig
  const genkitTsConfigPath = path.join(__dirname, 'node_modules/genkit/tsconfig.json');
  if (fs.existsSync(genkitTsConfigPath)) {
    fs.writeFileSync(genkitTsConfigPath, JSON.stringify({
      "compilerOptions": {
        "target": "ES2020",
        "module": "NodeNext",
        "moduleResolution": "NodeNext",
        "esModuleInterop": true,
        "declaration": true,
        "strict": false,
        "skipLibCheck": true,
        "isolatedModules": true,
        "sourceMap": true,
        "outDir": "dist",
        "rootDir": "src",
        "baseUrl": ".",
        "lib": ["es2022", "DOM"]
      },
      "include": ["src/**/*"],
      "exclude": ["node_modules", "dist"]
    }, null, 2));
  }

  console.log('✅ All done! Now run: npm run dev');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} 