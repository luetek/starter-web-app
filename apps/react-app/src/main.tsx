import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { PrimeReactProvider } from 'primereact/api';
import axios from 'axios';
import { router } from './routes';
import { persistor, store } from './store';
import { cleanUpToken } from './auth/user-slice';

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    store.dispatch(cleanUpToken());
    return error;
  }
);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    <PrimeReactProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <RouterProvider router={router} />
        </PersistGate>
      </Provider>
    </PrimeReactProvider>
  </StrictMode>
);
