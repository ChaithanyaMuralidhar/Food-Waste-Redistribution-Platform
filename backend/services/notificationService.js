const Notification = require('../models/Notification');
const User = require('../models/User');

async function notifyUsers(userIds, { type, title, message, foodListing }) {
  const notifications = userIds.map((recipient) => ({
    recipient,
    type,
    title,
    message,
    foodListing,
  }));
  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }
}

async function notifyNgosAndVolunteers(foodListing) {
  const recipients = await User.find({
    role: { $in: ['ngo', 'volunteer'] },
    isActive: true,
  }).select('_id');

  const userIds = recipients.map((u) => u._id);
  await notifyUsers(userIds, {
    type: 'new_food',
    title: 'New surplus food available',
    message: `${foodListing.title} — ${foodListing.quantity} ${foodListing.unit}. Pick up before ${new Date(foodListing.expiryTime).toLocaleString()}.`,
    foodListing: foodListing._id,
  });
}

module.exports = { notifyUsers, notifyNgosAndVolunteers };
