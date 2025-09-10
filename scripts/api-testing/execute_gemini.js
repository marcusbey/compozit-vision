const { execSync } = require('child_process');
const path = require('path');

// Change to the mobile directory (go up 2 levels from scripts/api-testing)
const mobileDir = path.join(__dirname, '../../mobile');
process.chdir(mobileDir);

console.log('Working directory:', process.cwd());
console.log('Executing Gemini image generation script...');

try {
  const result = execSync('node src/scripts/generateWithGeminiImages.js', { 
    encoding: 'utf8',
    stdio: 'inherit'
  });
  console.log('Script executed successfully');
} catch (error) {
  console.error('Script execution failed:', error.message);
}