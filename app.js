import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import "./models/index.js";
import express from "express";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import stylerclothesRoutes from "./routes/stylerClothesRoutes.js";
import partnerclothesRoutes from "./routes/partnerClothesRoutes.js";
import occasionRoutes from "./routes/occasionRoutes .js";
import partnerRoutes from "./routes/partnerRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import stylerRoutes from "./routes/stylerRoutes.js";
import partnersPublicRoutes from "./routes/partnersPublicRoutes.js";

import errorHandler from "./middleware/errorHandler.js";

// Import public controller functions for root-level routes
import { getAllPartnersPublic } from "./controllers/partnerController.js";
import { getAllUsersPublic } from "./controllers/userController.js";
import { getAllStylersPublic } from "./controllers/stylerController.js";
import { getAllOccasionsPublic } from "./controllers/occasionController.js";
import { getAllPaymentsPublic } from "./controllers/paymentController.js";
import { getAllPartnerClothesPublic } from "./controllers/partnerClothesController.js";
import { getAllStylerClothesPublic } from "./controllers/stylerClothesController.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000; // Changed default to 3000 to match frontend

app.use(express.json());
app.use(cors());

connectDB().then(async () => {
  try {
    const { dropAccountIdIndex } = await import("./models/user.js");
    await dropAccountIdIndex();
  } catch (error) {
    console.error("Error cleaning up old index:", error.message);
  }
});

app.get("/", (req, res) => res.send("API running"));

// Simple test endpoint to verify server is working
app.get("/test-user-route", (req, res) => {
  res.json({ 
    message: "User route test endpoint is working",
    timestamp: new Date().toISOString(),
    note: "If you see this, the server is running. Now test /user?format=json"
  });
});

// Direct test route that definitely works
app.get("/test-direct", (req, res) => {
  res.json({ message: "Direct route works", path: req.path, query: req.query });
});

// Test partnerClothes route directly
app.get("/test-partnerclothes", (req, res) => {
  res.json({ 
    message: "PartnerClothes route test",
    note: "If you see this, routes are working. Now test /partnerClothes"
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    routes: {
      users: ["/user", "/users"],
      partners: ["/partner", "/partners"],
      stylers: ["/styler", "/stylers"],
      occasions: ["/occasion", "/occasions"],
      payments: ["/payment", "/payments"],
      partnerClothes: ["/partnerclothes", "/partnerClothes", "/partner-clothes"],
      stylerClothes: ["/stylerclothes", "/stylerClothes", "/styler-clothes"]
    },
    note: "All routes accept ?format=json query parameter"
  });
});

// Test endpoint to verify routes are working
app.get("/test-routes", (req, res) => {
  res.json({
    message: "All routes are registered",
    availableRoutes: [
      "/partner or /partners",
      "/user or /users", 
      "/styler or /stylers",
      "/occasion or /occasions",
      "/payment or /payments",
      "/partnerclothes or /partnerClothes",
      "/stylerclothes or /stylerClothes"
    ],
    note: "Add ?format=json to any route to get JSON data. All routes return JSON by default when accessed via API."
  });
});

// Root-level public routes to view all data from each table
// Support both singular and plural forms for frontend compatibility
// IMPORTANT: These routes must be defined BEFORE /api/* routes

// User routes - MUST be before /api/users to avoid conflicts
app.get("/user", (req, res) => {
  console.log('[ROUTE] GET /user called');
  getAllUsersPublic(req, res);
});
app.get("/users", (req, res) => {
  console.log('[ROUTE] GET /users called');
  getAllUsersPublic(req, res);
});

app.get("/partner", getAllPartnersPublic);
app.get("/partners", getAllPartnersPublic); // Plural form
app.get("/styler", getAllStylersPublic);
app.get("/stylers", getAllStylersPublic); // Plural form
app.get("/occasion", getAllOccasionsPublic);
app.get("/occasions", getAllOccasionsPublic); // Plural form
app.get("/payment", getAllPaymentsPublic);
app.get("/payments", getAllPaymentsPublic); // Plural form
// Partner Clothes routes - support both lowercase and camelCase
app.get("/partnerclothes", (req, res) => {
  console.log('[ROUTE] GET /partnerclothes called');
  getAllPartnerClothesPublic(req, res);
});
app.get("/partnerClothes", (req, res) => {
  console.log('[ROUTE] GET /partnerClothes called');
  getAllPartnerClothesPublic(req, res);
});
app.get("/partner-clothes", (req, res) => {
  console.log('[ROUTE] GET /partner-clothes called');
  getAllPartnerClothesPublic(req, res);
});
app.get("/partnerclothing", (req, res) => {
  console.log('[ROUTE] GET /partnerclothing called');
  getAllPartnerClothesPublic(req, res);
});
// Styler Clothes routes - support both lowercase and camelCase
app.get("/stylerclothes", getAllStylerClothesPublic);
app.get("/stylerClothes", getAllStylerClothesPublic);
app.get("/styler-clothes", getAllStylerClothesPublic);
app.get("/stylerclothing", getAllStylerClothesPublic); // Alternative

// Public/auth routes
app.use("/api/auth", authRoutes);
app.use("/api/partners", partnersPublicRoutes);

// Admin & general protected routes
app.use("/api/admin", adminRoutes);
// NOTE: /api/users is a protected route, /user and /users are public routes above
app.use("/api/users", userRoutes);
app.use("/api/partner", partnerRoutes);
app.use("/api/payment", paymentRoutes);

// Correct route wiring: clothes vs cloth vs styler
app.use("/api/stylerclothes", stylerclothesRoutes); // collection of clothes endpoints
app.use("/api/partnerclothes", partnerclothesRoutes); // single-cloth or partner-managed cloth endpoints (if you meant that)
app.use("/api/styler", stylerRoutes);

app.use("/api/occasion", occasionRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`========================================\n`);
  console.log(`Available public routes:`);
  console.log(`  GET /user or /users - Get all users`);
  console.log(`  GET /partner or /partners - Get all partners`);
  console.log(`  GET /styler or /stylers - Get all stylers`);
  console.log(`  GET /occasion or /occasions - Get all occasions`);
  console.log(`  GET /payment or /payments - Get all payments`);
  console.log(`  GET /partnerClothes - Get all partner clothes`);
  console.log(`  GET /stylerClothes - Get all styler clothes`);
  console.log(`\nTest routes:`);
  console.log(`  GET /test-direct - Test route`);
  console.log(`  GET /test-partnerclothes - Test partnerClothes route`);
  console.log(`  GET /health - Health check with all routes`);
  console.log(`\nAdd ?format=json to any route for JSON response\n`);
  console.log(`========================================\n`);
});
