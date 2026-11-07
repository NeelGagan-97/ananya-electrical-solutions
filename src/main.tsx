import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AdsAdminDashboard } from './components/AdsAdminDashboard';
import { PrivacyPolicyPage } from './components/MonetizationSection';
import './index.css';

const root = createRoot(document.getElementById('root')!);
const pathname = window.location.pathname.replace(/\/+$/, '') || '/';

if (pathname === '/admin') {
  root.render(<AdsAdminDashboard />);
} else if (pathname === '/privacy-policy') {
  root.render(<PrivacyPolicyPage />);
} else {
  root.render(<App />);
}
