# Implementation Notes

## Architecture Overview

This online store application follows the MVC (Model-View-Controller) pattern:

- **Model**: `db.js` - Database operations and data management
- **View**: `views/*.ejs` - EJS templates for rendering HTML
- **Controller**: `main.js` - Express routes and business logic

## Key Design Decisions

### 1. Session-Based Cart Management
- Shopping cart stored in `req.session.cart` as an array
- Each session represents a unique user
- Cart persists across page refreshes (stored server-side)
- Clearing cookies = new user/empty cart

```javascript
// Cart structure in session
req.session.cart = [
  { id: 1, name: "Laptop", quantity: 1 },
  { id: 2, name: "Mouse", quantity: 2 }
]
```

### 2. POST → REDIRECT → GET Pattern
All form submissions follow this pattern to prevent duplicate submissions:

```javascript
// User submits form (POST)
app.post('/add-to-cart', (req, res) => {
  // Process request
  req.session.save(() => {
    // Redirect to GET (prevents double-submission on refresh)
    res.redirect('/');
  });
});

// Browser loads page (GET)
app.get('/', (req, res) => {
  // Render without side effects
  res.render('index', { products: products });
});
```

### 3. SQL Injection Prevention
All database queries use **parameterized queries** with `?` placeholders:

```javascript
// ✓ SAFE - Using data binding
pool.query('SELECT * FROM products WHERE id = ?', [productId], callback);

// Alternative safe method with array
pool.query('INSERT INTO products (name, price) VALUES (?, ?)', 
  [name, price], callback);
```

**Why this matters**: Without parameterized queries, user input could be used to inject malicious SQL:
```sql
-- UNSAFE query with concatenation
SELECT * FROM products WHERE id = 1 OR 1=1  -- Bypasses all restrictions!

-- SAFE with parameterization
SELECT * FROM products WHERE id = ?  -- ? is always treated as data, not code
```

### 4. Race Condition Handling
Multiple users buying the same product simultaneously:

```javascript
// Before finalizing, check if all products still exist
db.getProduct(cartItem.id, (err, product) => {
  if (!product) {
    // Product already bought, redirect with error
    req.session.message = 'One or more products are no longer available...';
    res.redirect('/checkout');
  }
});

// Only finalize if ALL products are still available
if (allAvailable) {
  // Remove products from database
  db.removeProduct(productId, callback);
}
```

### 5. Database Connection Pooling
Using connection pool for better performance:

```javascript
const pool = mysql.createPool({
  connectionLimit: 10,  // Max 10 connections
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'online_store'
});
```

Benefits:
- Reuses connections instead of creating new ones
- Reduces overhead
- Handles multiple concurrent requests efficiently

### 6. Session Configuration
```javascript
app.use(session({
  secret: 'your-secret-key',
  resave: false,              // Don't save unchanged sessions
  saveUninitialized: true,    // Save new but uninitialized sessions
  cookie: { 
    secure: false,            // Set true for HTTPS only
    maxAge: 1000 * 60 * 60 * 24  // 24 hours
  }
}));
```

## Route Flow Diagrams

### Adding Product to Cart
```
User clicks "Add to Cart"
    ↓
POST /add-to-cart { productId }
    ↓
Check if product exists in database
    ↓
Add to req.session.cart
    ↓
Save session
    ↓
REDIRECT → GET / (POST → REDIRECT → GET pattern)
    ↓
Display main page with message "Product added to cart"
```

### Finalizing Purchase
```
User clicks "Finalize Purchase"
    ↓
POST /finalize-purchase
    ↓
For each product in cart:
  ├─ Check if still available (SELECT query)
  └─ If not available: error, redirect to /checkout
    ↓
If all available:
  ├─ For each product: UPDATE quantity (decrement)
  ├─ Clear session.cart
  └─ Set success message
    ↓
REDIRECT → GET /
    ↓
Display main page with success message
    ↓
User sees products are gone (quantity reduced)
```

## Error Handling Scenarios

### Scenario 1: Product No Longer Available
```
User A and B both add "Laptop" to cart
User A finalizes: Laptop quantity: 5 → 4
User B tries to finalize:
  ├─ Check: SELECT * FROM products WHERE id = X
  ├─ Result: Product not found (quantity is 0)
  └─ Error: "One or more products are no longer available"
User B redirected to /checkout with error message
```

### Scenario 2: Add Non-existent Product
```
User submits request with invalid productId
POST /add-to-cart { productId: 99999 }
    ↓
db.getProduct(99999, callback)
    ↓
Product not found
    ↓
Message: "Product not found"
REDIRECT → GET /
```

