const mysql = require('mysql');

// Create connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'Asdfghjk123*', // Change if you have a password
  database: 'online_store'
});

// Initialize database and create table if not exists
const initDatabase = () => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Database connection error:', err);
      if (err.code === 'PROTOCOL_CONNECTION_LOST') console.error('Database connection was closed.');
      if (err.code === 'ER_CON_COUNT_ERROR') console.error('Database has too many connections.');
      if (err.code === 'ER_AUTHENTICATION_PLUGIN_ERROR') console.error('Database authentication failed.');
      return;
    }

    if (connection) {
      // Create table if it doesn't exist
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS products (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          price DECIMAL(10, 2) DEFAULT 0,
          description TEXT,
          quantity INT DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      connection.query(createTableQuery, (err) => {
        if (err) console.error('Error creating table:', err);
        else console.log('Products table initialized');
      });

      // Insert sample products if table is empty
      const checkEmpty = 'SELECT COUNT(*) as count FROM products';
      connection.query(checkEmpty, (err, results) => {
        if (!err && results[0].count === 0) {
          const sampleProducts = [
            ['Laptop', 999.99, 'High performance laptop', 5],
            ['Mouse', 29.99, 'Wireless mouse', 15],
            ['Keyboard', 79.99, 'Mechanical keyboard', 8],
            ['Monitor', 299.99, '4K UHD Monitor', 3],
            ['USB-C Cable', 12.99, '2m USB-C cable', 20],
            ['Headphones', 149.99, 'Noise-cancelling headphones', 6],
            ['Webcam', 89.99, 'Full HD webcam', 10],
            ['Desk Lamp', 49.99, 'LED desk lamp', 12]
          ];

          const insertQuery = 'INSERT INTO products (name, price, description, quantity) VALUES ?';
          connection.query(insertQuery, [sampleProducts], (err) => {
            if (err) console.error('Error inserting sample products:', err);
            else console.log('Sample products inserted');
          });
        }
      });

      connection.release();
    }
  });
};

// Get all available products
const getAllProducts = (callback) => {
  pool.query('SELECT id, name, price, description, quantity FROM products WHERE quantity > 0 ORDER BY id', 
    (err, results) => {
      callback(err, results);
    }
  );
};

// Get a single product by ID
const getProduct = (id, callback) => {
  pool.query('SELECT id, name, price, description, quantity FROM products WHERE id = ? AND quantity > 0', 
    [id], 
    (err, results) => {
      if (err) {
        callback(err, null);
      } else if (results.length > 0) {
        callback(null, results[0]);
      } else {
        callback(null, null);
      }
    }
  );
};

// Remove a product (decrease quantity or delete if quantity becomes 0)
const removeProduct = (id, callback) => {
  pool.query('UPDATE products SET quantity = quantity - 1 WHERE id = ?', 
    [id], 
    (err, results) => {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    }
  );
};

// Add a sample product (for testing)
const addProduct = (name, price, description, quantity, callback) => {
  const query = 'INSERT INTO products (name, price, description, quantity) VALUES (?, ?, ?, ?)';
  pool.query(query, [name, price, description, quantity], (err, results) => {
    callback(err, results);
  });
};

// Reset all quantities to sample state (useful for testing)
const resetProducts = (callback) => {
  const query = 'UPDATE products SET quantity = CASE WHEN id = 1 THEN 5 WHEN id = 2 THEN 15 WHEN id = 3 THEN 8 WHEN id = 4 THEN 3 WHEN id = 5 THEN 20 WHEN id = 6 THEN 6 WHEN id = 7 THEN 10 WHEN id = 8 THEN 12 ELSE 1 END';
  pool.query(query, (err) => {
    callback(err);
  });
};

// Initialize database on module load
initDatabase();

module.exports = {
  getAllProducts,
  getProduct,
  removeProduct,
  addProduct,
  resetProducts
};
