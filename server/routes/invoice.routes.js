import express from "express";
import Invoice from "../models/invoice.model.js";
import { User } from '../models/user.model.js';
import {
  verifyToken
} from "../middleware/verifyToken.js";
import invoiceLog from "../models/invoice.log.js";
const router = express.Router();


router.get("/invoices", async (req, res) => {
  try {
    const {
      userId,
      status,
      page = 1,
      limit = 10,
      sortBy = 'invoiceDate',
      sortOrder = -1
    } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: "userId is required"
      });
    }

    const query = {
      userId
    };

    // Add status filter if provided
    if (status) {
      query.status = {
        $in: Array.isArray(status) ? status : [status]
      };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Set up sorting
    const sort = {};
    sort[sortBy] = parseInt(sortOrder);

    // Fetch invoices with pagination
    const invoices = await Invoice.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Invoice.countDocuments(query);

    res.status(200).json({
      invoices,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({
      error: "Failed to fetch invoices",
      details: error.message
    });
  }
});


router.get('/count', verifyToken, async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required',
      });
    }

    // 1️ Fetch signup date
    const user = await User.findById(userId).select('createdAt');
    if (!user) return res.sendStatus(404);
    const signup = user.createdAt;

    const now = new Date();

    // 2️ Compute how many full months have passed
    let monthsPassed =
      (now.getFullYear() - signup.getFullYear()) * 12 +
      (now.getMonth() - signup.getMonth());

    if (
      now.getDate() < signup.getDate() ||
      (now.getDate() === signup.getDate() && now.getHours() < signup.getHours()) ||
      (now.getDate() === signup.getDate() &&
        now.getHours() === signup.getHours() &&
        now.getMinutes() < signup.getMinutes())
    ) {
      monthsPassed--;
    }

    // 3️ Build the LAST‐RESET point
    const periodStart = new Date(signup);
    periodStart.setMonth(signup.getMonth() + monthsPassed);

    // 4️ Build the NEXT‐RESET point for display
    const nextReset = new Date(periodStart);
    nextReset.setMonth(periodStart.getMonth() + 1);

    // 5️ Count from INVOICE LOGS (not actual invoices)
    const count = await invoiceLog.countDocuments({
      userId,
      createdAt: { $gte: periodStart },
    });

    return res.json({
      success: true,
      count,
      periodStart,
      nextReset,
    });
  } catch (err) {
    console.error('Error fetching invoice count:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Could not fetch invoice count' });
  }
});


// Backend route for overview grid stats
router.get("/invoices/stats/overview", async (req, res) => {
  try {
    const {
      userId
    } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: "userId is required"
      });
    }

    // Get total invoices sent
    const totalInvoices = await Invoice.countDocuments({
      userId
    });

    // Get pending payments count
    const pendingPayments = await Invoice.countDocuments({
      userId,
      status: "pending"
    });

    // Get completed payments count
    const completedPayments = await Invoice.countDocuments({
      userId,
      status: "paid"
    });

    // Get recurring invoices count
    // Assuming you have a field like "isRecurring" or a separate "recurringInvoice" collection
    // This is just an example - adjust based on your actual data model
    const failedPayments = await Invoice.countDocuments({
      userId,
      status: "payment_failed"
    });

    // Optional: Get payment amounts
    const pendingAmount = await Invoice.aggregate([{
        $match: {
          userId,
          status: "pending"
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$amountNumeric"
          }
        }
      }
    ]);

    const completedAmount = await Invoice.aggregate([{
        $match: {
          userId,
          status: "paid"
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$amountNumeric"
          }
        }
      }
    ]);

    const failedAmount = await Invoice.aggregate([{
        $match: {
          userId,
          status: "payment_failed"
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$amountNumeric"
          }
        }
      }
    ]);

    res.status(200).json({
      totalInvoices,
      pendingPayments: {
        count: pendingPayments,
        amount: pendingAmount.length > 0 ? pendingAmount[0].total : 0
      },
      completedPayments: {
        count: completedPayments,
        amount: completedAmount.length > 0 ? completedAmount[0].total : 0
      },
      failedPayments: {
        count: failedPayments,
        amount: failedAmount.length > 0 ? failedAmount[0].total : 0
      }
    });
  } catch (error) {
    console.error("Error fetching invoice overview stats:", error);
    res.status(500).json({
      error: "Failed to fetch invoice overview statistics",
      details: error.message
    });
  }
});

