import mongoose from "mongoose";
import { PartnerCloth } from "../models/partnerClothes.js";

// Helper function to escape HTML
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/** Pagination helper */
function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.max(1, Math.min(100, parseInt(query.limit || "10", 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/** Build filter from query */
function buildFilterFromQuery(query, extras = {}) {
  const filter = { ...extras };

  if (query.search) {
    const q = query.search.trim();
    const regex = { $regex: q, $options: "i" };
    filter.$or = [{ name: regex }, { color: regex }, { category: regex }];
  }

  if (query.category) filter.category = query.category;
  if (query.color) filter.color = { $regex: query.color, $options: "i" };

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice != null) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice != null) filter.price.$lte = Number(query.maxPrice);
  }

  if (query.ownerId && isValidObjectId(query.ownerId)) {
    filter.ownerId = query.ownerId;
  }

  if (query.visibility) filter.visibility = query.visibility;
  if (query.ownerType) filter.ownerType = query.ownerType;

  return filter;
}

/** Parse sort string like "createdAt:desc,price:asc" */
function parseSort(sortStr) {
  if (!sortStr) return { createdAt: -1 };
  const sort = {};
  sortStr.split(",").forEach((part) => {
    const [field, dir] = part.split(":").map((s) => s.trim());
    if (!field) return;
    sort[field] = dir === "asc" ? 1 : -1;
  });
  return sort;
}

/** ---------------------- CRUD & LIST FUNCTIONS ---------------------- **/

