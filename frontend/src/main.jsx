import { StrictMode, useContext } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router-dom";
import './index.css'
import { AuthProvider, AuthContext } from './context/AuthContext.jsx';
import router from './utils/router.jsx'

const AppLoader = () => {
  const { loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return <RouterProvider router={router} />;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AppLoader />
    </AuthProvider>
  </StrictMode>,
)
