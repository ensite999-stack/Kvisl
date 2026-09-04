import type { Metadata } from 'next';
import { isAdminAuthenticated } from '@/lib/auth';
import { AdminLogin } from './login';
import { EditorDashboard } from './editor-dashboard';

export const metadata: Metadata = {
  title: 'Editorial',
  robots: { index: false, follow: false }
};

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();
  return <div className="admin-shell">{authenticated ? <EditorDashboard /> : <AdminLogin />}</div>;
}
