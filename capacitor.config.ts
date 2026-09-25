import type {CapacitorConfig} from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'school.klassno.app', appName: 'Классно', webDir: 'dist',
  server: {androidScheme: 'http', cleartext: process.env.MOBILE_LOCAL === '1'},
  ios: {contentInset: 'automatic'},
};
export default config;
