import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './components/layout/AuthGuard';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { ChangesPage } from './components/auth/ChangesPage';
import { SshAuthPage } from './components/auth/SshAuthPage';
import { SshCompletePage } from './components/auth/SshCompletePage';
import { InstancesPage } from './components/compute/InstancesPage';
import { InstanceDetailPage } from './components/compute/InstanceDetailPage';
import { CreatePage } from './components/compute/CreatePage';
import { ResultPage } from './components/compute/ResultPage';
import { StoragePage } from './components/storage/StoragePage';
import { TerminalPage } from './components/terminal/TerminalPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/changes" element={<ChangesPage />} />
        <Route path="/ssh-auth" element={<SshAuthPage />} />
        <Route path="/ssh/complete" element={<SshCompletePage />} />

        <Route element={<AuthGuard />}>
          <Route path="/compute" element={<InstancesPage />} />
          <Route path="/instances" element={<Navigate to="/compute" replace />} />
          <Route path="/compute/create" element={<CreatePage />} />
          <Route path="/instances/new" element={<Navigate to="/compute/create" replace />} />
          <Route path="/compute/create/result" element={<ResultPage />} />
          <Route path="/instances/create/result" element={<Navigate to="/compute/create/result" replace />} />
          <Route path="/compute/instances/:id" element={<InstanceDetailPage />} />
          <Route path="/instances/:id" element={<InstanceDetailPage />} />
          <Route path="/compute/instances/:id/terminal" element={<TerminalPage />} />
          <Route path="/instances/:id/terminal" element={<TerminalPage />} />
          <Route path="/storage" element={<StoragePage />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
