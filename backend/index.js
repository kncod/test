const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
const port = 8000;

// Set up multer for file uploads with unique filenames and validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueFilename = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueFilename);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

// Middleware
app.use(
  cors({
    origin: "*", // Allow all origins; adjust as needed
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB connection

const mongoUrl = "mongodb+srv://nigus2012bh:1234@cluster0.ozm1v8e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose
  .connect(mongoUrl)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.log("Error connecting to MongoDB", error));

// Define the User schema
const userSchema = new mongoose.Schema({
  user_id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
    unique: true,
  },
  user_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role_id: { type: Number, required: true },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

// Define the Property model
const propertySchema = new mongoose.Schema({
  property_id: { type: String, default: () => uuidv4(), unique: true },
  property_name: { type: String, required: true },
  image: { type: String },
  description: { type: String },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  category: { type: String, required: true },
  status: { type: Boolean, required: true },
});

const Property = mongoose.model("Property", propertySchema);

// Endpoint to add a property
app.post("/addProperty", upload.single("image"), async (req, res) => {
  try {
    const { property_name, description, price, location, category, status } =
      req.body;
    const imagePath = req.file ? req.file.filename : null;
    const newProperty = new Property({
      property_id: uuidv4(),
      property_name,
      image: imagePath,
      description,
      price,
      location,
      category,
      status: status === "true", // Convert string 'true'/'false' to boolean
    });

    await newProperty.save();
    res
      .status(201)
      .json({ message: "Property saved successfully", property: newProperty });
  } catch (error) {
    console.error("Error registering property", error);
    res.status(500).json({ message: "Failed to add property", error });
  }
});

// Endpoint to fetch all properties
app.get("/properties", async (req, res) => {
  try {
    const properties = await Property.find();
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve properties" });
  }
});

// Sign-Up Endpoint
app.post("/signUp", async (req, res) => {
  try {
    const { user_name, email, password, role_id } = req.body;
    if (!role_id || !user_name) {
      return res
        .status(400)
        .json({ message: "Role ID and User Name are required" });
    }

    const existingUser = await User.findOne({
      $or: [{ user_name }, { email }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({ user_name, email, password, role_id });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user", error);
    res.status(500).json({ message: "Failed to register user", error });
  }
});

// Sign-In Endpoint
app.post("/signIn", async (req, res) => {
  try {
    const { user_name, email, password } = req.body;
    const user = await User.findOne({ $or: [{ user_name }, { email }] });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid username/email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid username/email or password" });
    }

    const token = jwt.sign(
      { user_id: user.user_id },
      "4dC1aYbZ9eKxR3uWvA8hP7tQwJ2nL5sFzM0oO1rT6pVbGxN", // Your JWT secret
      { expiresIn: "1h" }
    );
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error during sign-in", error);
    res.status(500).json({ message: "An unexpected error occurred", error });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
