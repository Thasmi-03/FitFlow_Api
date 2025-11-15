import mongoose from "mongoose";
import Partner from "../models/partner.js";

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

export const getAllPartners = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const requestedLimit = parseInt(req.query.limit, 10) || 10;
    const MAX_LIMIT = 50;
    const limit = Math.min(requestedLimit, MAX_LIMIT);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.name) filter.name = new RegExp(req.query.name, "i");

    const total = await Partner.countDocuments(filter);
    const data = await Partner.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPartnerById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "Invalid ID format" });

    const partner = await Partner.findById(req.params.id);
    if (!partner) return res.status(404).json({ error: "Partner not found." });
    res.status(200).json(partner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createPartner = async (req, res) => {
  try {
    const newPartner = new Partner(req.body);
    const saved = await newPartner.save();
    res.status(201).json({ message: "Partner created", partner: saved });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(e => {
        const message = e.message;
        if (message.includes("is required")) {
          return message.replace(/Path `(.+)` is required\./, "$1 is required");
        }
        return message;
      });
      return res.status(400).json({ error: errors.join(", ") });
    }
    res.status(500).json({ error: error.message });
  }
};

export const updatePartner = async (req, res) => {
  try {
    const updated = await Partner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ error: "Partner not found." });
    res.status(200).json({ message: "Partner updated", partner: updated });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(e => {
        const message = e.message;
        if (message.includes("is required")) {
          return message.replace(/Path `(.+)` is required\./, "$1 is required");
        }
        return message;
      });
      return res.status(400).json({ error: errors.join(", ") });
    }
    res.status(500).json({ error: error.message });
  }
};

export const deletePartner = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "Invalid ID format" });

    const deleted = await Partner.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Partner not found." });
    res.status(200).json({ message: "Partner deleted", partner: deleted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Public route to get all partners with all fields
export const getAllPartnersPublic = async (req, res) => {
  try {
    // Check database connection
    const dbState = mongoose.connection.readyState;
    const isConnected = dbState === 1; // 1 = connected
    
    const partners = await Partner.find({}).sort({ createdAt: -1 }).lean();
    
    // Return HTML for browser requests (unless JSON is explicitly requested via ?format=json)
    const wantsJson = req.query.format === 'json';
    
    if (!wantsJson) {
      // Set content type to HTML
      res.setHeader('Content-Type', 'text/html');
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Partners - FitFlow API</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 1400px;
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
        .badge.approved {
            background: #d4edda;
            color: #155724;
        }
        .badge.pending {
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
    </style>
    <script>
        function escapeHtml(text) {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text ? text.replace(/[&<>"']/g, m => map[m]) : '';
        }
        
        function viewPartner(id) {
            alert('View Partner ID: ' + id + '\\n\\nThis would open a detail view.');
        }
        
        function editPartner(id) {
            alert('Edit Partner ID: ' + id + '\\n\\nThis would open an edit form.');
        }
        
        function deletePartner(id) {
            if (confirm('Are you sure you want to delete partner ' + id + '?')) {
                alert('Delete Partner ID: ' + id + '\\n\\nThis would delete the partner.');
            }
        }
    </script>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Partners Table</h1>
            <p>All partner records from the database</p>
        </div>
        <div class="stats">
            <div class="total">Total Records: ${partners.length}</div>
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
            ` : partners.length === 0 ? `
                <div class="empty">
                    <div class="empty-icon">📭</div>
                    <h2>No Partners Found</h2>
                    <p>The partners table is currently empty. Add some partners to see them here.</p>
                </div>
            ` : `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Location</th>
                        <th>Partnership Fee</th>
                        <th>Status</th>
                        <th>Created At</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${partners.map(partner => {
                      const partnerId = partner._id ? partner._id.toString() : 'N/A';
                      const name = partner.name || 'N/A';
                      const email = partner.email || 'N/A';
                      const phone = partner.phone || 'N/A';
                      const location = partner.location || 'N/A';
                      const fee = partner.partnershipFee !== undefined && partner.partnershipFee !== null ? partner.partnershipFee : 0;
                      const isApproved = partner.isApproved === true;
                      const createdAt = partner.createdAt ? new Date(partner.createdAt).toLocaleString() : 'N/A';
                      
                      // Escape HTML for security
                      const safeName = escapeHtml(name);
                      const safeEmail = escapeHtml(email);
                      const safePhone = escapeHtml(phone);
                      const safeLocation = escapeHtml(location);
                      const safePartnerId = escapeHtml(partnerId);
                      
                      return `
                        <tr>
                            <td><code style="font-size: 0.85em;">${safePartnerId.substring(0, 8)}...</code></td>
                            <td><strong>${safeName}</strong></td>
                            <td>${safeEmail}</td>
                            <td>${safePhone}</td>
                            <td>${safeLocation}</td>
                            <td>$${fee.toFixed(2)}</td>
                            <td>
                                <span class="badge ${isApproved ? 'approved' : 'pending'}">
                                    ${isApproved ? '✓ Approved' : '⏳ Pending'}
                                </span>
                            </td>
                            <td>${createdAt}</td>
                            <td>
                                <button onclick="viewPartner('${safePartnerId}')" style="padding: 5px 10px; margin: 2px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85em;">View</button>
                                <button onclick="editPartner('${safePartnerId}')" style="padding: 5px 10px; margin: 2px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85em;">Edit</button>
                                <button onclick="deletePartner('${safePartnerId}')" style="padding: 5px 10px; margin: 2px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85em;">Delete</button>
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
      total: partners.length,
      data: partners
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};