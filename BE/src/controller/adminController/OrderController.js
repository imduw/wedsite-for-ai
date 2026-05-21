const db = require("../../config/db");

const allowedStatuses = ["pending", "accepted", "shipped", "completed", "cancelled"];

const OrderController = {
  getAllOrders: (req, res) => {
    const q = `
      SELECT
        o.id,
        o.user_id,
        o.status,
        o.total_price,
        o.created_at,
        u.name AS customer_name,
        u.email AS customer_email,
        COUNT(oi.id) AS item_count
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      GROUP BY o.id, o.user_id, o.status, o.total_price, o.created_at, u.name, u.email
      ORDER BY o.created_at ASC
    `;
    db.query(q, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.json(data);
    });
  },
  getOrderDetailById: (req, res) => {
    const orderId = req.params.id;
    const q = `
  SELECT
    o.id AS order_id,
    o.status,
    o.total_price,
    o.created_at,
    u.id AS user_id,
    u.name AS customer_name,
    u.email AS customer_email,
    oi.product_id,
    p.name AS product_name,
    p.image AS product_image,
    oi.quantity,
    oi.price,
    (oi.quantity * oi.price) AS subtotal
  FROM orders o
  JOIN users u ON u.id = o.user_id
  LEFT JOIN order_items oi ON oi.order_id = o.id
  LEFT JOIN products p ON p.id = oi.product_id
  WHERE o.id = ?
  ORDER BY oi.id ASC
`;

    db.query(q, [orderId], (err, rows) => {
      if (err) return res.status(500).json(err);
      if (!rows || rows.length === 0) {
        return res.status(404).json({ message: "Order not found" });
      }
      const first = rows[0];
      const order = {
        id: first.order_id,
        status: first.status,
        total_price: first.total_price,
        created_at: first.created_at,
        customer: {
          id: first.user_id,
          name: first.customer_name,
          email: first.customer_email,
        },
        items: rows
          .filter((r) => r.product_id !== null)
          .map((r) => ({
            product_id: r.product_id,
            product_name: r.product_name,
            quantity: r.quantity,
            price: r.price,
            subtotal: r.subtotal,
            image: r.product_image,
          })),
      };

      return res.status(200).json(order);
    });
  },
  updateOrderStatus: (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
        allowedStatuses,
      });
    }

    const q = "UPDATE orders SET status = ? WHERE id = ?";
    db.query(q, [status, orderId], (err, result) => {
      if (err) return res.status(500).json(err);
      if (!result.affectedRows) {
        return res.status(404).json({ message: "Order not found" });
      }

      return res.json({
        message: "Order status updated successfully",
        order_id: Number(orderId),
        status,
      });
    });
  },
  deleteOrder: (req, res) => {
    const orderId = req.params.id;
    const q = "DELETE FROM orders WHERE id = ?";
    db.query(q, [orderId], (err, data) => {
      if (err) {
        return res.json(err);
      }
      return res.json("Order has been deleted");
    });
  },
};
module.exports = OrderController;