import Bree from "bree";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bree = new Bree({
  root: path.join(__dirname, "../jobs"),
  jobs: [
    {
      name: "appointmentReminder",
      path: path.join(__dirname, "../jobs/appointmentReminder.job.js"),
      interval: "1m"
    }
  ]
});

export default bree;