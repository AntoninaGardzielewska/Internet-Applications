# Online Store - Quick Start Guide

## Prerequisites
- MySQL Server installed and running
- Node.js installed
- All npm dependencies installed (`npm install`)

## Database Setup

### Option 1: Automatic Setup (Recommended)
The application automatically creates the database and tables on first run.

### Option 2: Manual Setup
If you want to set up manually:

1. **Start MySQL**:
   ```bash
   # Windows - ensure MySQL service is running
   # Or start from MySQL installation directory
   ```

2. **Create database** (in MySQL console or workbench):
   ```sql
   CREATE DATABASE IF NOT EXISTS online_store;
   USE online_store;
   ```

3. **Run the application** - it will create the table and insert sample data:
   ```bash
   npm start
   ```

## Configuration

Edit `db.js` if needed to change database connection settings:

```javascript
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',        // Change if MySQL is on different server
  user: 'root',            // Your MySQL username
  password: '',            // Your MySQL password
  database: 'online_store' // Database name
});
```

## Running the Application

```bash
npm start
```

Application runs on: **http://localhost:3000**

## Resetting Sample Data

If you want to reset products to default quantities:

1. Connect to MySQL
2. Run:
   ```sql
   DELETE FROM products;
   INSERT INTO products (name, price, description, quantity) VALUES 
   ('Laptop', 999.99, 'High performance laptop', 5),
   ('Mouse', 29.99, 'Wireless mouse', 15),
   ('Keyboard', 79.99, 'Mechanical keyboard', 8),
   ('Monitor', 299.99, '4K UHD Monitor', 3),
   ('USB-C Cable', 12.99, '2m USB-C cable', 20),
   ('Headphones', 149.99, 'Noise-cancelling headphones', 6),
   ('Webcam', 89.99, 'Full HD webcam', 10),
   ('Desk Lamp', 49.99, 'LED desk lamp', 12);
   ```

Or restart the application (if db.js has the reset logic).

## Troubleshooting

**Q: I get "Cannot find module 'mysql'"**
A: Run `npm install` to install all dependencies

**Q: "Error: connect ECONNREFUSED"**
A: MySQL is not running. Start MySQL service and ensure port 3306 is open

**Q: "Unknown database 'online_store'"**
A: The database wasn't created. Create it manually with the SQL command above

**Q: Cart not saving when I refresh**
A: This is expected - check browser cookies are enabled

**Q: Multiple users buying same product causes issues**
A: The app checks availability before finalizing - you'll see an error message

## Testing Checklist

- [ ] Main page displays all products
- [ ] Can add products to cart
- [ ] Cart count updates in header
- [ ] Can proceed to checkout
- [ ] Can remove items from cart
- [ ] Can cancel purchase
- [ ] Can finalize purchase
- [ ] Products disappear after purchase
- [ ] Multiple browser windows work independently

## Features Summary

✅ Shopping cart with add/remove items
✅ Checkout with purchase confirmation
✅ SQL injection protection (parameterized queries)
✅ Session-based user management
✅ Concurrent purchase handling
✅ Professional UI with responsive design
✅ Proper HTTP methods (POST → REDIRECT → GET)
✅ Sample products included

## File Descriptions

- **main.js**: Express server and route handlers
- **db.js**: MySQL connection pool and database operations
- **views/index.ejs**: Main product listing page
- **views/checkout.ejs**: Shopping cart and checkout page
- **views/error.ejs**: Error page template
- **public/**: Static files directory (CSS, images)

## Next Steps

1. Start MySQL
2. Run `npm start`
3. Open http://localhost:3000
4. Test the application
5. Try the race condition scenario with 2 browser windows

Enjoy your online store!
