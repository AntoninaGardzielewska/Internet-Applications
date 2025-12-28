# Online Store Application

A simple Node.js-based online store with shopping cart functionality, MySQL database integration, and session-based user management.

## Features

- ✅ **Product Display**: Browse available products with details (name, price, description, quantity)
- ✅ **Shopping Cart**: Add/remove products, manage quantities through sessions
- ✅ **Checkout System**: Review cart items before purchase
- ✅ **Secure Purchase**: Database consistency checking before finalizing purchases
- ✅ **SQL Injection Prevention**: Uses parameterized queries with data binding
- ✅ **Session Management**: Each user gets their own session and shopping cart
- ✅ **POST → REDIRECT → GET Pattern**: Proper HTTP protocol usage
- ✅ **Multi-user Support**: Handles concurrent purchases and race conditions

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: MySQL
- **Session Management**: express-session
- **Templating**: EJS
- **Body Parsing**: body-parser

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server (running on localhost)
- npm (Node Package Manager)

## Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd Internet_applications/node_js
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Setup MySQL Database**:
   - Start MySQL server:
     ```bash
     # On Windows
     mysql.server start
     
     # Or ensure MySQL service is running
     ```
   - Create the database (the app will do this automatically on first run):
     ```bash
     mysql -u root
     ```
     Then in MySQL:
     ```sql
     CREATE DATABASE IF NOT EXISTS online_store;
     ```

4. **Configure Database Connection** (optional):
   - Edit `db.js` if you need to change:
     - `host`: Database server address (default: 'localhost')
     - `user`: MySQL username (default: 'root')
     - `password`: MySQL password (default: empty)
     - `database`: Database name (default: 'online_store')

## Running the Application

```bash
npm start
```

The application will start on `http://localhost:3000`

### On first run:
- The application automatically creates the `products` table
- Sample products are inserted into the database
- You can use `reset` functionality to restore sample data

## Usage

### Main Page
- View all available products
- See shopping cart count in the header
- Click "Add to Cart" to add products to your cart
- Click "Checkout" to proceed to the shopping cart

### Shopping Cart Page
- View all items in your cart
- See the quantity of each item
- Remove individual items from cart
- Options:
  - **Continue Shopping**: Return to main page without changes
  - **Cancel Purchase**: Clear entire cart and return to main page
  - **Finalize Purchase**: Process the purchase (removes products from database)

## Testing Scenarios

### Test 1: Basic Flow
1. Open `http://localhost:3000`
2. Click "Add to Cart" on a few products
3. Click "Checkout"
4. Click "Finalize Purchase"
5. Verify products are gone from main page

### Test 2: Race Condition (Multi-user)
1. Open two browser windows/tabs
2. In Window 1: Add product "Laptop" to cart
3. In Window 2: Add same "Laptop" to cart
4. In Window 1: Finalize purchase
5. In Window 2: Try to finalize purchase
   - Should see error message: "One or more products are no longer available..."

### Test 3: Navigation
- Use browser back/forward buttons after adding to cart
- Use browser back button after checkout
- Verify cart persists with correct data

### Test 4: Session Persistence
1. Add products to cart
2. Refresh the page (Ctrl+R)
3. Cart should persist with same items

### Test 5: Empty Cart
1. Go to checkout without adding products
2. Try to finalize empty cart
3. Should see appropriate message

## Security Features

### SQL Injection Prevention
All database queries use **parameterized queries** (prepared statements) with data binding:

```javascript
// ✓ SAFE - Using parameterized queries
pool.query('SELECT * FROM products WHERE id = ?', [userId], callback);

// ✗ UNSAFE - String concatenation (DO NOT USE)
pool.query(`SELECT * FROM products WHERE id = ${userId}`, callback);
```

### Session Security
- Secure session handling with express-session
- Session timeout after 24 hours of inactivity
- Separate cart per user via session

### CSRF Protection
- POST requests properly redirect to GET (POST → REDIRECT → GET pattern)
- Form submissions with proper HTTP methods

## Database Schema

```sql
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) DEFAULT 0,
  description TEXT,
  quantity INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Sample Products
The app includes 8 sample products:
1. Laptop - $999.99 (qty: 5)
2. Mouse - $29.99 (qty: 15)
3. Keyboard - $79.99 (qty: 8)
4. Monitor - $299.99 (qty: 3)
5. USB-C Cable - $12.99 (qty: 20)
6. Headphones - $149.99 (qty: 6)
7. Webcam - $89.99 (qty: 10)
8. Desk Lamp - $49.99 (qty: 12)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Main page - display all products |
| POST | `/add-to-cart` | Add product to shopping cart |
| GET | `/checkout` | View shopping cart |
| POST | `/remove-from-cart` | Remove item from cart |
| POST | `/cancel-purchase` | Clear cart and return to main page |
| POST | `/finalize-purchase` | Process purchase and remove products |

## Troubleshooting

### "Cannot find module 'express'"
```bash
npm install
```

### "Connection refused" or "ECONNREFUSED"
- Make sure MySQL is running
- Check host, user, and password in `db.js`
- Verify database `online_store` exists

### "Table doesn't exist"
- Delete the database and restart the app: `DROP DATABASE online_store;`
- The app will recreate it automatically

### Session not persisting
- Clear browser cookies and cache
- Check that cookies are enabled
- Verify session secret is configured

## Advanced Features (Optional Enhancements)

Potential improvements you could add:
- User authentication (login/registration)
- Product images
- Product reviews and ratings
- Order history
- Payment gateway integration
- Admin panel for managing products
- Inventory management
- Email notifications

## File Structure

```
node_js/
├── main.js                 # Main application file
├── db.js                   # Database connection and queries
├── package.json            # Project dependencies
├── views/
│   ├── index.ejs          # Main product listing page
│   ├── checkout.ejs       # Shopping cart page
│   └── error.ejs          # Error page
└── README.md              # This file
```

## HTTP Protocol Best Practices Used

1. **POST → REDIRECT → GET**: All form submissions redirect to GET to prevent duplicate submissions
2. **Proper Status Codes**: 200 OK, 302 Redirect, 500 Server Error
3. **Stateless Communication**: Session data stored server-side
4. **Proper Form Methods**: GET for retrieval, POST for modifications
5. **HTTPS Ready**: Can be configured with SSL/TLS for production

## Performance Considerations

- **Connection Pooling**: MySQL uses connection pool for better performance
- **Session Timeout**: 24-hour inactivity timeout
- **Database Indexing**: Primary key on products.id for fast lookups
- **Efficient Queries**: Minimal database calls per operation

## License

This is an assignment project for the Internet Applications course.

## Support

For issues or questions:
1. Check that MySQL is running
2. Verify database configuration in `db.js`
3. Check browser console for errors
4. Review server logs for database errors