### Scenario 3: Empty Cart Finalization
```
User goes to checkout without adding products
User clicks "Finalize Purchase"
    ↓
Check: if (req.session.cart.length === 0)
    ↓
Message: "Cart is empty"
REDIRECT → /checkout
```

## Security Considerations

### 1. No User Authentication
- Design assumes users identified only by session
- Each new session = new user
- No passwords or login required
- Suitable for tutorial/demo purposes

### 2. HTTPS Not Enforced
- Currently uses HTTP (change in production)
- Session cookies should have `secure: true` for HTTPS
- Set `sameSite: 'Strict'` to prevent CSRF

### 3. Production Checklist
- [ ] Change session secret to random string
- [ ] Enable HTTPS and set `secure: true`
- [ ] Use environment variables for database credentials
- [ ] Add rate limiting for requests
- [ ] Implement proper logging
- [ ] Add input validation/sanitization
- [ ] Use prepared statements (already done ✓)
- [ ] Add CSRF tokens to forms
- [ ] Implement user authentication if needed
- [ ] Add product image security

## Database Queries Reference

### Get all available products
```javascript
SELECT id, name, price, description, quantity 
FROM products 
WHERE quantity > 0 
ORDER BY id
```

### Get single product
```javascript
SELECT id, name, price, description, quantity 
FROM products 
WHERE id = ? AND quantity > 0
```

### Reduce product quantity (when purchased)
```javascript
UPDATE products 
SET quantity = quantity - 1 
WHERE id = ?
```

### Initialize table
```javascript
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) DEFAULT 0,
  description TEXT,
  quantity INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## Testing Strategies

### Unit Testing
- Test database functions independently
- Mock database calls
- Verify parameterized queries work correctly

### Integration Testing
- Test complete flows (add → checkout → purchase)
- Test with actual MySQL database
- Verify session persistence

### Concurrency Testing
- Open multiple browser windows
- Both add same product
- One finalizes, then other tries
- Verify proper error handling

### Browser Testing
- Test back/forward buttons
- Test page refresh on each step
- Test with cookies enabled/disabled
- Test with JavaScript disabled

### Edge Cases
- Empty cart operations
- Non-existent product ID
- Negative quantities
- SQL injection attempts
- Session timeout scenarios

## Performance Optimization

### Current Optimizations
- Connection pooling (max 10 connections)
- Efficient SELECT queries with WHERE clauses
- Session cookie optimization
- Minimal database round-trips

### Potential Improvements
- Add caching for product list (Redis)
- Implement pagination for large product lists
- Database query indexing
- Compress static assets
- Use Content Delivery Network (CDN)
- Implement lazy loading for images

## Deployment Considerations

### Local Development
```bash
npm start
# Server on http://localhost:3000
```

### Production Deployment
- Use production Node.js environment
- Configure MySQL with replicas
- Use reverse proxy (Nginx)
- Enable SSL/TLS (HTTPS)
- Set up load balancing
- Implement logging and monitoring
- Use environment variables for secrets
- Set up automated backups

### Docker Deployment
```dockerfile
FROM node:16
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]
```

## Code Quality

### Following Best Practices
- ✓ Parameterized queries (SQL injection prevention)
- ✓ POST → REDIRECT → GET pattern
- ✓ Proper HTTP methods
- ✓ Session management
- ✓ Error handling
- ✓ Connection pooling
- ✓ Modular code structure

### Code Style
- Consistent indentation (2 spaces)
- Meaningful variable names
- Comments on complex logic
- DRY (Don't Repeat Yourself)
- Separation of concerns (db.js vs main.js)

## Troubleshooting Guide

| Issue | Cause | Solution |
|-------|-------|----------|
| ECONNREFUSED | MySQL not running | Start MySQL service |
| Unknown database | Database not created | Create with `CREATE DATABASE online_store` |
| Cannot find module | Dependencies missing | Run `npm install` |
| Cart not persisting | Cookies disabled | Enable browser cookies |
| Product still visible after purchase | Database not updated | Check `db.js` removeProduct function |
| Purchase not finalizing | Race condition | Other user bought product first |

## References

- Express.js Documentation: https://expressjs.com/
- MySQL npm package: https://github.com/mysqljs/mysql
- Express-session: https://github.com/expressjs/session
- EJS Templating: https://ejs.co/
- SQL Injection Prevention: https://owasp.org/www-community/attacks/SQL_Injection
- POST/Redirect/GET Pattern: https://en.wikipedia.org/wiki/Post/Redirect/Get
