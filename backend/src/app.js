import express from "express";
import cors from "cors";
import patientRoutes from "./routes/patient.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import blockedTimeRoutes from "./routes/blockedTime.routes.js";
import spaceRoutes from "./routes/space.routes.js";
import googleCalendarRoutes from "./routes/googleCalendar.routes.js";
import userRoutes from "./routes/user.routes.js";
import publicBookingRoutes from "./routes/publicBooking.routes.js";
import patientAuthRoutes from "./routes/patientAuth.routes.js"
import patientBookingRoutes from "./routes/patientBooking.routes.js";
import userAuthRoutes from "./routes/userAuth.routes.js";
import medicalRecordRoutes from "./routes/medicalRecordRoutes.js";
import sessionNoteRoutes from "./routes/sessionNotes.routes.js";
import { requireUserAuth } from "./middlewares/userAuth.middleware.js";
import clinicRoutes from "./routes/clinic.routes.js";
import reportRoutes from "./routes/report.routes.js";
import documentRoutes from "./routes/document.routes.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Muitas requisições realizadas. Tente novamente mais tarde.",
  },
});

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(limiter);

app.get("/", (req, res) => {
  res.json({ message: "API rodando com sucesso" });
});


app.use("/reports", reportRoutes);
app.use("/patients", requireUserAuth, patientRoutes);
app.use("/medical-records", requireUserAuth, medicalRecordRoutes);
app.use("/session-notes", requireUserAuth, sessionNoteRoutes);
app.use("/appointments", requireUserAuth, appointmentRoutes);
app.use("/blocked-times", requireUserAuth, blockedTimeRoutes);
app.use("/spaces", requireUserAuth, spaceRoutes);
app.use("/google-calendar", googleCalendarRoutes);
app.use("/users", userRoutes);
app.use("/public-booking", publicBookingRoutes);
app.use("/patient-auth", patientAuthRoutes);
app.use("/patient-bookings", patientBookingRoutes);
app.use("/user-auth", userAuthRoutes);
app.use("/payments", paymentRoutes);
app.use("/clinics", clinicRoutes);
app.use("/documents", documentRoutes);
export default app;
// GET /public-booking/available-slots?date=2026-05-05&spaceId=ID_DO_ESPACO
