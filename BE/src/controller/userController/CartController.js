const db = require("../../config/db");

const CartController = {
  addToCart: (req, res) => {
    const userId = req.user.id;
    const { product_id, quantity } = req.body;

    // Validate input
    if (!product_id || !quantity) {
      return res.status(400).json({ message: "product_id and quantity are required" });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: "quantity must be greater than 0" });
    }

    // Step 1: Check product exists and has enough stock
    const checkProductQuery = "SELECT id, stock FROM products WHERE id = ?";
    db.query(checkProductQuery, [product_id], (err, products) => {
      if (err) return res.status(500).json(err);
      
      if (!products || products.length === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (products[0].stock < quantity) {
        return res.status(400).json({
          message: `Not enough stock. Available: ${products[0].stock}`,
        });
      }

      // Step 2: Check if user has a cart, if not create one
      const getCartQuery = "SELECT id FROM carts WHERE user_id = ?";
      db.query(getCartQuery, [userId], (err, carts) => {
        if (err) return res.status(500).json(err);

        const handleAddToCart = (cartId) => {
          // Step 3: Check if product already in cart
          const checkCartItemQuery =
            "SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?";
          db.query(
            checkCartItemQuery,
            [cartId, product_id],
            (err, cartItems) => {
              if (err) return res.status(500).json(err);

              if (cartItems.length > 0) {
                // Product already in cart, update quantity
                const updateQuery =
                  "UPDATE cart_items SET quantity = quantity + ? WHERE cart_id = ? AND product_id = ?";
                db.query(
                  updateQuery,
                  [quantity, cartId, product_id],
                  (err) => {
                    if (err) return res.status(500).json(err);
                    return res.status(200).json({
                      message: "Product quantity updated in cart",
                    });
                  }
                );
              } else {
                // Add new item to cart
                const insertQuery =
                  "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)";
                db.query(insertQuery, [cartId, product_id, quantity], (err) => {
                  if (err) return res.status(500).json(err);
                  return res.status(201).json({
                    message: "Product added to cart",
                  });
                });
              }
            }
          );
        };

        if (carts.length > 0) {
          // Cart exists, add/update item
          handleAddToCart(carts[0].id);
        } else {
          // Create new cart first
          const createCartQuery = "INSERT INTO carts (user_id) VALUES (?)";
          db.query(createCartQuery, [userId], (err, result) => {
            if (err) return res.status(500).json(err);
            handleAddToCart(result.insertId);
          });
        }
      });
    });
  },
  getCart: (req, res) => {
    const userId = req.user.id;
    const q = `SELECT 
      ci.id as cart_item_id,
      p.id as product_id,
      p.name,
      p.price,
      p.image,
      ci.quantity
    FROM cart_items ci
    JOIN carts c ON ci.cart_id = c.id
    JOIN products p ON ci.product_id = p.id
    WHERE c.user_id = ?`;
    db.query(q, [userId], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.json({ items: data });
    }
    );
  },
  updateCartItem: (req, res) => {
    const userId = req.user.id;
    const cartItemId = Number(req.params.cartItemId);
    const quantity = Number(req.body?.quantity);

    if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
      return res.status(400).json({ message: "Invalid cart item id" });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ message: "quantity must be greater than 0" });
    }

    const checkItemQuery = `
      SELECT ci.id, ci.product_id, p.stock
      FROM cart_items ci
      JOIN carts c ON c.id = ci.cart_id
      JOIN products p ON p.id = ci.product_id
      WHERE ci.id = ? AND c.user_id = ?
    `;

    db.query(checkItemQuery, [cartItemId, userId], (err, rows) => {
      if (err) return res.status(500).json(err);

      if (!rows || rows.length === 0) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      if (quantity > Number(rows[0].stock)) {
        return res.status(400).json({
          message: `Not enough stock. Available: ${rows[0].stock}`,
        });
      }

      const updateQuery = `
        UPDATE cart_items ci
        JOIN carts c ON c.id = ci.cart_id
        SET ci.quantity = ?
        WHERE ci.id = ? AND c.user_id = ?
      `;

      db.query(updateQuery, [quantity, cartItemId, userId], (updateErr) => {
        if (updateErr) return res.status(500).json(updateErr);

        return res.status(200).json({
          message: "Cart item quantity updated",
          cart_item_id: cartItemId,
          quantity,
        });
      });
    });
  },
  removeCartItem: (req, res) => {
    const userId = req.user.id;
    const cartItemId = Number(req.params.cartItemId);

    if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
      return res.status(400).json({ message: "Invalid cart item id" });
    }

    const deleteQuery = `
      DELETE ci
      FROM cart_items ci
      JOIN carts c ON c.id = ci.cart_id
      WHERE ci.id = ? AND c.user_id = ?
    `;

    db.query(deleteQuery, [cartItemId, userId], (err, result) => {
      if (err) return res.status(500).json(err);

      if (!result || result.affectedRows === 0) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      return res.status(200).json({
        message: "Cart item removed",
        cart_item_id: cartItemId,
      });
    });
  }
};

module.exports = CartController;