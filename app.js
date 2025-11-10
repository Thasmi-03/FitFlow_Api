import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import "./models/index.js";
import express from "express";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import clothesRoutes from "./routes/clothesRoutes.js";
import occasionRoutes from "./routes/occasionRoutes .js"
import partnerRoutes from "./routes/partnerRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import stylerRoutes from "./routes/stylerRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(express.json());
app.use(cors());

connectDB().then(async () => {
  // Drop old accountId index if it exists (from previous schema)
  try {
    const { dropAccountIdIndex } = await import("./models/user.js");
    await dropAccountIdIndex();
  } catch (error) {
    console.error("Error cleaning up old index:", error.message);
  }
});

app.get("/", (req, res) => res.send("API running"));

// Authentication routes (public)
app.use("/api/auth", authRoutes);

// Admin routes (require admin authentication)
app.use("/api/admin", adminRoutes);

// Protected routes
app.use("/api/users", userRoutes);
app.use("/api/partner", partnerRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/clothes", clothesRoutes);
app.use("/api/styler", stylerRoutes);
app.use("/api/occasion", occasionRoutes);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
