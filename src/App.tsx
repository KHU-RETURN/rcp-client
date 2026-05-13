import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './components/layout/AuthGuard';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { ChangesPage } from './components/auth/ChangesPage';
import { AuthCallback } from './components/auth/AuthCallback'; 
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

        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route element={<AuthGuard />}>
          <Route path="/compute" element={<InstancesPage />} />
          <Route path="/compute/create" element={<CreatePage />} />
          <Route path="/compute/create/result" element={<ResultPage />} />
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
