# 🛍️ Online Store - Start Here!

## Welcome! 👋

You now have a complete, fully-functional Node.js online store application. This document will guide you through everything.

## ⚡ Quick Start (2 minutes)

### 1. Prerequisites
- ✅ MySQL Server running locally
- ✅ Node.js installed
- ✅ Dependencies already installed (npm install was run)

### 2. Start the Application
```bash
cd "c:\Users\Admin\Desktop\studia\sem5\Internet_applications\node_js"
npm start
```

### 3. Open in Browser
```
http://localhost:3000
```

**That's it!** 🎉 Your store is ready to use.

## 📚 Documentation Guide

### For Getting Started
- **START**: `QUICK_REFERENCE.md` - 1-page cheat sheet
- **SETUP**: `SETUP.md` - Installation and configuration
- **CHECKLIST**: `PRE_LAUNCH_CHECKLIST.md` - Testing guide

### For Learning
- **OVERVIEW**: `PROJECT_SUMMARY.md` - What was built
- **README**: `README.md` - Complete documentation
- **TECHNICAL**: `IMPLEMENTATION.md` - Architecture details

## 🎯 What You Have

### Core Files
```
main.js          - Express server with all routes (300 lines)
db.js            - MySQL database management (150 lines)
package.json     - npm configuration
views/            - HTML templates
  ├── index.ejs          - Product listing page
  ├── checkout.ejs       - Shopping cart page
  └── error.ejs          - Error handling page
```

### Documentation
```
README.md                   - Complete guide (450+ lines)
SETUP.md                    - Quick setup (100 lines)
IMPLEMENTATION.md           - Technical details (400+ lines)
PROJECT_SUMMARY.md          - Project overview (300 lines)
PRE_LAUNCH_CHECKLIST.md     - Testing checklist (200 lines)
QUICK_REFERENCE.md          - One-page reference (300 lines)
```

## ✨ Features

✅ **Product Listing** - Browse items with details
✅ **Shopping Cart** - Add/remove items, manage quantities
✅ **Checkout System** - Purchase flow with confirmations
✅ **Database Storage** - MySQL with 8 sample products
✅ **User Sessions** - Each user gets their own cart
✅ **Multi-user Support** - Concurrent purchases handled safely
✅ **Race Condition Prevention** - Two users buying same item
✅ **Professional UI** - Responsive, modern design
✅ **Security** - SQL injection prevention, proper HTTP usage
✅ **Error Handling** - Clear messages for all scenarios

## 🚀 First Steps

### Step 1: Start the Application
```bash
npm start
```

Expected output:
```
Online Store running on http://localhost:3000
Make sure MySQL is running and the database is initialized.
```

### Step 2: Test Basic Flow
1. Open http://localhost:3000
2. See products list (Laptop, Mouse, Keyboard, etc.)
3. Click "Add to Cart" on a product
4. See cart count increase (top right)
5. Click "🛒 Checkout"
6. Review your items
7. Click "✓ Finalize Purchase"
8. Success! Product is gone from main page

### Step 3: Test Race Condition
1. Open two browser windows to http://localhost:3000
2. In Window 1: Add "Laptop" to cart → Checkout → Finalize
3. In Window 2: Add "Laptop" to cart → Checkout → Try Finalize
4. You should see: "One or more products are no longer available"

## 🔍 Exploring the Code

### main.js - The Server
```javascript
// 7 main routes:
GET  /                    - Display products
POST /add-to-cart        - Add product
GET  /checkout           - View cart
POST /remove-from-cart   - Remove item
POST /cancel-purchase    - Clear cart
POST /finalize-purchase  - Buy items
```

### db.js - The Database
```javascript
// 5 main functions:
getAllProducts()         - Get all available items
getProduct(id)          - Get single product
removeProduct(id)       - Reduce quantity (purchase)
addProduct(...)         - Add new product
resetProducts()         - Reset to sample data
```

### Views - The Pages
```
index.ejs       - Main page (product grid)
checkout.ejs    - Cart page (manage items)
error.ejs       - Error page (handle issues)
```

## 🧪 Testing Scenarios

### Test 1: Basic Purchase
```
✓ Add product to cart
✓ Go to checkout
✓ Finalize purchase
✓ Product disappears from main page
✓ See success message
```

### Test 2: Remove Item
```
✓ Add multiple products
✓ Go to checkout
✓ Click "Remove" on one item
✓ Item disappears from cart
✓ Go back to main page
✓ All products still available
```

### Test 3: Cancel Purchase
```
✓ Add products to cart
✓ Go to checkout
✓ Click "Cancel Purchase"
✓ Cart is empty
✓ Redirected to main page
✓ Products still available for others
```

### Test 4: Race Condition
```
✓ Open 2 browser windows
✓ Both add same "Laptop"
✓ Window 1 finalizes first
✓ Window 2 tries to finalize
✓ Error message: "Product no longer available"
✓ Window 2 redirected back to cart
```

### Test 5: Session Persistence
```
✓ Add product to cart
✓ Press F5 to refresh
✓ Cart still has the product
✓ Close and reopen browser
✓ Cart is empty (new session)
```

## 🛠️ Configuration

### Change Port
Edit `main.js`, find:
```javascript
const PORT = 3000;
```

