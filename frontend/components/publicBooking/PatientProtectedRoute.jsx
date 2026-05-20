import { Navigate } from "react-router-dom";


import { isPatientAuthenticated } from "../../src/services/patientAuthStorage";

export default function PatientProtectedRoute({ children }) {
  if (!isPatientAuthenticated()) {
    return <Navigate to="/login-paciente" replace />;
  }

  return children;
}
