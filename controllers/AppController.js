// controllers/AppController.js

const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

exports.getStatus = async (req, res) => {
  const redisAlive = await redisClient.isAlive();
  const dbAlive = await dbClient.isAlive();

  if (redisAlive && dbAlive) {
    return res.status(200).json({ redis: true, db: true });
  } else {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getStats = async (req, res) => {
  const usersCount = await dbClient.nbUsers();
  const filesCount = await dbClient.nbFiles();

  if (usersCount !== -1 && filesCount !== -1) {
    return res.status(200).json({ users: usersCount, files: filesCount });
  } else {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

