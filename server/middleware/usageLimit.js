// middleware/usageLimit.js
import { User } from '../models/user.model.js';
import Invoice from '../models/invoice.model.js'; // adjust import path

export async function enforceMonthlyLimit(req, res, next) {
  const userId = req.user.id;
  const user = await User.findById(userId).select('tier createdAt');

  if (!user) {
    return res.sendStatus(404);
  }

  // 1️ Pro users: no limit
  if (user.tier === 'pro') {
    return next();
  }

  // 2️ Compute the start of the current billing period
  const signup = user.createdAt;
  const now    = new Date();

  let monthsPassed =
    (now.getFullYear() - signup.getFullYear()) * 12 +
    (now.getMonth() - signup.getMonth());

  // If we haven’t yet reached the signup‑day/time this month, subtract one
  if (
    now.getDate() < signup.getDate() ||
    (now.getDate() === signup.getDate() && now.getHours() < signup.getHours()) ||
    (now.getDate() === signup.getDate() &&
     now.getHours() === signup.getHours() &&
     now.getMinutes() < signup.getMinutes())
  ) {
    monthsPassed--;
  }

  const periodStart = new Date(signup);
  periodStart.setMonth(signup.getMonth() + monthsPassed);

  // 3️ Count how many invoices this user has created since periodStart
  const sentThisPeriod = await Invoice.countDocuments({
    userId,
    createdAt: { $gte: periodStart }
  });

  // 4️ Enforce the free‑tier cap
  if (sentThisPeriod >= 10) {
    return res.status(403).json({
      success: false,
      message: 'Monthly free‑tier limit reached. Upgrade to Pro for unlimited invoices.',
      nextReset: new Date(periodStart).setMonth(periodStart.getMonth() + 1)
    });
  }

  // 5️ Optionally attach usage info to the request
  req.usage = {
    sentThisPeriod,
    periodStart,
    nextReset: new Date(periodStart).setMonth(periodStart.getMonth() + 1)
  };

  next();
}
