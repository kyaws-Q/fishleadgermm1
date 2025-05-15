#!/usr/bin/env node

/**
 * Script to update browserslist database
 */
const { execSync } = require('child_process');

console.log('Updating browserslist database...');

try {
  execSync('npx update-browserslist-db@latest', { stdio: 'inherit' });
  console.log('Browserslist database updated successfully!');
} catch (error) {
  console.error('Failed to update browserslist database:', error);
  process.exit(1);
}
