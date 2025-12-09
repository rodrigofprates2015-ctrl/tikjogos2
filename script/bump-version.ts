import fs from 'fs';
import path from 'path';

const versionFilePath = path.join(process.cwd(), 'version.json');

interface VersionFile {
  version: string;
  versionNumber: number;
  lastUpdated: string;
}

function bumpVersion() {
  try {
    const data = fs.readFileSync(versionFilePath, 'utf-8');
    const versionData: VersionFile = JSON.parse(data);
    
    // Increment version number
    const newVersionNumber = versionData.versionNumber + 1;
    const newVersion = `v.${newVersionNumber}`;
    
    // Update version data
    const updatedData: VersionFile = {
      version: newVersion,
      versionNumber: newVersionNumber,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    
    // Write back to file
    fs.writeFileSync(versionFilePath, JSON.stringify(updatedData, null, 2));
    
    console.log(`✅ Version bumped: ${versionData.version} → ${newVersion}`);
  } catch (error) {
    console.error('❌ Error bumping version:', error);
    process.exit(1);
  }
}

bumpVersion();
