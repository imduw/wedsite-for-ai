const db = require("../../config/db");

const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const ReviewController = {
  getProductReviews: async (req, res) => {
    try {
      const productId = req.params.productId;
      const rows = await query(
        `
          SELECT
            r.id,
            r.user_id,
            r.product_id,
            r.order_id,
            r.rating,
            r.comment,
            r.created_at,
            u.name AS user_name,
            u.avatar AS user_avatar
          FROM reviews r
          JOIN users u ON u.id = r.user_id
          WHERE r.product_id = ?
          ORDER BY r.created_at DESC
        `,
        [productId],
      );

      const summaryRows = await query(
        `
          SELECT
            COUNT(*) AS total_reviews,
            COALESCE(AVG(rating), 0) AS average_rating
          FROM reviews
          WHERE product_id = ?
        `,
        [productId],
      );

      return res.json({
        reviews: rows,
        summary: {
          total_reviews: Number(summaryRows?.[0]?.total_reviews || 0),
          average_rating: Number(summaryRows?.[0]?.average_rating || 0),
        },
      });
    } catch (err) {
      return res.status(500).json(err);
    }
  },

  checkEligibility: async (req, res) => {
    try {
      const userId = req.user.id;
      const productId = req.params.productId;

      const eligibleRows = await query(
        `
          SELECT o.id AS order_id
          FROM orders o
          JOIN order_items oi ON oi.order_id = o.id
          WHERE o.user_id = ?
            AND oi.product_id = ?
            AND o.status = 'completed'
          ORDER BY o.created_at DESC
          LIMIT 1
        `,
        [userId, productId],
      );

      if (!eligibleRows.length) {
        return res.json({ can_review: false, reason: "Bạn chỉ có thể đánh giá sau khi đơn hàng đã hoàn tất." });
      }

      const orderId = eligibleRows[0].order_id;

      const reviewRows = await query(
        `
          SELECT id
          FROM reviews
          WHERE user_id = ? AND product_id = ?
          LIMIT 1
        `,
        [userId, productId],
      );

      if (reviewRows.length) {
        return res.json({
          can_review: false,
          reason: "Bạn đã đánh giá sản phẩm này rồi.",
          order_id: orderId,
        });
      }

      return res.json({ can_review: true, order_id: orderId });
    } catch (err) {
      return res.status(500).json(err);
    }
  },

  createReview: async (req, res) => {
    try {
      const userId = req.user.id;
      const { product_id, rating, comment } = req.body;

      if (!product_id || !rating) {
        return res.status(400).json({ message: "Thiếu product_id hoặc rating" });
      }

      const eligibleRows = await query(
        `
          SELECT o.id AS order_id
          FROM orders o
          JOIN order_items oi ON oi.order_id = o.id
          WHERE o.user_id = ?
            AND oi.product_id = ?
            AND o.status = 'completed'
          ORDER BY o.created_at DESC
          LIMIT 1
        `,
        [userId, product_id],
      );

      if (!eligibleRows.length) {
        return res.status(403).json({ message: "Bạn chỉ có thể đánh giá sau khi đơn hàng đã hoàn tất." });
      }

      const orderId = eligibleRows[0].order_id;

      const existedRows = await query(
        `
          SELECT id
          FROM reviews
          WHERE user_id = ? AND product_id = ?
          LIMIT 1
        `,
        [userId, product_id],
      );

      if (existedRows.length) {
        return res.status(409).json({ message: "Bạn đã đánh giá sản phẩm này rồi." });
      }

      const insertResult = await query(
        `
          INSERT INTO reviews (user_id, product_id, order_id, rating, comment)
          VALUES (?, ?, ?, ?, ?)
        `,
        [userId, product_id, orderId, rating, comment || null],
      );

      return res.status(201).json({
        message: "Đánh giá đã được gửi thành công",
        review_id: insertResult.insertId,
        order_id: orderId,
      });
    } catch (err) {
      return res.status(500).json(err);
    }
  },

  updateReview: async (req, res) => {
    try {
      const userId = req.user.id;
      const reviewId = req.params.reviewId;
      const { rating, comment } = req.body;

      if (!rating) {
        return res.status(400).json({ message: "Thiếu rating" });
      }

      const reviewRows = await query(
        `
          SELECT id, user_id
          FROM reviews
          WHERE id = ?
          LIMIT 1
        `,
        [reviewId],
      );

      if (!reviewRows.length) {
        return res.status(404).json({ message: "Đánh giá không tồn tại." });
      }

      if (reviewRows[0].user_id !== userId) {
        return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa đánh giá này." });
      }

      await query(
        `
          UPDATE reviews
          SET rating = ?, comment = ?, created_at = NOW()
          WHERE id = ?
        `,
        [rating, comment || null, reviewId],
      );

      return res.json({ message: "Đánh giá đã được cập nhật thành công" });
    } catch (err) {
      return res.status(500).json(err);
    }
  },
};

module.exports = ReviewController;