import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const root = createRoot(document.getElementById('root')!);
const pathname = window.location.pathname.replace(/\/+$/, '') || '/';

if (pathname === '/admin') {
  import('./components/AdsAdminDashboard').then(({ AdsAdminDashboard }) => root.render(<AdsAdminDashboard />));
} else if (pathname === '/privacy-policy') {
  import('./components/MonetizationSection').then(({ PrivacyPolicyPage }) => root.render(<PrivacyPolicyPage />));
} else {
  root.render(<App />);
}
