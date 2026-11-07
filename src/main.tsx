import { createRoot } from 'react-dom/client';
import './index.css';

const root = createRoot(document.getElementById('root')!);
const pathname = window.location.pathname.replace(/\/+$/, '') || '/';

if (pathname === '/admin') {
  import('./components/AdsAdminDashboard').then(({ AdsAdminDashboard }) => root.render(<AdsAdminDashboard />));
} else if (pathname === '/privacy-policy') {
  import('./components/MonetizationSection').then(({ PrivacyPolicyPage }) => root.render(<PrivacyPolicyPage />));
} else {
  import('./App').then(({ default: App }) => root.render(<App />));
}
