import { Route, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import App from './app/app';
import { Home } from './pages/home';
import { SignUpPage } from './auth/signup-page';
import { LoginPage } from './auth/login-page';
import { LogoutPage } from './auth/logout-page';
import { ProfilePage } from './auth/profile-page';
import { ActivityCollectionCreatePage } from './activity/pages/collection-create-page';
import { ActivityCollectionViewPage } from './activity/pages/collection-view-page';
import { ActivityCollectionMetadataEditPage } from './activity/pages/collection-pages/collection-metadata-edit-page';
import { ActivityCreatePage } from './activity/pages/collection-pages/activity-create-page';

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="/" index element={<Home />} />
      <Route path="home" element={<Home />} />

      <Route path="signup" element={<SignUpPage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="logout" element={<LogoutPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="activity-collections">
        <Route path="create" element={<ActivityCollectionCreatePage />} />
        <Route path=":id/view" element={<ActivityCollectionViewPage />} />
        <Route path=":id/edit" element={<ActivityCollectionMetadataEditPage />}>
          <Route path="" index element={<ActivityCollectionMetadataEditPage />} />
          <Route path="activities/create" index element={<ActivityCreatePage />} />
        </Route>
      </Route>
    </Route>
  )
);
