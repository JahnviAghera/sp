const Analytics = require('../models/Analytics');

exports.getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await Analytics.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    
    // Aggregated stats
    const totalSessions = await Analytics.countDocuments({ user: userId });
    const averageMetrics = await Analytics.aggregate([
      { $match: { user: req.user._id } }, // Match by ObjectId
      {
        $group: {
          _id: null,
          avgFluency: { $avg: '$metrics.fluency' },
          avgConfidence: { $avg: '$metrics.confidence' },
          avgRelevance: { $avg: '$metrics.relevance' },
          totalSpeakingTime: { $sum: '$speakingTimeSecs' }
        }
      }
    ]);

    res.json({
      history,
      summary: averageMetrics[0] || {
        avgFluency: 0,
        avgConfidence: 0,
        avgRelevance: 0,
        totalSpeakingTime: 0
      },
      totalSessions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Analytics.aggregate([
      {
        $group: {
          _id: '$user',
          overallScore: { $avg: '$metrics.overallScore' },
          sessionsCount: { $sum: 1 }
        }
      },
      { $sort: { overallScore: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          name: '$userInfo.name',
          score: '$overallScore',
          sessions: '$sessionsCount'
        }
      }
    ]);
    res.json({ leaderboard });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
