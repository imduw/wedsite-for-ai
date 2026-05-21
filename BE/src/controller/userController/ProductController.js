const db = require("../../config/db");
const ProductController = {
getAllProducts:(req,res)=>{
  const q=`select id, name, description, price, image, stock, category_id from products`
  db.query(q,(err,data)=>{
    return res.json(data)
  })
},
  getProductById: (req, res) => {
    const productId = req.params.id;
    const q = `select id, name, description, price, image, stock from products where id=?`;
    db.query(q, [productId], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.json(data[0]);
    });
  },
  searchProduct: (req, res) => {
    const { name = "", category_id = "", page = 1, limit = 10 } = req.query;

    const q = `
    SELECT 
      p.id, 
      p.name, 
      p.price, 
      p.image, 
      p.stock,
      c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.name LIKE ?
      AND (? = '' OR p.category_id = ?)
    ORDER BY p.id DESC
    LIMIT ? OFFSET ?
  `;

    const offset = (Number(page) - 1) * Number(limit);
    db.query(
      q,
      [`%${name}%`, String(category_id), String(category_id), Number(limit), offset],
      (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
      }
    );
  },
  getCategories: (req, res) => {
    const q = "SELECT id, name FROM categories";
    db.query(q, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.json(data);
    });
  },
};
module.exports = ProductController;
