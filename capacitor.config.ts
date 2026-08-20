import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tikjogos.app',
  appName: 'TikJogos',
  webDir: 'dist',
  server: {
    url: 'https://tikjogos.com.br',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#1a1b2e',
  },
};

export default config;
