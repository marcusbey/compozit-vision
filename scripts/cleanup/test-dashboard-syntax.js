// Quick syntax check for dashboard files
const fs = require('fs');
const path = require('path');

const dashboardDir = './mobile/src/screens/07-dashboard';
const files = [
  'ABTestingScreen.tsx',
  'AdminPanelScreen.tsx', 
  'AnalyticsScreen.tsx',
  'MyPalettesScreen.tsx',
  'MyProjectsScreen.tsx',
  'PlansScreen.tsx',
  'ProfileScreen.tsx',
  'ProjectSettingsScreen.tsx',
  'ReferenceLibraryScreen.tsx',
  'ToolsScreen.tsx'
];

files.forEach(file => {
  const filePath = path.join(dashboardDir, file);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for malformed font patterns
    const malformedPattern = /\{\s*\{\s*fontSize.*?\}/g;
    const matches = content.match(malformedPattern);
    
    if (matches) {
      console.log(`❌ ${file}: Found malformed patterns:`);
      matches.forEach((match, index) => {
        console.log(`   ${index + 1}: ${match}`);
      });
    } else {
      console.log(`✅ ${file}: No malformed font patterns found`);
    }
  } catch (error) {
    console.log(`❌ ${file}: Error reading file - ${error.message}`);
  }
});