### Change Database Connection
Edit `db.js`, find:
```javascript
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'online_store'
});
```

### Reset Sample Data
Option 1 - Delete database:
```sql
DROP DATABASE online_store;
-- Restart app, it recreates everything
```

Option 2 - SQL commands:
```sql
USE online_store;
DELETE FROM products;
INSERT INTO products (name, price, description, quantity) VALUES
('Laptop', 999.99, 'High performance laptop', 5),
('Mouse', 29.99, 'Wireless mouse', 15),
-- ... etc
```

## 🔐 Security Features

✅ **SQL Injection Protection**
```javascript
// SAFE - Parameterized query
pool.query('SELECT * FROM products WHERE id = ?', [id], callback);

// UNSAFE - Never do this!
pool.query(`SELECT * FROM products WHERE id = ${id}`, callback);
```

✅ **Session Security**
- 24-hour timeout
- Server-side storage
- Secure cookies

✅ **HTTP Protocol**
- Correct GET/POST usage
- POST → REDIRECT → GET pattern
- No duplicate submissions on refresh

✅ **Database Consistency**
- Check product availability before purchase
- Handle concurrent purchases safely

## 📊 Database

**Auto-created on first run:**
```sql
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  price DECIMAL(10, 2),
  description TEXT,
  quantity INT,
  created_at TIMESTAMP
);
```

**8 Sample Products:**
1. Laptop - $999.99 (qty: 5)
2. Mouse - $29.99 (qty: 15)
3. Keyboard - $79.99 (qty: 8)
4. Monitor - $299.99 (qty: 3)
5. USB-C Cable - $12.99 (qty: 20)
6. Headphones - $149.99 (qty: 6)
7. Webcam - $89.99 (qty: 10)
8. Desk Lamp - $49.99 (qty: 12)

## 🆘 Troubleshooting

### Problem: "Cannot connect to database"
**Solution**: Start MySQL
```bash
# Windows: Ensure MySQL service is running
# Or: mysql.server start
```

### Problem: "Port 3000 already in use"
**Solution**: Kill existing process or change port
```bash
# Find process on port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# Or change PORT in main.js
const PORT = 3001;
```

### Problem: "Products don't disappear after purchase"
**Solution**: Check MySQL connection
```bash
# Verify database exists
mysql -u root
SHOW DATABASES;
USE online_store;
SELECT * FROM products;
```

### Problem: "Cart empties when I refresh"
**Solution**: This is expected! Cart data is per-session.
- Close browser = new session
- Enable cookies if issue persists

For full troubleshooting, see `SETUP.md`

## 📈 Next Steps

### Immediate
1. ✅ Start application
2. ✅ Test basic flow
3. ✅ Test race condition scenario
4. ✅ Verify all buttons work

### Learning
1. Read `README.md` for complete guide
2. Read `IMPLEMENTATION.md` for technical details
3. Explore code in `main.js` and `db.js`
4. Understand SQL queries in `db.js`

### Enhancement (Optional)
- Add user authentication (login/register)
- Add product images
- Add product search/filtering
- Add order history
- Add payment integration

## 🎓 What You Learned

This project demonstrates:
- ✅ Express.js web framework
- ✅ MySQL database integration
- ✅ Session management
- ✅ EJS templating
- ✅ SQL injection prevention
- ✅ Race condition handling
- ✅ HTTP protocol best practices
- ✅ Responsive web design
- ✅ Error handling
- ✅ Multi-user application design

## 📞 Quick Links

- **Express.js**: https://expressjs.com/
- **MySQL**: https://www.mysql.com/
- **EJS**: https://ejs.co/
- **Express Session**: https://github.com/expressjs/session
- **MDN Docs**: https://developer.mozilla.org/

## 📋 File Overview

| File | Lines | Purpose |
|------|-------|---------|
| `main.js` | 300 | Express server and routes |
| `db.js` | 150 | MySQL database operations |
| `package.json` | 20 | npm configuration |
| `views/index.ejs` | 200 | Product listing page |
| `views/checkout.ejs` | 250 | Shopping cart page |
| `views/error.ejs` | 80 | Error page |
| **Documentation** | **1500+** | Comprehensive guides |

**Total**: ~2500 lines of code and documentation

## ✅ Checklist

- [ ] I started MySQL
- [ ] I ran `npm start`
- [ ] I opened http://localhost:3000
- [ ] I added products to cart
- [ ] I completed a purchase
- [ ] I tested race condition (2 windows)
- [ ] I read `QUICK_REFERENCE.md`
- [ ] I understand the code flow

## 🎉 You're All Set!

Your online store is ready to use. Start with:
```bash
npm start
```

Then visit: `http://localhost:3000`

Enjoy! 🛍️

---

**Quick Command Reference:**
```bash
npm start                    # Start the server
npm install                  # Install dependencies (already done)
Ctrl+C                       # Stop the server
```

**Important Files:**
- `main.js` - Server code
- `db.js` - Database code
- `views/` - HTML templates

**Need Help?**
- See `SETUP.md` for setup issues
- See `QUICK_REFERENCE.md` for common tasks
- See `README.md` for complete documentation
- See `IMPLEMENTATION.md` for technical details

**Have fun building! 🚀**
