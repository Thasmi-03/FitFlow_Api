import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import weatherRoutes from "./routes/weatherRoutes.js";
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

connectDB();

app.get("/", (req, res) => res.send("API running"));

app.use("/api/users", userRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/partner", partnerRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/clothes", clothesRoutes);
app.use("/api/styler", stylerRoutes);
app.use("/api/occasion", occasionRoutes);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
