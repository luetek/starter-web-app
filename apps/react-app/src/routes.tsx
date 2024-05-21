import { Route, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import App from './app/app';
import { Home } from './pages/home';
import { SignUpPage } from './auth/signup-page';
import { LoginPage } from './auth/login-page';
import { LogoutPage } from './auth/logout-page';
import { ProfilePage } from './auth/profile-page';
import { ManagePage } from './pages/manage';

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="/" index element={<Home />} />
      <Route path="home" element={<Home />} />
      <Route path="manage" element={<ManagePage />} />
      <Route path="signup" element={<SignUpPage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="logout" element={<LogoutPage />} />
      <Route path="profile" element={<ProfilePage />} />
    </Route>
  )
);
