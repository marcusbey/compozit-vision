// Quick syntax test for the fixed files
try {
  const ColorPaletteScreen = require('./src/screens/05-content-selection/ColorPaletteSelectionScreen.tsx');
  const ReferenceScreen = require('./src/screens/05-content-selection/ReferenceSelectionScreen.tsx');
  console.log('✅ Files can be imported without syntax errors');
} catch (error) {
  console.log('❌ Syntax error:', error.message);
}