import express from "express";
import cors from "cors";
import clientRoutes from "./routes/client.routes.js";

import appointmentRoutes from "./routes/appointment.routes.js";
import blockedTimeRoutes from "./routes/blockedTime.routes.js";
import spaceRoutes from "./routes/space.routes.js";
import googleCalendarRoutes from "./routes/googleCalendar.routes.js";
import userRoutes from "./routes/user.routes.js";
import publicBookingRoutes from "./routes/publicBooking.routes.js";
import clientAuthRoutes from "./routes/clientAuth.routes.js"
import clientBookingRoutes from "./routes/clientBooking.routes.js";
import userAuthRoutes from "./routes/userAuth.routes.js";
import { requireUserAuth } from "./middlewares/userAuth.middleware.js";
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API rodando com sucesso" });
});

app.use("/clients", requireUserAuth, clientRoutes);
app.use("/appointments", requireUserAuth, appointmentRoutes);
app.use("/blocked-times", requireUserAuth, blockedTimeRoutes);
app.use("/spaces", requireUserAuth, spaceRoutes);
app.use("/google-calendar", googleCalendarRoutes);
app.use("/users", userRoutes);
app.use("/public-booking", publicBookingRoutes);
app.use("/client-auth", clientAuthRoutes);
app.use("/client-bookings", clientBookingRoutes);
app.use("/user-auth", userAuthRoutes);
export default app;
// GET /public-booking/available-slots?date=2026-05-05&spaceId=ID_DO_ESPACO