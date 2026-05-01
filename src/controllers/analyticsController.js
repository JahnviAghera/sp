const Analytics = require('../models/Analytics');
const User = require('../models/User');

exports.getUserAnalytics = async (req, res) => {
  try {
    const analytics = await Analytics.find({ user: req.user.id }).populate('session');
    
    // Aggregation for quick stats
    const totalSpeakingTime = analytics.reduce((acc, curr) => acc + curr.speakingTimeSecs, 0);
    const avgFluency = analytics.length ? analytics.reduce((acc, curr) => acc + curr.metrics.fluency, 0) / analytics.length : 0;
    
    res.json({
      analytics,
      stats: {
        totalSessions: analytics.length,
        totalSpeakingTime,
        avgFluency: avgFluency.toFixed(2)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({})
      .sort({ 'stats.totalSpeakingTime': -1, 'stats.sessionsParticipated': -1 })
      .limit(10)
      .select('name avatarUrl stats');
    res.json({ leaderboard: users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
