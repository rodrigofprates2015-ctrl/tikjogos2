import { execSync } from 'child_process';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings?.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('Token not found');
  }

  const response = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  );
  
  const data = await response.json();
  connectionSettings = data.items?.[0];
  const accessToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!accessToken) {
    throw new Error('GitHub not connected properly');
  }
  
  return accessToken;
}

async function pushToGitHub() {
  try {
    const token = await getAccessToken();
    console.log('✅ Token obtained from GitHub integration');
    
    // Reset workflow files that require special OAuth scope
    console.log('🔄 Resetting workflow files...');
    try {
      execSync('git reset HEAD .github/workflows/', { cwd: process.cwd() });
      execSync('git checkout -- .github/workflows/', { cwd: process.cwd() });
    } catch (e) {
      // If they don't exist or other issue, continue anyway
    }
    
    // Execute git push using the token
    const pushUrl = `https://rodrigofprates2015-ctrl:${token}@github.com/rodrigofprates2015-ctrl/Dessavez.git`;
    execSync(`git push "${pushUrl}" main`, { stdio: 'inherit', cwd: process.cwd() });
    
    console.log('✅ Push successful!');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

pushToGitHub();
