import { google } from "googleapis";

// Parse service account dari ENV
const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_JSON);

export const sheets = google.sheets({
  version: "v4",
  auth: new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  }),
});
