// cronJobs/deleteOldUsers.js
import { schedule } from 'node-cron';
import { User } from "../models/user.model.js";

schedule('0 0 * * *', async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  try {
    const result = await User.deleteMany({
      isDeleted: true,
      deletedAt: { $lte: thirtyDaysAgo }
    });

    console.log(`Hard deleted ${result.deletedCount} users.`);
  } catch (err) {
    console.error("Failed to hard delete users:", err);
  }
});
