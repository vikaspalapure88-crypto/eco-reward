const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { demoData } = require('./data/demoData');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const { MONGO_URI, CLIENT_URL } = process.env;

app.use(cors({ origin: CLIENT_URL || '*' }));
app.use(express.json({ limit: '10mb' }));

const memoryStore = {
  users: [...demoData.users],
  activities: [...demoData.activities],
  withdrawals: [...demoData.withdrawals],
  leaderboard: [...demoData.leaderboard],
  mapPoints: [...demoData.mapPoints],
};

const connectMongo = async () => {
  if (!MONGO_URI) {
    console.log('MongoDB URI not configured. Using in-memory demo storage.');
    return;
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('MongoDB connection failed, using demo storage:', error.message);
  }
};

const userByEmail = (email) => memoryStore.users.find((user) => user.email.toLowerCase() === String(email).toLowerCase());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'EcoReward API is running', mode: MONGO_URI ? 'mongodb' : 'demo' });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  if (userByEmail(email)) {
    return res.status(409).json({ success: false, message: 'User already exists.' });
  }

  const newUser = {
    id: `user_${Date.now()}`,
    name,
    email,
    phone,
    password,
    totalPoints: 0,
    totalActivities: 0,
    totalWaste: 0,
    rupeeBalance: 0,
    profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
    location: { lat: 19.076, lng: 72.877 },
    joinedAt: new Date().toISOString(),
  };

  memoryStore.users.push(newUser);

  res.status(201).json({ success: true, user: newUser });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = userByEmail(email);

  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  res.json({ success: true, user });
});

app.get('/api/dashboard/:userId', (req, res) => {
  const user = memoryStore.users.find((entry) => entry.id === req.params.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const history = memoryStore.activities
    .filter((activity) => activity.userId === req.params.userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const summary = {
    user,
    totalPoints: user.totalPoints,
    totalActivities: history.length,
    totalWaste: user.totalWaste,
    balanceRupees: user.rupeeBalance,
    history,
    chartData: [
      { name: 'Mon', points: 40 },
      { name: 'Tue', points: 30 },
      { name: 'Wed', points: 65 },
      { name: 'Thu', points: 75 },
      { name: 'Fri', points: 35 },
      { name: 'Sat', points: 80 },
      { name: 'Sun', points: 90 },
    ],
  };

  res.json({ success: true, data: summary });
});

app.get('/api/admin', (req, res) => {
  const pendingActivities = memoryStore.activities.filter((activity) => activity.status === 'Pending');
  const users = memoryStore.users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    totalPoints: user.totalPoints,
    totalWaste: user.totalWaste,
    location: user.location,
  }));

  const withdrawals = memoryStore.withdrawals.map((withdrawal) => ({
    ...withdrawal,
    upi: withdrawal.upi || 'demo@upi',
  }));

  res.json({
    success: true,
    data: {
      users,
      pendingActivities,
      withdrawals,
      stats: {
        totalUsers: users.length,
        activeCleanups: pendingActivities.length,
        pendingApprovals: withdrawals.filter((item) => item.status === 'Pending').length,
      },
    },
  });
});

app.get('/api/map', (req, res) => {
  res.json({ success: true, data: memoryStore.mapPoints });
});

app.get('/api/leaderboard', (req, res) => {
  const sorted = [...memoryStore.leaderboard].sort((a, b) => b.points - a.points);
  res.json({ success: true, data: sorted });
});

app.post('/api/activities', (req, res) => {
  const { userId, title, area, wasteKg, level, beforeImage, afterImage, lat, lng } = req.body;

  if (!userId || !title || !area || !wasteKg || !level) {
    return res.status(400).json({ success: false, message: 'Missing activity details.' });
  }

  const user = memoryStore.users.find((entry) => entry.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const pointsMap = { Small: 10, Medium: 25, Large: 50 };
  const points = pointsMap[level] || 10;

  const activity = {
    id: `activity_${Date.now()}`,
    userId,
    title,
    area,
    wasteKg: Number(wasteKg),
    level,
    points,
    status: 'Pending',
    beforeImage: beforeImage || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    afterImage: afterImage || 'https://images.unsplash.com/photo-1522493562229-111ce8d0f63f?auto=format&fit=crop&w=800&q=80',
    lat: lat || 19.076,
    lng: lng || 72.877,
    date: new Date().toISOString(),
  };

  memoryStore.activities.unshift(activity);

  memoryStore.mapPoints.push({
    id: activity.id,
    name: area,
    lat: activity.lat,
    lng: activity.lng,
    pollution: level === 'Small' ? 'Low' : level === 'Medium' ? 'Moderate' : 'High',
    type: 'Cleaned',
  });

  res.status(201).json({ success: true, message: 'Cleaning activity submitted for verification.', activity });
});

app.post('/api/withdrawals', (req, res) => {
  const { userId, amount, upi, reason } = req.body;

  if (!userId || !amount || !upi) {
    return res.status(400).json({ success: false, message: 'User ID, amount, and UPI ID are required.' });
  }

  const user = memoryStore.users.find((entry) => entry.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const minWithdrawal = 200;
  const rewardAmount = Number(amount);

  if (rewardAmount < minWithdrawal) {
    return res.status(400).json({ success: false, message: `Minimum withdrawal is ₹${minWithdrawal}.` });
  }

  const withdrawal = {
    id: `withdrawal_${Date.now()}`,
    userId,
    userName: user.name,
    amount: rewardAmount,
    upi,
    reason: reason || 'UPI payout',
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };

  memoryStore.withdrawals.unshift(withdrawal);

  res.status(201).json({ success: true, message: 'Withdrawal request created successfully.', withdrawal });
});

app.patch('/api/admin/review-activity', (req, res) => {
  const { id, status, pointsAwarded } = req.body;
  const activity = memoryStore.activities.find((entry) => entry.id === id);

  if (!activity) {
    return res.status(404).json({ success: false, message: 'Activity not found.' });
  }

  activity.status = status === 'Approved' ? 'Approved' : 'Rejected';
  if (status === 'Approved') {
    const user = memoryStore.users.find((entry) => entry.id === activity.userId);
    if (user) {
      user.totalPoints += Number(pointsAwarded || activity.points);
      user.totalActivities += 1;
      user.totalWaste += Number(activity.wasteKg || 0);
      user.rupeeBalance = Number((user.totalPoints / 10).toFixed(2));
    }
  }

  res.json({ success: true, activity });
});

app.patch('/api/admin/review-withdrawal', (req, res) => {
  const { id, status } = req.body;
  const withdrawal = memoryStore.withdrawals.find((entry) => entry.id === id);

  if (!withdrawal) {
    return res.status(404).json({ success: false, message: 'Withdrawal request not found.' });
  }

  withdrawal.status = status === 'Approved' ? 'Approved' : 'Rejected';
  res.json({ success: true, withdrawal });
});

connectMongo();

app.listen(PORT, () => {
  console.log(`EcoReward server running on http://localhost:${PORT}`);
});
