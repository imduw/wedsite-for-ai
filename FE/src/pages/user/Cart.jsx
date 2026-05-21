import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect } from 'react';

const API_BASE = 'http://localhost:3000';

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [isUpdatingCart, setIsUpdatingCart] = useState(false);

  const showNotification = (message, type = 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 2000);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity <= 0) return;

    const previousItems = [...cartItems];
    setCartItems(cartItems.map(item =>
      item.cart_item_id === id ? { ...item, quantity: newQuantity } : item
    ));

    try {
      setIsUpdatingCart(true);
      await axios.put(`${API_BASE}/user/cart/items/${id}`,
        { quantity: newQuantity },
        { headers: getAuthHeaders() }
      );
    } catch (err) {
      setCartItems(previousItems);
      showNotification(err.response?.data?.message || 'Không thể cập nhật số lượng sản phẩm.');
    } finally {
      setIsUpdatingCart(false);
    }
  };

  const removeItem = async (id) => {
    const previousItems = [...cartItems];
    setCartItems(cartItems.filter(item => item.cart_item_id !== id));

    try {
      setIsUpdatingCart(true);
      await axios.delete(`${API_BASE}/user/cart/items/${id}`, {
        headers: getAuthHeaders(),
      });
    } catch (err) {
      setCartItems(previousItems);
      showNotification(err.response?.data?.message || 'Không thể xóa sản phẩm khỏi giỏ hàng.');
    } finally {
      setIsUpdatingCart(false);
    }
  };

  const placeOrder = async () => {
    if (isUpdatingCart) {
      showNotification('Vui lòng đợi cập nhật giỏ hàng xong rồi đặt hàng.');
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE}/user/orders/checkout`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      showNotification(`Đặt hàng thành công! Mã đơn hàng: ${res.data.order_id}`, 'success');
      setCartItems([]);
      setTimeout(() => navigate("/user/orders"), 2000);
    } catch (err) {
      console.error("Lỗi đặt hàng:", err);
      showNotification(err.response?.data?.message || "Đặt hàng thất bại. Vui lòng thử lại.");
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/user/cart`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCartItems((res.data.items || []).map(i => ({ ...i, price: Number(i.price) || 0 })));
      } catch (err) {
        console.error("Không tải được giỏ hàng:", err);
        setCartItems([]);
      }
    };
    fetchCartItems();
  }, []);
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Giỏ Hàng</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 text-5xl mb-4">🛒</div>
            <p className="text-xl text-gray-600 mb-6">Giỏ hàng của bạn trống</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Danh sách sản phẩm */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Hình ảnh</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Sản phẩm</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Giá</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Số lượng</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Tổng cộng</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {cartItems.map(item => (
                        <tr key={item.cart_item_id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-20 w-20 object-cover object-center rounded-lg"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-sm text-gray-600">{item.price.toLocaleString('vi-VN')} ₫</p>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center border border-gray-200 rounded-lg w-fit">
                              <button
                                onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                              >
                                −
                              </button>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.cart_item_id, parseInt(e.target.value) || 1)}
                                className="w-12 py-1 text-center border-l border-r border-gray-200 outline-none"
                              />
                              <button
                                onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-sm font-medium text-gray-900">
                              {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <button
                              onClick={() => removeItem(item.cart_item_id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1 rounded transition-colors text-sm font-medium"
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Tóm tắt đơn hàng */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>

                <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Số lượng sản phẩm:</span>
                    <span className="font-semibold text-gray-900">{totalItems} sản phẩm</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tổng tiền hàng:</span>
                    <span className="font-semibold text-gray-900">{totalPrice.toLocaleString('vi-VN')} ₫</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span className="font-semibold text-green-600">Miễn phí</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6 pt-4 border-t-2 border-gray-200">
                  <span className="text-lg font-bold text-gray-900">Tổng cộng:</span>
                  <span className="text-2xl font-bold text-blue-600">{totalPrice.toLocaleString('vi-VN')} ₫</span>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={placeOrder}
                    disabled={isUpdatingCart}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    Đặt hàng
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    Tiếp tục mua sắm
                  </button>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
                  <p className="font-semibold mb-2">💡 Mẹo:</p>
                  <p>Đơn hàng trên 500.000₫ được tặng thêm 5% giảm giá!</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {notification.show && (
        <div
          className={`fixed right-4 top-24 px-6 py-4 rounded-lg shadow-lg text-white font-semibold animate-fade-in ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          style={{ zIndex: 9999 }}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
}