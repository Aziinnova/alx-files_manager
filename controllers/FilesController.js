// controllers/FilesController.js

const { v4: uuidv4 } = require('uuid');
const dbClient = require('../utils/db');
const fs = require('fs');

exports.postUpload = async (req, res) => {
  const { name, type, parentId = '0', isPublic = false, data } = req.body;
  const userId = req.userId; // Assuming userId is set in authentication middleware

  if (!name) {
    return res.status(400).json({ error: 'Missing name' });
  }

  if (!type || !['folder', 'file', 'image'].includes(type)) {
    return res.status(400).json({ error: 'Missing or invalid type' });
  }

  if (type !== 'folder' && !data) {
    return res.status(400).json({ error: 'Missing data' });
  }

  try {
    const db = dbClient.client.db();
    const filesCollection = db.collection('files');

    // Check if parentId is set and valid
    if (parentId !== '0') {
      const parentFile = await filesCollection.findOne({ _id: parentId });

      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }

      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    let fileData = {};

    if (type === 'folder') {
      fileData = {
        name,
        type,
        parentId,
        isPublic,
        userId,
      };
    } else {
      // Save file locally
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      const filePath = `${folderPath}/${uuidv4()}`;

      const fileContent = Buffer.from(data, 'base64');

      fs.writeFileSync(filePath, fileContent);

      fileData = {
        name,
        type,
        parentId,
        isPublic,
        userId,
        localPath: filePath,
      };
    }

    // Insert file data into database
    const result = await filesCollection.insertOne(fileData);

    if (result.insertedCount === 1) {
      return res.status(201).json(fileData);
    } else {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

