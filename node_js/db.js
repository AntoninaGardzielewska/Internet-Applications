const mysql = require('mysql');

// Create connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'online_store'
});

// Initialize database and add data if not exists
const initDatabase = () => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Database connection error:', err);
      return;
    }

    if (connection) {
      // Create table if it doesn't exist
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS products (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          description TEXT,
          quantity INT NOT NULL DEFAULT 0
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `;

      connection.query(createTableQuery, (err) => {
        if (err) console.error('Error creating table:', err);
        else console.log('Products table ensured');
      });

      // Insert sample products if table is empty
      const checkEmpty = 'SELECT COUNT(*) as count FROM products';
      console.log(checkEmpty);
      connection.query(checkEmpty, (err, results) => {
        console.log(results[0].count);
        if (!err && results[0].count === 0) {
          const sampleProducts = [
            ['Laptop', 999.99, 'Laptop', 5],
            ['Mouse', 29.99, 'Wireless mouse', 15],
            ['Keyboard', 79.99, 'Mechanical keyboard', 8],
            ['Monitor', 299.99, '4K Monitor', 3],
            ['USB-C Cable', 12.99, '2m USB-C cable', 20],
            ['Headphones', 149.99, 'Noise-cancelling headphones', 6],
            ['Webcam', 89.99, 'Webcam', 10],
            ['Desk Lamp', 49.99, 'desk lamp', 1]
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
  pool.query('SELECT * FROM products WHERE quantity > 0 ORDER BY id',
    (err, results) => {
      callback(err, results);
    }
  );
};

// Get a single product by ID (return current quantity even if 0)
const getProduct = (id, callback) => {
  pool.query('SELECT * FROM products WHERE id = ?',
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

const purchaseProducts = (items, callback) => {
  pool.getConnection((err, connection) => {
    if (err) return callback(err);

    connection.beginTransaction(txErr => {
      if (txErr) {
        connection.release();
        return callback(txErr);
      }

      // Step 1: Check all products have enough quantity
      const ids = items.map(it => it.id);
      const checkQuery = `SELECT id, quantity FROM products WHERE id IN (${ids.map(() => '?').join(',')}) FOR UPDATE`;
      connection.query(checkQuery, ids, (checkErr, results) => {
        if (checkErr) {
          return connection.rollback(() => {
            connection.release();
            callback(checkErr);
          });
        }

        // Map results by id for easy lookup
        const stockMap = {};
        results.forEach(r => stockMap[r.id] = r.quantity);

        // Check if any item does not have enough stock
        for (const item of items) {
          if (!stockMap[item.id] || stockMap[item.id] < item.amount) {
            return connection.rollback(() => {
              connection.release();
              callback(null, { success: false, failedId: item.id });
            });
          }
        }

        // Step 2: All products have enough stock → decrease quantities
        const updateNext = (index) => {
          if (index >= items.length) {
            // commit transaction
            connection.commit(commitErr => {
              if (commitErr) {
                return connection.rollback(() => {
                  connection.release();
                  callback(commitErr);
                });
              }
              connection.release();
              callback(null, { success: true });
            });
            return;
          }

          const item = items[index];
          const updateQuery = 'UPDATE products SET quantity = quantity - ? WHERE id = ?';
          connection.query(updateQuery, [item.amount, item.id], (updErr, result) => {
            if (updErr) {
              return connection.rollback(() => {
                connection.release();
                callback(updErr);
              });
            }

            // Optional: delete product if quantity = 0
            const delQuery = 'DELETE FROM products WHERE id = ? AND quantity = 0';
            connection.query(delQuery, [item.id], (delErr) => {
              if (delErr) {
                return connection.rollback(() => {
                  connection.release();
                  callback(delErr);
                });
              }

              // proceed to next item
              updateNext(index + 1);
            });
          });
        };

        updateNext(0);
      });
    });
  });
};

// Initialize database
initDatabase();

module.exports = {
  getAllProducts,
  getProduct,
  purchaseProducts
};
