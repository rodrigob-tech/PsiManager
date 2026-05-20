import { Navigate } from "react-router-dom";


import { isClientAuthenticated } from "../../src/services/clientAuthStorage";

export default function ClientProtectedRoute({ children }) {
  if (!isClientAuthenticated()) {
    return <Navigate to="/login-cliente" replace />;
  }

  return children;
}