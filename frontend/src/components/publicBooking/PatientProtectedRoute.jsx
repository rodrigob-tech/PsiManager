import { Navigate } from "react-router-dom";


import { isPatientAuthenticated } from "../../storages/patientAuthStorage";

export default function PatientProtectedRoute({ children }) {
  if (!isPatientAuthenticated()) {
    return <Navigate to="/login-paciente" replace />;
  }

  return children;
}
