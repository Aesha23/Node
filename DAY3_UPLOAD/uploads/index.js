const express = require("express");
const multer = require("multer");
const path = require("path");

const app = express();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

app.post("/upload", upload.array("images", 5), (req, res) => {
  if (!req.files) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  res.status(201).json({
    message: "Image uploaded successfully",
    file: {
      filename: req.files.filename,
      path: req.files.path,
    },
  });
});

app.use("/uploads", express.static("uploads"));

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
