const { get } = require("../../routes/auth");
const db = require("../../config/db");

const ProductController = {
  getAllProducts: (req, res) => {
    const q = "SELECT * FROM products";
    db.query(q, (err, data) => {
      return res.json(data);
    });
  },
  getProductbyId: (req, res) => {
    const productId = req.params.id;
    const q = "select * from products where id=?";
    db.query(q, [productId], (err, data) => {
      return res.json(data[0]);
    });
  },
  addproduct: (req, res) => {
    const { name, description, price, stock, category_id } = req.body;
    const image = req.file ? req.file.path : null;
    const q = `
    INSERT INTO products(name, description, price, stock, image, category_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
    db.query(
      q,
      [name, description, price, stock, image, category_id],
      (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json({
          message: "Tạo sản phẩm thành công",
          image,
        });
      },
    );
  },
updateProduct: (req, res) => {
  const productId = req.params.id;

  const { name, description, price, stock, category_id } = req.body;
  // lấy ảnh cũ
  const getQuery = "SELECT image FROM products WHERE id=?";
  db.query(getQuery, [productId], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm",
      });
    }
    const image = req.file
      ? req.file.path
      : req.body.image || result[0].image;
    const q = `
      UPDATE products
      SET name=?, description=?, price=?, stock=?, image=?, category_id=?
      WHERE id=?
    `;
    const values = [
      name,
      description,
      price,
      stock,
      image,
      category_id,
      productId,
    ];

    db.query(q, values, (updateErr, data) => {
      if (updateErr) {
        return res.status(500).json(updateErr);
      }

      return res.json({
        message: "Cập nhật thành công",
        image,
      });
    });
  });
},
  deleteProduct: (req, res) => {
    const productId = req.params.id;
    const q = "DELETE FROM products WHERE id = ?";
    db.query(q, [productId], (err, data) => {
      if (err) {
        return res.json(err);
      }
      return res.json("Product has been deleted");
    });
  },
  searchProduct: (req, res) => {
    const {
      name = "",
      categoryId,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      sort = "newest",
    } = req.query;

    let q = `
    SELECT 
      p.id, 
      p.name, 
      p.price, 
      p.image, 
      p.stock,
      c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
    const params = [];
    // search theo name
    if (name) {
      q += " AND p.name LIKE ?";
      params.push(`%${name}%`);
    }


    // pagination
    const offset = (page - 1) * limit;
    q += " LIMIT ? OFFSET ?";
    params.push(Number(limit), Number(offset));

    db.query(q, params, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.json(data);
    });
  },
};
module.exports = ProductController;
