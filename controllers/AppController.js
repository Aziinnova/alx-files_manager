const { isRedisAlive, isDbAlive } = require('../utils');

const AppController = {
  getStatus: (req, res) => {
    const redisAlive = isRedisAlive();
    const dbAlive = isDbAlive();
    const status = {
      redis: redisAlive,
      db: dbAlive
    };
    res.status(200).json(status);
  },

  getStats: (req, res) => {
    // Assuming you have functions to get user and file counts from the database
    const usersCount = getUsersCount();
    const filesCount = getFilesCount();
    const stats = {
      users: usersCount,
      files: filesCount
    };
    res.status(200).json(stats);
  }
};

module.exports = AppController;

