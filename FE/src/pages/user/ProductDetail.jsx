import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:3000";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ total_reviews: 0, average_rating: 0 });
  const [eligible, setEligible] = useState(false);
  const [eligibilityMessage, setEligibilityMessage] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: "" });
  const [hoveredEditRating, setHoveredEditRating] = useState(0);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`${API_BASE}/user/products/get/${id}`);
        setProduct(res.data);
      } catch {
        setError("Không tải được chi tiết sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewLoading(true);
        const res = await axios.get(`${API_BASE}/user/reviews/product/${id}`);
        setReviews(Array.isArray(res.data?.reviews) ? res.data.reviews : []);
        setSummary(res.data?.summary || { total_reviews: 0, average_rating: 0 });

        const token = localStorage.getItem("token");
        if (token) {
          try {
            const eligibleRes = await axios.get(`${API_BASE}/user/reviews/eligible/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setEligible(Boolean(eligibleRes.data?.can_review));
            setEligibilityMessage(eligibleRes.data?.reason || "");
          } catch (err) {
            setEligible(false);
            setEligibilityMessage(err?.response?.data?.message || "");
          }
        }
      } catch (err) {
        console.error(err);
        setReviews([]);
        setSummary({ total_reviews: 0, average_rating: 0 });
      } finally {
        setReviewLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-slate-500">Đang tải chi tiết sản phẩm...</div>;
  }

  if (error) {
    return <div className="py-20 text-center text-red-600">{error}</div>;
  }

  if (!product) {
    return <div className="py-20 text-center text-slate-500">Không tìm thấy sản phẩm</div>;
  }
    const handleAddToCart = async (productId) => {
    try {
      const token = localStorage.getItem("token")
      await axios.post(
        `${API_BASE}/user/cart/add`,
        { product_id: productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert("Đã thêm vào giỏ hàng")
    } catch (err) {
      alert(err?.response?.data?.message || "Thêm vào giỏ thất bại")
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    try {
      setSubmittingReview(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE}/user/reviews`,
        {
          product_id: Number(product.id),
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const res = await axios.get(`${API_BASE}/user/reviews/product/${id}`);
      setReviews(Array.isArray(res.data?.reviews) ? res.data.reviews : []);
      setSummary(res.data?.summary || { total_reviews: 0, average_rating: 0 });
      setEligible(false);
      setEligibilityMessage("Cảm ơn bạn đã đánh giá sản phẩm này.");
      setReviewForm({ rating: 5, comment: "" });
      alert("Đã gửi đánh giá thành công");
    } catch (err) {
      alert(err?.response?.data?.message || "Gửi đánh giá thất bại");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleUpdateReview = async (e, reviewId) => {
    e.preventDefault();

    try {
      setSubmittingEdit(true);
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE}/user/reviews/${reviewId}`,
        {
          rating: Number(editForm.rating),
          comment: editForm.comment.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const res = await axios.get(`${API_BASE}/user/reviews/product/${id}`);
      setReviews(Array.isArray(res.data?.reviews) ? res.data.reviews : []);
      setSummary(res.data?.summary || { total_reviews: 0, average_rating: 0 });
      setEditingReviewId(null);
      setEditForm({ rating: 5, comment: "" });
      alert("Đã cập nhật đánh giá thành công");
    } catch (err) {
      alert(err?.response?.data?.message || "Cập nhật đánh giá thất bại");
    } finally {
      setSubmittingEdit(false);
    }
  };

  const startEdit = (review) => {
    setEditingReviewId(review.id);
    setEditForm({ rating: review.rating, comment: review.comment || "" });
  };

  const renderStars = (rating) => {
    const value = Math.round(Number(rating) || 0);
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={index < value ? "text-amber-400" : "text-slate-300"}>
        ★
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 rounded-2xl bg-white p-6 shadow lg:grid-cols-2">
        <div>
          <img
            src={product.image || "https://via.placeholder.com/800x600?text=No+Image"}
            alt={product.name}
            className="h-105 w-full rounded-2xl object-cover"
          />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>
            <p className="mt-4 text-slate-600">{product.description || "Chưa có mô tả sản phẩm."}</p>

            <div className="mt-6 flex items-center gap-4">
              <span className="text-3xl font-extrabold text-amber-600">
                {Number(product.price || 0).toLocaleString("vi-VN")} VND
              </span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                Còn {product.stock ?? 0} sản phẩm
              </span>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={() => handleAddToCart(product.id)}
              className="rounded-lg bg-amber-400 px-5 py-3 font-semibold text-slate-900 hover:bg-amber-300"
            >
              Thêm vào giỏ
            </button>
            <Link
              to="/"
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Quay lại
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-6xl rounded-2xl bg-white p-6 shadow">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Đánh giá sản phẩm</h2>
            <p className="mt-1 text-sm text-slate-500">
              {summary.total_reviews} đánh giá - điểm trung bình {summary.average_rating.toFixed(1)}/5
            </p>
          </div>
          <div className="text-2xl font-bold text-amber-500">
            {renderStars(summary.average_rating)}
          </div>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {reviewLoading ? (
              <div className="py-10 text-center text-slate-500">Đang tải đánh giá...</div>
            ) : reviews.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-6 text-center text-slate-500">
                Chưa có đánh giá nào cho sản phẩm này.
              </div>
            ) : (
              reviews.map((review) => {
                const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
                const isOwnReview = currentUser.id === review.user_id;
                const isEditing = editingReviewId === review.id;

                return (
                  <div key={review.id} className="rounded-2xl border border-slate-200 p-5">
                    {isEditing ? (
                      <form onSubmit={(e) => handleUpdateReview(e, review.id)} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-slate-900">Chỉnh sửa đánh giá</h4>
                          <button
                            type="button"
                            onClick={() => setEditingReviewId(null)}
                            className="text-sm text-slate-500 hover:text-slate-700"
                          >
                            ✕
                          </button>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Số sao</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setEditForm((prev) => ({ ...prev, rating: star }))}
                                onMouseEnter={() => setHoveredEditRating(star)}
                                onMouseLeave={() => setHoveredEditRating(0)}
                                className="transition"
                              >
                                <span
                                  className={`text-4xl transition ${
                                    star <= (hoveredEditRating || editForm.rating)
                                      ? "text-amber-400"
                                      : "text-slate-300"
                                  }`}
                                >
                                  ★
                                </span>
                              </button>
                            ))}
                          </div>
                          <p className="mt-2 text-sm text-slate-500">
                            {hoveredEditRating || editForm.rating} sao
                          </p>
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-slate-700">Bình luận</label>
                          <textarea
                            rows={4}
                            value={editForm.comment}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, comment: e.target.value }))}
                            placeholder="Chia sẻ cảm nhận của bạn..."
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={submittingEdit}
                            className="flex-1 rounded-xl bg-amber-400 px-5 py-2 font-semibold text-slate-900 hover:bg-amber-300 disabled:opacity-60"
                          >
                            {submittingEdit ? "Đang cập nhật..." : "Cập nhật"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingReviewId(null)}
                            className="flex-1 rounded-xl border border-slate-300 bg-white px-5 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Hủy
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {review.user_avatar ? (
                              <img src={review.user_avatar} alt={review.user_name} className="h-11 w-11 rounded-full object-cover" />
                            ) : (
                              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-700">
                                {(review.user_name || "U").charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-slate-900">{review.user_name || "Khách hàng"}</p>
                              <p className="text-xs text-slate-500">
                                {review.created_at ? new Date(review.created_at).toLocaleString("vi-VN") : ""}
                              </p>
                            </div>
                          </div>
                          <div className="text-lg">{renderStars(review.rating)}</div>
                        </div>
                        {review.comment ? (
                          <p className="mt-4 text-sm leading-6 text-slate-600">{review.comment}</p>
                        ) : (
                          <p className="mt-4 text-sm italic text-slate-400">Không có bình luận.</p>
                        )}

                        {isOwnReview && (
                          <div className="mt-4 flex gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(review)}
                              className="inline-block rounded-lg bg-blue-500 px-3 py-1 text-sm font-semibold text-white hover:bg-blue-600 transition"
                            >
                              Chỉnh sửa
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="h-fit rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Viết đánh giá</h3>
            <p className="mt-1 text-sm text-slate-500">
              Chỉ khách hàng đã nhận hàng thành công mới có thể đánh giá.
            </p>

            {localStorage.getItem("token") ? (
              eligible ? (
                <form onSubmit={handleSubmitReview} className="mt-5 space-y-4">
                  <div>
                    <label className="mb-3 block text-sm font-medium text-slate-700">Số sao</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm((prev) => ({ ...prev, rating: star }))}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="transition"
                        >
                          <span
                            className={`text-5xl transition ${
                              star <= (hoveredRating || reviewForm.rating)
                                ? "text-amber-400"
                                : "text-slate-300"
                            }`}
                          >
                            ★
                          </span>
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {hoveredRating || reviewForm.rating} sao
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Bình luận</label>
                    <textarea
                      rows={5}
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                      placeholder="Chia sẻ cảm nhận của bạn..."
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full rounded-xl bg-amber-400 px-5 py-3 font-semibold text-slate-900 hover:bg-amber-300 disabled:opacity-60"
                  >
                    {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                  </button>
                </form>
              ) : (
                <div className="mt-5 rounded-xl bg-white p-4 text-sm text-slate-600 ring-1 ring-slate-200">
                  {eligibilityMessage || "Bạn chưa đủ điều kiện đánh giá sản phẩm này."}
                </div>
              )
            ) : (
              <div className="mt-5 rounded-xl bg-white p-4 text-sm text-slate-600 ring-1 ring-slate-200">
                Vui lòng đăng nhập và mua sản phẩm thành công để gửi đánh giá.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}