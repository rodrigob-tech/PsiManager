import api from "./api"
export const getPsychologists = (headers = {}) =>
    api.get("/users/psychologists", { headers });