/** Create cloth */
export const createCloth = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (req.user.role !== "partner") return res.status(403).json({ error: "Partner role required" });

    const { name, color, category, price, image } = req.body;
    if (!name || !color || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const cloth = new PartnerCloth({
      name,
      color,
      category,
      price: price || 0,
      image: image || "https://yourcdn.com/default-cloth.jpg",
      ownerType: "partner",
      ownerId: req.user._id,
      visibility: "public",
    });

    const saved = await cloth.save();
    res.status(201).json({ message: "Cloth created", cloth: saved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** Get single cloth by ID */
export const getClothById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid ID" });

    const cloth = await PartnerCloth.findById(id);
    if (!cloth) return res.status(404).json({ error: "Cloth not found" });

    if (cloth.visibility === "private") {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const isOwner = String(cloth.ownerId) === String(req.user._id);
      const isAdmin = req.user.role === "admin";
      if (!isOwner && !isAdmin) return res.status(403).json({ error: "Access denied" });
    }

    res.status(200).json(cloth);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** Update cloth */
export const updateCloth = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid ID" });

    const cloth = await PartnerCloth.findById(id);
    if (!cloth) return res.status(404).json({ error: "Cloth not found" });

    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const isOwner = String(cloth.ownerId) === String(req.user._id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ error: "Access denied" });

    const updated = await PartnerCloth.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    res.status(200).json({ message: "Cloth updated", cloth: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** Delete cloth */
export const deleteCloth = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid ID" });

    const cloth = await PartnerCloth.findById(id);
    if (!cloth) return res.status(404).json({ error: "Cloth not found" });

    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const isOwner = String(cloth.ownerId) === String(req.user._id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ error: "Access denied" });

    await PartnerCloth.findByIdAndDelete(id);
    res.status(200).json({ message: "Cloth deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** List public cloths with search/filter/pagination/sort */
export const getPublicCloths = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const sort = parseSort(req.query.sort);
    const extras = { visibility: "public", ownerType: "partner" };
    const filter = buildFilterFromQuery(req.query, extras);

    const [total, clothes] = await Promise.all([
      PartnerCloth.countDocuments(filter),
      PartnerCloth.find(filter).sort(sort).skip(skip).limit(limit),
    ]);

    const pages = Math.max(1, Math.ceil(total / limit));
    res.status(200).json({ meta: { total, page, limit, pages }, data: clothes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** List my cloths (partner) */
export const getMyCloths = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { page, limit, skip } = parsePagination(req.query);
    const sort = parseSort(req.query.sort);
    const extras = { ownerId: req.user._id };
    const filter = buildFilterFromQuery(req.query, extras);

    const [total, clothes] = await Promise.all([
      PartnerCloth.countDocuments(filter),
      PartnerCloth.find(filter).sort(sort).skip(skip).limit(limit),
    ]);

    const pages = Math.max(1, Math.ceil(total / limit));
    res.status(200).json({ meta: { total, page, limit, pages }, data: clothes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** Suggestions for stylers */
export const getSuggestions = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (req.user.role !== "styler") return res.status(403).json({ error: "Styler role required" });

    const { page, limit, skip } = parsePagination(req.query);
    const sort = parseSort(req.query.sort);
    const extras = { visibility: "public", ownerType: "partner" };
    const filter = buildFilterFromQuery(req.query, extras);

    const [total, suggestions] = await Promise.all([
      PartnerCloth.countDocuments(filter),
      PartnerCloth.find(filter).sort(sort).skip(skip).limit(limit),
    ]);

    const pages = Math.max(1, Math.ceil(total / limit));
    res.status(200).json({ meta: { total, page, limit, pages }, data: suggestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Public route to get all partner clothes with all fields
export const getAllPartnerClothesPublic = async (req, res) => {
  try {
    // Check database connection
    const dbState = mongoose.connection.readyState;
    const isConnected = dbState === 1; // 1 = connected
    
    const clothes = await PartnerCloth.find({})
      .sort({ createdAt: -1 })
      .populate("ownerId", "-password")
      .lean();
    
    // Return HTML for browser requests (unless JSON is explicitly requested)
    // Check if request wants JSON (via query param or Accept header)
    const wantsJson = req.query.format === 'json' || 
                     (req.headers.accept && req.headers.accept.includes('application/json'));
    
    if (!wantsJson) {
      // Set content type to HTML
      res.setHeader('Content-Type', 'text/html');
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Partner Clothes - FitFlow API</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 1600px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { font-size: 1.1em; opacity: 0.9; }
        .stats {
            padding: 20px 30px;
            background: #f8f9fa;
            border-bottom: 2px solid #e9ecef;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .stats .total {
            font-size: 1.2em;
            font-weight: bold;
            color: #667eea;
        }
        .table-container {
            overflow-x: auto;
            padding: 30px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.95em;
        }
        thead {
            background: #667eea;
            color: white;
        }
        th {
            padding: 15px;
            text-align: left;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.85em;
            letter-spacing: 0.5px;
        }
        td {
            padding: 15px;
            border-bottom: 1px solid #e9ecef;
        }
        tbody tr:hover {
            background: #f8f9fa;
        }
        tbody tr:last-child td {
            border-bottom: none;
        }
        .badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 600;
        }
        .badge.public {
            background: #d4edda;
            color: #155724;
        }
        .badge.private {
            background: #fff3cd;
            color: #856404;
        }
        .empty {
            text-align: center;
            padding: 60px 20px;
            color: #6c757d;
        }
        .empty-icon {
            font-size: 4em;
            margin-bottom: 20px;
        }
        button:hover {
            opacity: 0.8;
            transform: translateY(-1px);
        }
        code {
            background: #f8f9fa;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        .image-cell {
            max-width: 100px;
            max-height: 100px;
        }
        .image-cell img {
            max-width: 100%;
            max-height: 100px;
            border-radius: 4px;
            object-fit: cover;
        }
    </style>
    <script>
        function viewCloth(id) {
            alert('View Cloth ID: ' + id + '\\n\\nThis would open a detail view.');
        }
        
        function editCloth(id) {
            alert('Edit Cloth ID: ' + id + '\\n\\nThis would open an edit form.');
        }
        
        function deleteCloth(id) {
            if (confirm('Are you sure you want to delete this cloth item ' + id + '?')) {
                alert('Delete Cloth ID: ' + id + '\\n\\nThis would delete the cloth item.');
            }
        }
    </script>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>👕 Partner Clothes Table</h1>
            <p>All partner clothes records from the database</p>
        </div>
        <div class="stats">
            <div class="total">Total Records: ${clothes.length}</div>
            <div style="color: #6c757d;">
                ${isConnected ? '🟢 Database Connected' : '🔴 Database Disconnected'}
            </div>
        </div>
        <div class="table-container">
            ${!isConnected ? `
                <div class="empty">
                    <div class="empty-icon">⚠️</div>
                    <h2>Database Connection Error</h2>
                    <p>Unable to connect to the database. Please check your MongoDB connection.</p>
                </div>
            ` : clothes.length === 0 ? `
                <div class="empty">
                    <div class="empty-icon">📭</div>
                    <h2>No Partner Clothes Found</h2>
                    <p>The partner clothes table is currently empty. Add some clothes to see them here.</p>
                </div>
            ` : `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Image</th>
                        <th>Color</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Owner</th>
                        <th>Visibility</th>
                        <th>Created At</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${clothes.map(cloth => {
                      const clothId = cloth._id ? cloth._id.toString() : 'N/A';
                      const name = cloth.name || 'N/A';
                      const image = cloth.image || '';
                      const color = cloth.color || 'N/A';
                      const category = cloth.category || 'N/A';
                      const price = cloth.price !== undefined && cloth.price !== null ? cloth.price : 0;
                      const ownerName = cloth.ownerId && cloth.ownerId.email ? cloth.ownerId.email : (cloth.ownerId ? cloth.ownerId.toString() : 'N/A');
                      const visibility = cloth.visibility || 'public';
                      const createdAt = cloth.createdAt ? new Date(cloth.createdAt).toLocaleString() : 'N/A';
                      
                      // Escape HTML for security
                      const safeName = escapeHtml(name);
                      const safeImage = escapeHtml(image);
                      const safeColor = escapeHtml(color);
                      const safeCategory = escapeHtml(category);
                      const safeOwnerName = escapeHtml(ownerName);
                      const safeClothId = escapeHtml(clothId);
                      
                      return `
                        <tr>
                            <td><code style="font-size: 0.85em;">${safeClothId.substring(0, 8)}...</code></td>
                            <td><strong>${safeName}</strong></td>
                            <td class="image-cell">
                                ${image ? `<img src="${safeImage}" alt="${safeName}" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';"><span style="display:none;">No Image</span>` : '<span style="color: #6c757d;">No Image</span>'}
                            </td>
                            <td>${safeColor}</td>
                            <td>${safeCategory}</td>
                            <td>$${price.toFixed(2)}</td>
                            <td>${safeOwnerName}</td>
                            <td>
                                <span class="badge ${visibility === 'public' ? 'public' : 'private'}">
                                    ${visibility === 'public' ? '🌐 Public' : '🔒 Private'}
                                </span>
                            </td>
                            <td>${createdAt}</td>
                            <td>
                                <button onclick="viewCloth('${safeClothId}')" style="padding: 5px 10px; margin: 2px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85em;">View</button>
                                <button onclick="editCloth('${safeClothId}')" style="padding: 5px 10px; margin: 2px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85em;">Edit</button>
                                <button onclick="deleteCloth('${safeClothId}')" style="padding: 5px 10px; margin: 2px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85em;">Delete</button>
                            </td>
                        </tr>
                      `;
                    }).join('')}
                </tbody>
            </table>
            `}
        </div>
    </div>
</body>
</html>`;
      return res.status(200).send(html);
    }
    
    // Return JSON for API requests
    res.status(200).json({
      total: clothes.length,
      data: clothes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};