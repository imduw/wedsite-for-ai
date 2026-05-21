const db= require("../../config/db")

const CategoryController={
    getAllCategories:(req,res)=>{
        const q="SELECT * FROM categories"
        db.query(q,(err,data)=>{
            return res.json(data)
        })
    },
    addCategory:(req,res)=>{
        const {name,description}=req.body
        const q="insert into categories(name,description) values(?,?)"
        const values=[
            name,
            description
        ]
        db.query(q,values,(err,data)=>{
            return res.json(data)
        })
    },
    deleteCategory:(req,res)=>{
        const categoryId = req.params.id;
        const q = "DELETE FROM categories WHERE id = ?";
        db.query(q, [categoryId], (err, data) => {
          if (err) {
            return res.json(err);
          }
          return res.json("Category has been deleted");
        });
    },
    updateCategory: (req, res) => {
        const categoryId = req.params.id;
        const { name, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Name is required" });
        }

        const q = "UPDATE categories SET name = ?, description = ? WHERE id = ?";
        db.query(q, [name.trim(), description || null, categoryId], (err, result) => {
            if (err) return res.status(500).json(err);
            if (!result || result.affectedRows === 0) {
                return res.status(404).json({ message: "Category not found" });
            }
            return res.json({ message: "Category updated", id: categoryId });
        });
    },
}
module.exports=CategoryController