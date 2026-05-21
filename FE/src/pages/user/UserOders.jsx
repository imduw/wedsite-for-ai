import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const statusLabels = {
    pending: "Chờ xác nhận",
    accepted: "Đã xác nhận",
    shipped: "Đã vận chuyển",
    completed: "Đã hoàn tất",
    cancelled: "Đã hủy",
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:3000/user/orders",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setOrders(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          Lịch sử đơn hàng
        </h1>

        {orders.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            Chưa có đơn hàng nào
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div
                key={order.order_id}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex justify-between mb-4">
                  <div>
                    <p className="font-bold">
                      Đơn hàng #{order.order_id}
                    </p>

                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString("vi-VN")}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-blue-600">
                      {Number(order.total_price).toLocaleString("vi-VN")} ₫
                    </p>

                    <p className="text-sm text-green-600">
                      {statusLabels[order.status] || order.status}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.items.map(item => (
                    <div
                      key={item.product_id}
                      className="border-t pt-4"
                    >
                      <Link
                        to={`/product/${item.product_id}`}
                        className="flex items-center gap-4 group cursor-pointer"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded group-hover:opacity-80 transition"
                        />

                        <div className="flex-1">
                          <p className="font-medium group-hover:text-blue-600 transition">
                            {item.name}
                          </p>

                          <p className="text-sm text-gray-500">
                            Số lượng: {item.quantity}
                          </p>
                        </div>

                        <p className="font-semibold">
                          {Number(item.price).toLocaleString("vi-VN")} ₫
                        </p>
                      </Link>

                      {order.status === "completed" && (
                        <div className="mt-3 ml-24">
                          <Link
                            to={`/product/${item.product_id}`}
                            className="inline-block px-3 py-1 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded transition"
                          >
                            Đánh giá sản phẩm
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}