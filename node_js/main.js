const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'style')));

// Initialize cart in session
app.use((req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  if (!req.session.message) {
    req.session.message = null;
  }
  next();
});

// Routes

// Main page - display products
app.get('/', (req, res) => {
  db.getAllProducts((err, products) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.render('index', { 
        products: [], 
        cart: req.session.cart,
        message: 'Error loading products'
      });
    }
    const message = req.session.message || '';
    req.session.message = null;

    res.render('index', { 
      products: products, 
      cart: req.session.cart,
      message: message
    });
  });
});

// Add product to cart
app.post('/add-to-cart', (req, res) => {
  const productId = Number(req.body.productId);
  let quantity = Number(req.body.quantity) || 1;
  if (quantity < 1) quantity = 1;

  // Check if product exists and enough stock
  db.getProduct(productId, (err, product) => {
    if (err || !product) {
      req.session.message = 'Product not found';
      return res.redirect('/');
    }

    // current available stock
    const available = Number(product.quantity) || 0;

    // check existing amount in cart
    const existing = req.session.cart.reduce((sum, it) => (it.id === productId ? sum + it.quantity : sum), 0);
    if (existing + quantity > available) {
      req.session.message = `Cannot add ${quantity} items to cart. Only ${available - existing} left available.`;
      return req.session.save(() => res.redirect('/'));
    }

    // Add to cart (combine quantities)
    const cartItem = req.session.cart.find(item => item.id === productId);
    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      req.session.cart.push({
        id: productId,
        name: product.name,
        quantity: quantity
      });
    }

    req.session.message = 'Product added to cart';
    req.session.save(() => {
      res.redirect('/');
    });

  });
});

// View shopping cart
app.get('/checkout', (req, res) => {
  console.log(req.session.message);
  res.render('checkout', { 
    cart: req.session.cart,
    message: req.session.message
  });
  console.log("xxx")
  req.session.message = null;
});

// Remove item from cart
app.post('/remove-from-cart', (req, res) => {
  const productId = Number(req.body.productId);
  if (!productId) {
    req.session.message = "Couldn't delete product";
    return res.redirect('/checkout');
  }


  req.session.cart = req.session.cart.filter(item => item.id !== productId);
  req.session.message = 'Product removed from cart';
  req.session.modified = true; 
  req.session.save(() => {
    res.redirect('/checkout');
  });
});

// Cancel purchase
app.post('/cancel-purchase', (req, res) => {
  req.session.cart = [];
  req.session.message = 'Purchase cancelled';
  
  req.session.save(() => {
    res.redirect('/');
  });
});

// Finalize purchase
app.post('/finalize-purchase', (req, res) => {
  if (req.session.cart.length === 0) {
    req.session.message = 'Cart is empty';
    return req.session.save(() => {
      res.redirect('/checkout');
    });
  }
  
  // Prepare items with id and amount
  const items = req.session.cart.map(it => ({ id: it.id, amount: it.quantity }));

  // Attempt transactional purchase
  db.purchaseProducts(items, (err, result) => {
    console.log("RESULT:", result);
    console.log("MESSAGE:", req.session.message);

    if (err) {
      console.error('Purchase error:', err);
      req.session.message = 'An error occurred while finalizing purchase.';
      return req.session.save(() => res.redirect('/checkout'));
    }

    if (!result || !result.success) {
      const failedId = result && result.failedId;
      req.session.message = failedId ? `Product (id=${failedId}) does not have enough stock. Please review your cart.` : 'One or more products are no longer available. Please review your cart.';
      console.log(req.session.message);
      return req.session.save(() => res.redirect('/checkout'));
    }

    // Success
    req.session.cart = [];
    req.session.message = 'Purchase finalized successfully!';
    req.session.save(() => res.redirect('/'));
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Online Store running on http://localhost:${PORT}`);
  console.log('Make sure MySQL is running and the database is initialized.');
});
