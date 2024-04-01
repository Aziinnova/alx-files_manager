// controllers/UsersController.js

const { v4: uuidv4 } = require('uuid');
const dbClient = require('../utils/db');
const crypto = require('crypto');

exports.postNew = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }

  if (!password) {
    return res.status(400).json({ error: 'Missing password' });
  }

  try {
    const db = dbClient.client.db();
    const usersCollection = db.collection('users');

    // Check if the email already exists
    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

    // Create new user
    const newUser = {
      email,
      password: hashedPassword,
      _id: uuidv4(), // Generate a unique id
    };

    // Insert the new user into the database
    const result = await usersCollection.insertOne(newUser);

    if (result.insertedCount === 1) {
      return res.status(201).json({ email: newUser.email, id: newUser._id });
    } else {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

