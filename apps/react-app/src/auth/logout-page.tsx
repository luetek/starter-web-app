import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { logoutThunk } from './user-slice';

export function LogoutPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const logout = async () => {
      await dispatch(logoutThunk()).unwrap();
      navigate('/');
    };
    logout();
  }, [dispatch, navigate]);
  return <div>Logging out</div>;
}
