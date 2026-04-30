const fs = require('fs');
const path = require('path');

const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
);

const versionData = {
  version: packageJson.version
};

fs.writeFileSync(
  path.join(__dirname, '../src/version.json'),
  JSON.stringify(versionData, null, 2)
);

console.log(`✓ Generated src/version.json with version ${packageJson.version}`);
