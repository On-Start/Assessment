import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from "./components/Register";
import VerifyEmail from './components/VerifyEmail';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/verify-email",
    element: <VerifyEmail />,
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
