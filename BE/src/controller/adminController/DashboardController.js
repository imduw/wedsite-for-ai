const db = require("../../config/db");

const queryOne = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const DashboardController = {
  getSummary: async (req, res) => {
    try {
      const [revenueRows, orderRows, customerRows, lowStockRows, recentOrderRows, topProductRows] = await Promise.all([
        queryOne(
          `
            SELECT COALESCE(SUM(total_price), 0) AS revenue_today
            FROM orders
            WHERE DATE(created_at) = CURDATE()
              AND status <> 'cancelled'
          `,
        ),
        queryOne(
          `
            SELECT COUNT(*) AS new_orders_today
            FROM orders
            WHERE DATE(created_at) = CURDATE()
          `,
        ),
        queryOne(
          `
            SELECT COUNT(*) AS customers
            FROM users
            WHERE role = 'user' OR role IS NULL
          `,
        ),
        queryOne(
          `
            SELECT COUNT(*) AS low_stock_products
            FROM products
            WHERE stock <= 10
          `,
        ),
        queryOne(
          `
            SELECT
              o.id,
              o.total_price,
              o.status,
              o.created_at,
              COALESCE(u.name, 'Khách hàng') AS customer
            FROM orders o
            LEFT JOIN users u ON u.id = o.user_id
            ORDER BY o.created_at DESC
            LIMIT 4
          `,
        ),
        queryOne(
          `
            SELECT
              p.id,
              p.name,
              p.stock,
              COALESCE(SUM(oi.quantity), 0) AS sold
            FROM products p
            LEFT JOIN order_items oi ON oi.product_id = p.id
            GROUP BY p.id, p.name, p.stock
            ORDER BY sold DESC, p.id DESC
            LIMIT 4
          `,
        ),
      ]);

      const revenueToday = Number(revenueRows?.[0]?.revenue_today || 0);
      const newOrdersToday = Number(orderRows?.[0]?.new_orders_today || 0);
      const customers = Number(customerRows?.[0]?.customers || 0);
      const lowStockProducts = Number(lowStockRows?.[0]?.low_stock_products || 0);

      return res.json({
        stats: [
          { label: "Doanh thu hôm nay", value: revenueToday, change: "+12.4%" },
          { label: "Đơn hàng mới", value: newOrdersToday, change: "+8.1%" },
          { label: "Khách hàng", value: customers, change: "+5.7%" },
          { label: "Sản phẩm sắp hết", value: lowStockProducts, change: "-2.3%" },
        ],
        recentOrders: recentOrderRows.map((order) => ({
          id: `#OD${order.id}`,
          customer: order.customer,
          total: Number(order.total_price || 0),
          status: order.status,
          created_at: order.created_at,
        })),
        topProducts: topProductRows.map((product) => ({
          name: product.name,
          sold: Number(product.sold || 0),
          stock: Number(product.stock || 0),
        })),
      });
    } catch (err) {
      return res.status(500).json(err);
    }
  },
};

module.exports = DashboardController;