import jwt from "jsonwebtoken";

export function generatePatientToken(patient) {
  return jwt.sign(
    {
      patientId: patient.id,
      email: patient.email,
      type: "patient"
    },
    process.env.CLIENT_JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );
}
