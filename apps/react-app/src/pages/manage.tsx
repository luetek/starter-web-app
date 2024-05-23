import { Outlet } from 'react-router-dom';
import { StorageManagerView } from '../manage/storage-manager';

export function ManagePage() {
  return (
    <div>
      <h1>Manage Page</h1>
      <StorageManagerView />
      <Outlet />
    </div>
  );
}
