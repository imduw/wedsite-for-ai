const db = require("../../config/db");

const OrderController = {

  createOrder: (req, res) => {
    const userId = req.user.id;
    db.beginTransaction((err) => {
      if (err) return res.status(500).json(err);
      const getCartItemsQuery = `
        SELECT 
          ci.product_id,
          ci.quantity,
          p.price,
          p.stock
        FROM carts c
        JOIN cart_items ci ON ci.cart_id = c.id
        JOIN products p ON p.id = ci.product_id
        WHERE c.user_id = ?
      `;

      db.query(getCartItemsQuery, [userId], (err, cartItems) => {
        if (err) {
          return db.rollback(() => res.status(500).json(err));
        }

        if (!cartItems || cartItems.length === 0) {
          return db.rollback(() => {
            return res.status(400).json({ message: "Cart is empty" });
          });
        }

        for (const item of cartItems) {
          if (item.stock < item.quantity) {
            return db.rollback(() => {
              return res.status(400).json({
                message: `Not enough stock for product_id ${item.product_id}`,
              });
            });
          }
        }

        const totalPrice = cartItems.reduce(
          (sum, item) => sum + Number(item.price) * Number(item.quantity),
          0,
        );
        const createOrderQuery = `
          INSERT INTO orders (user_id, total_price, status)
          VALUES (?, ?, 'pending')
        `;
        db.query(createOrderQuery, [userId, totalPrice], (err, orderResult) => {
          if (err) {
            return db.rollback(() => res.status(500).json(err));
          }
          const orderId = orderResult.insertId;
          const orderItemsValues = cartItems.map((item) => [
            orderId,
            item.product_id,
            item.price,
            item.quantity,
          ]);

          const insertOrderItemsQuery = `
            INSERT INTO order_items (order_id, product_id, price, quantity)
            VALUES ?
          `;
          db.query(insertOrderItemsQuery, [orderItemsValues], (err) => {
            if (err) {
              return db.rollback(() => res.status(500).json(err));
            }
            const updateStockPromises = cartItems.map((item) => {
              return new Promise((resolve, reject) => {
                const updateStockQuery = `
                  UPDATE products
                  SET stock = stock - ?
                  WHERE id = ?
                `;
                db.query(
                  updateStockQuery,
                  [item.quantity, item.product_id],
                  (err) => {
                    if (err) return reject(err);
                    resolve();
                  },
                );
              });
            });
            Promise.all(updateStockPromises)
              .then(() => {
                const deleteCartItemsQuery = `
                  DELETE ci
                  FROM cart_items ci
                  JOIN carts c ON c.id = ci.cart_id
                  WHERE c.user_id = ?
                `;
                db.query(deleteCartItemsQuery, [userId], (err) => {
                  if (err) {
                    return db.rollback(() => res.status(500).json(err));
                  }
                  db.commit((err) => {
                    if (err) {
                      return db.rollback(() => res.status(500).json(err));
                    }

                    return res.status(201).json({
                      message: "Order created successfully",
                      order_id: orderId,
                      total_price: totalPrice,
                    });
                  });
                });
              })
              .catch((err) => {
                return db.rollback(() => res.status(500).json(err));
              });
          });
        });
      });
    });
  },
 getUserOrders: (req, res) => {
  const userId = req.user.id;

  const q = `
    SELECT 
      o.id AS order_id,
      o.total_price,
      o.status,
      o.created_at,
      oi.product_id,
      oi.quantity,
      oi.price,
      p.name,
      p.image
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON p.id = oi.product_id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
  `;

  db.query(q, [userId], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    // gom item theo order
    const ordersMap = {};

    data.forEach(item => {
      if (!ordersMap[item.order_id]) {
        ordersMap[item.order_id] = {
          order_id: item.order_id,
          total_price: item.total_price,
          status: item.status,
          created_at: item.created_at,
          items: [],
        };
      }
      ordersMap[item.order_id].items.push({
        product_id: item.product_id,
        name: item.name,
        image: item.image,
        quantity: item.quantity,
        price: item.price,
      });
    });

    return res.json(Object.values(ordersMap));
  });
},
};
  


module.exports = OrderController;
