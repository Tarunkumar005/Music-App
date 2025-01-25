const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const { MongoClient, GridFSBucket } = require('mongodb');

// MongoDB connection details
const uri = "mongodb://localhost:27017/";  // MongoDB connection string
const dbName = "mydatabase";  // Replace with your database name
let bucket, db;

// Set up multer for file uploads (using memoryStorage)
const storage = multer.memoryStorage();  // Store file in memory
const upload = multer({ storage: storage });

// Express setup
const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
MongoClient.connect(uri)
  .then(client => {
    console.log("Connected to MongoDB");
    db = client.db(dbName);
    bucket = new GridFSBucket(db, { bucketName: 'uploads' }); // Create a GridFSBucket instance
  })
  .catch(error => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);  // Exit the application if connection fails
  });

// Route to get the list of uploaded files
app.get('/', (req, res) => {
  db.collection('uploads.files')  // Access the files collection in GridFS
    .find({})
    .toArray()
    .then(files => {
      res.json({ success: true, files });
    })
    .catch(error => {
      res.status(500).json({ success: false, message: "Error fetching files", error });
    });
});

// Route to handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  // Validate if the file is an audio file
  const allowedAudioTypes = [
    'audio/mpeg', // MP3
    'audio/mp4',  // M4A
    'audio/ogg',  // OGG
    'audio/wav',  // WAV
    'audio/x-wav',
    'audio/webm',
  ];

  if (!allowedAudioTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: "Only audio files are allowed",
    });
  }

  // Create a GridFS write stream to store the file in MongoDB
  const uploadStream = bucket.openUploadStream(req.file.originalname, {
    contentType: req.file.mimetype,
  });

  // Write the file to GridFS
  uploadStream.write(req.file.buffer);
  uploadStream.end();

  uploadStream.on('finish', () => {
    const fileId = uploadStream.id; // Get the generated file ID
    db.collection('uploads.files').findOne({ _id: fileId }) // Fetch file info from the database
      .then(fileDoc => {
        if (!fileDoc) {
          return res.status(500).json({ success: false, message: "File saved but details not found" });
        }
        console.log("File uploaded successfully:", fileDoc);  // Log the uploaded file data
        res.json({
          success: true,
          file: {
            filename: fileDoc.filename,
            id: fileDoc._id,
            size: fileDoc.length,
            uploadDate: fileDoc.uploadDate,
          },
        });
      })
      .catch(error => {
        console.error("Error fetching uploaded file info:", error);
        res.status(500).json({
          success: false,
          message: "Error fetching file details",
          error: error.message,
        });
      });
  });

  uploadStream.on('error', (error) => {
    console.error('Error during file upload:', error);  // Log the error
    res.status(500).json({
      success: false,
      message: "Error saving to database",
      error: error.message,
    });
  });
});

// Route to serve files from GridFS
app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;

  // Find the file in GridFS
  db.collection('uploads.files').findOne({ filename: filename })
    .then((fileDoc) => {
      if (!fileDoc) {
        return res.status(404).send("File not found");
      }

      // Create a read stream for the file from GridFS
      const downloadStream = bucket.openDownloadStreamByName(filename);

      // Set the correct content type based on the file type (audio/video)
      res.setHeader('Content-Type', fileDoc.contentType);

      // Check if content type is audio or video, and set appropriate headers
      if (fileDoc.contentType.includes("audio")) {
        res.setHeader('Content-Type', fileDoc.contentType || 'audio/mpeg');
      } else if (fileDoc.contentType.includes("video")) {
        res.setHeader('Content-Type', fileDoc.contentType || 'video/mp4');
      }

      // Pipe the download stream to the response
      downloadStream.pipe(res);
    })
    .catch((err) => {
      console.error("Error fetching file:", err);
      res.status(500).send("Error fetching file: " + err);
    });
});

app.delete('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;

  // Find and delete the file from GridFS
  db.collection('uploads.files').findOne({ filename: filename })
    .then((fileDoc) => {
      if (!fileDoc) {
        return res.status(404).json({ success: false, message: "File not found" });
      }

      const fileId = fileDoc._id;

    // Delete the file from GridFS (both files and chunks collections)
    db.collection('uploads.files').deleteOne({ _id: fileId })
        .then(() => db.collection('uploads.chunks').deleteMany({ files_id: fileId }))
        .then(() => {
          res.json({ success: true, message: `File '${filename}' deleted successfully.` });
        })
        .catch((err) => {
          console.error("Error deleting file:", err);
          res.status(500).json({ success: false, message: "Error deleting file", error: err.message });
        });
    })
    .catch((err) => {
      console.error("Error finding file:", err);
      res.status(500).json({ success: false, message: "Error finding file", error: err.message });
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
