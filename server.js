require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001', 'YOUR_VERCEL_FRONTEND_URL_HERE'];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  effort_level: { type: Number, required: true, min: 1, max: 10 },
  steps: { type: String, required: true },
  benefits: { type: String, required: true },
  impact_score: { type: Number },
});

productSchema.pre('save', function(next) {
  // Custom uniqueness: Calculate impact score as effort_level * (benefits.length / 10)
  this.impact_score = this.effort_level * (this.benefits.length / 10);
  next();
});

const Product = mongoose.model('Product', productSchema);

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware to verify Google ID Token
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.error('Authentication error: No token provided');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    req.user = payload; // Attach user payload to request
    console.log('Google ID Token verified successfully', payload.email);
    next();
  } catch (err) {
    console.error('Authentication error: Invalid Google ID Token', err);
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error('Server error fetching products:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('Server error fetching product by ID:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/products', authenticate, async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    console.log('Product added successfully:', newProduct);
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(400).json({ error: 'Invalid data' });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));


