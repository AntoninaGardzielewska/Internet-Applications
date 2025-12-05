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
  cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Initialize cart in session
app.use((req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  if (!req.session.message) {
    req.session.message = null;
  }
  res.locals.message = req.session.message;
  req.session.message = null;
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
    res.render('index', { 
      products: products, 
      cart: req.session.cart,
      message: req.session.message
    });
  });
});

// Add product to cart
app.post('/add-to-cart', (req, res) => {
  const productId = req.body.productId;
  
  // Check if product exists
  db.getProduct(productId, (err, product) => {
    if (err || !product) {
      req.session.message = 'Product not found';
      return res.redirect('/');
    }
    
    // Add to cart
    const cartItem = req.session.cart.find(item => item.id === productId);
    if (cartItem) {
      cartItem.quantity += 1;
    } else {
      req.session.cart.push({
        id: productId,
        name: product.name,
        quantity: 1
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
  res.render('checkout', { 
    cart: req.session.cart,
    message: req.session.message
  });
});

// Remove item from cart
app.post('/remove-from-cart', (req, res) => {
  const productId = req.body.productId;
  req.session.cart = req.session.cart.filter(item => item.id !== productId);
  req.session.message = 'Product removed from cart';
  
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
  
  // Check if all products are still available
  let productsToRemove = [];
  let allAvailable = true;
  let checkCount = 0;
  
  req.session.cart.forEach(cartItem => {
    db.getProduct(cartItem.id, (err, product) => {
      checkCount++;
      
      if (err || !product) {
        allAvailable = false;
      } else {
        productsToRemove.push(cartItem.id);
      }
      
      // After all checks are done
      if (checkCount === req.session.cart.length) {
        if (!allAvailable) {
          req.session.message = 'One or more products are no longer available. Please review your cart.';
          return req.session.save(() => {
            res.redirect('/checkout');
          });
        }
        
        // All products available - remove them from database
        let removed = 0;
        productsToRemove.forEach(productId => {
          db.removeProduct(productId, (err) => {
            removed++;
            
            if (removed === productsToRemove.length) {
              // All products removed successfully
              req.session.cart = [];
              req.session.message = 'Purchase finalized successfully!';
              req.session.save(() => {
                res.redirect('/');
              });
            }
          });
        });
      }
    });
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
