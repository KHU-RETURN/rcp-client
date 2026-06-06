import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './components/layout/AuthGuard';
import { LoginPage } from './components/auth/LoginPage';
import { ChangesPage } from './components/auth/ChangesPage';
import { AuthCallback } from './components/auth/AuthCallback';
import { SshAuthPage } from './components/auth/SshAuthPage';
import { SshCompletePage } from './components/auth/SshCompletePage';
import { LandingPage } from './components/landing/LandingPage';
import { InstancesPage } from './components/compute/InstancesPage';
import { InstanceDetailPage } from './components/compute/InstanceDetailPage';
import { CreatePage } from './components/compute/CreatePage';
import { StoragePage } from './components/storage/StoragePage';
import { StorageContainerPage } from './components/storage/StorageContainerPage';
import { TerminalPage } from './components/terminal/TerminalPage';
import { EasterEggLayer, EasterEggProvider } from './components/easter-eggs';
import { AdminGuard } from './components/admin/AdminGuard';
import { AdminPage } from './components/admin/AdminPage';
import {
  AdminContainerDetailPage,
  AdminInstanceDetailPage,
  AdminUserDetailPage,
} from './components/admin/AdminDetailPages';

export function App() {
  return (
    <BrowserRouter>
      <EasterEggProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/changes" element={<ChangesPage />} />

          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/ssh-auth" element={<SshAuthPage />} />
          <Route path="/ssh/complete" element={<SshCompletePage />} />

          <Route element={<AuthGuard />}>
            <Route path="/compute" element={<InstancesPage />} />
            <Route path="/compute/create" element={<CreatePage />} />
            <Route path="/compute/create/result" element={<Navigate to="/compute" replace />} />
            <Route path="/compute/instances/:id" element={<InstanceDetailPage />} />
            <Route path="/instances/:id" element={<InstanceDetailPage />} />
            <Route path="/compute/instances/:id/terminal" element={<TerminalPage />} />
            <Route path="/instances/:id/terminal" element={<TerminalPage />} />
            <Route path="/storage" element={<StoragePage />} />
            <Route path="/storage/:name" element={<StorageContainerPage />} />
            <Route element={<AdminGuard />}>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
              <Route path="/admin/instances/:id" element={<AdminInstanceDetailPage />} />
              <Route path="/admin/containers/:id" element={<AdminContainerDetailPage />} />
            </Route>
          </Route>

          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <EasterEggLayer />
      </EasterEggProvider>
    </BrowserRouter>
  );
}