// Get invoice statistics by client
// This endpoint will return the number of invoices per client
router.get("/invoices/clients", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const clientStats = await Invoice.aggregate([
      // 1. Filter to this user
      { $match: { userId } },

      // 2. Group by client, count invoices and track most recent date
      {
        $group: {
          _id: {
            clientName:    "$clientName",
            clientAddress: "$clientAddress",
          },
          invoiceCount: { $sum: 1 },
          lastInvoiceAt: { $max: "$createdAt" }, // ← capture most recent invoice date
        }
      },

      // 3. Sort by that most recent date, descending (newest first)
      { $sort: { lastInvoiceAt: -1 } },

      // 4. Project into the shape you want
      {
        $project: {
          _id: 0,
          clientName:    "$_id.clientName",
          clientAddress: "$_id.clientAddress",
          invoiceCount:  1,
          lastInvoiceAt: 1,
        }
      }
    ]);

    const totalClients = clientStats.length;

    res.json({
      success:      true,
      totalClients,
      clients:      clientStats
    });
  } catch (error) {
    console.error("Error getting client statistics:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving client statistics",
      error:   error.message
    });
  }
});


// Get invoice by ID
router.get("/invoices/:id", async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const {
      userId
    } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: "userId is required for security validation"
      });
    }

    const invoice = await Invoice.findOne({
      _id: id,
      userId
    });

    if (!invoice) {
      return res.status(404).json({
        error: "Invoice not found"
      });
    }

    res.status(200).json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({
      error: "Failed to fetch invoice",
      details: error.message
    });
  }
});


// Get invoice statistics for dashboard
router.get("/invoices/stats/summary", async (req, res) => {
  try {
    const {
      userId
    } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: "userId is required"
      });
    }

    const currentDate = new Date();
    const thirtyDaysAgo = new Date(currentDate);
    thirtyDaysAgo.setDate(currentDate.getDate() - 30);

    // Get count by status
    const statusCounts = await Invoice.aggregate([{
        $match: {
          userId
        }
      },
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1
          }
        }
      }
    ]);

    // Sum of amounts by status
    const amountByStatus = await Invoice.aggregate([{
        $match: {
          userId
        }
      },
      {
        $group: {
          _id: "$status",
          total: {
            $sum: "$amountNumeric"
          }
        }
      }
    ]);

    // Recent activity (last 30 days)
    const recentActivity = await Invoice.aggregate([{
        $match: {
          userId,
          sentDate: {
            $gte: thirtyDaysAgo
          }
        }
      },
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1
          },
          total: {
            $sum: "$amountNumeric"
          }
        }
      }
    ]);

    // Get monthly breakdown for the current year
    const currentYear = currentDate.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);

    // Monthly breakdown for revenue chart
    const monthlyData = await Invoice.aggregate([{
        $match: {
          userId,
          sentDate: {
            $gte: startOfYear
          }
        }
      },
      {
        $project: {
          month: {
            $month: "$sentDate"
          },
          status: 1,
          amountNumeric: 1
        }
      },
      {
        $group: {
          _id: {
            month: "$month",
            status: "$status"
          },
          total: {
            $sum: "$amountNumeric"
          }
        }
      },
      {
        $sort: {
          "_id.month": 1
        }
      }
    ]);

    // Process monthly data into a more usable format
    const monthlyRevenue = Array(12).fill(0);
    const monthlyPending = Array(12).fill(0);
    const monthlyFailed = Array(12).fill(0);

    monthlyData.forEach(item => {
      const month = item._id.month - 1; // Convert to 0-indexed
      const status = item._id.status;

      if (status === "paid") {
        monthlyRevenue[month] = item.total;
      } else if (status === "pending") {
        monthlyPending[month] = item.total;
      } else if (status === "payment_failed") {
        monthlyFailed[month] = item.total;
      };
    });

    // Calculate month-over-month change
    const currentMonth = currentDate.getMonth();
    const previousMonth = (currentMonth - 1 + 12) % 12;

    let percentChange = 0;
    if (monthlyRevenue[previousMonth] > 0) {
      percentChange = Math.round(
        ((monthlyRevenue[currentMonth] - monthlyRevenue[previousMonth]) /
          monthlyRevenue[previousMonth]) * 100
      );
    }

    res.status(200).json({
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      amountByStatus: amountByStatus.reduce((acc, item) => {
        acc[item._id] = item.total;
        return acc;
      }, {}),
      recentActivity: recentActivity.reduce((acc, item) => {
        acc[item._id] = {
          count: item.count,
          total: item.total
        };
        return acc;
      }, {}),
      monthlyData: {
        revenue: monthlyRevenue,
        pending: monthlyPending,
        failed: monthlyFailed,
        percentChange: percentChange
      }
    });
  } catch (error) {
    console.error("Error fetching invoice stats:", error);
    res.status(500).json({
      error: "Failed to fetch invoice statistics",
      details: error.message
    });
  }
});

// Delete invoice
router.delete("/invoices/:id", async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const {
      userId
    } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: "userId is required"
      });
    }

    const invoice = await Invoice.findOneAndDelete({
      _id: id,
      userId
    });

    if (!invoice) {
      return res.status(404).json({
        error: "Invoice not found"
      });
    }

    res.status(200).json({
      message: "Invoice deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    res.status(500).json({
      error: "Failed to delete invoice",
      details: error.message
    });
  }
});

// Export the router
export default router;