import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:3000";

const roleLabels = {
	admin: "Quản trị viên",
	user: "Khách hàng",
};

export default function ManageUser() {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [showDetail, setShowDetail] = useState(false);
	const [detailLoading, setDetailLoading] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const res = await axios.get(`${API_BASE}/admin/users`);
			setUsers(Array.isArray(res.data) ? res.data : []);
		} catch (err) {
			console.error(err);
			alert("Không tải được danh sách user");
			setUsers([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	const filteredUsers = useMemo(() => {
		const keyword = searchTerm.trim().toLowerCase();
		if (!keyword) return users;

		return users.filter((user) => {
			const id = String(user.id || "").toLowerCase();
			const name = String(user.name || "").toLowerCase();
			const email = String(user.email || "").toLowerCase();
			const role = String(user.role || "").toLowerCase();
			return id.includes(keyword) || name.includes(keyword) || email.includes(keyword) || role.includes(keyword);
		});
	}, [users, searchTerm]);

	const openDetail = async (userId) => {
		try {
			setShowDetail(true);
			setDetailLoading(true);
			setSelectedUser(null);

			const res = await axios.get(`${API_BASE}/admin/users/get/${userId}`);
			setSelectedUser(res.data);
		} catch (err) {
			console.error(err);
			alert("Không tải được chi tiết user");
			setShowDetail(false);
		} finally {
			setDetailLoading(false);
		}
	};

	const handleDelete = async (userId) => {
		if (!window.confirm("Bạn chắc chắn muốn xóa user này?")) return;

		try {
			await axios.delete(`${API_BASE}/admin/users/delete/${userId}`);
			setUsers((prev) => prev.filter((user) => user.id !== userId));
			if (selectedUser?.id === userId) {
				setShowDetail(false);
				setSelectedUser(null);
			}
		} catch (err) {
			console.error(err);
			alert("Xóa user thất bại");
		}
	};

	return (
		<div className="min-h-screen bg-slate-100 p-6">
			<div className="mx-auto max-w-7xl">
				<div className="mb-8 flex flex-col gap-4 rounded-2xl bg-slate-900 p-6 text-white shadow-lg md:flex-row md:items-end md:justify-between">
					<div>
						<p className="text-sm uppercase tracking-[0.25em] text-slate-400">Admin / Customers</p>
						<h1 className="mt-2 text-3xl font-bold">Quản lý user</h1>
						<p className="mt-1 text-slate-300">Theo dõi, xem chi tiết và xóa user từ dữ liệu DB.</p>
						<p className="mt-3 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200">
							Tổng số user: {users.length}
						</p>
					</div>
					<div className="rounded-2xl bg-white/10 px-5 py-4 text-right backdrop-blur">
						<p className="text-sm text-slate-300">Tài khoản đang hiển thị</p>
						<p className="text-3xl font-extrabold">{filteredUsers.length}</p>
					</div>
				</div>

				<div className="mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
					<input
						type="text"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="Tìm theo tên, email, vai trò hoặc mã user..."
						className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
					/>
				</div>

				<div className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200">
					<div className="overflow-x-auto">
						<table className="min-w-full">
							<thead className="bg-slate-50">
								<tr>
									<th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">ID</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Người dùng</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Email</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Vai trò</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Hành động</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-200">
								{loading ? (
									<tr>
										<td colSpan="5" className="px-6 py-10 text-center text-slate-500">
											Đang tải danh sách user...
										</td>
									</tr>
								) : filteredUsers.length === 0 ? (
									<tr>
										<td colSpan="5" className="px-6 py-10 text-center text-slate-500">
											Không tìm thấy user nào.
										</td>
									</tr>
								) : (
									filteredUsers.map((user) => (
										<tr key={user.id} className="hover:bg-slate-50 transition-colors">
											<td className="px-6 py-4 text-sm text-slate-600">#{user.id}</td>
											<td className="px-6 py-4">
												<div className="flex items-center gap-3">
													{user.avatar ? (
														<img
															src={user.avatar}
															alt={user.name}
															className="h-11 w-11 rounded-full object-cover ring-1 ring-slate-200"
														/>
													) : (
														<div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-700">
															{(user.name || "U").charAt(0).toUpperCase()}
														</div>
													)}
													<div>
														<p className="text-sm font-semibold text-slate-900">{user.name || "—"}</p>
														<p className="text-xs text-slate-500">{user.google_id ? "Google Account" : "Local Account"}</p>
													</div>
												</div>
											</td>
											<td className="px-6 py-4 text-sm text-slate-700">{user.email || "—"}</td>
											<td className="px-6 py-4">
												<span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.role === "admin" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>
													{roleLabels[user.role] || user.role || "Khách hàng"}
												</span>
											</td>
											<td className="px-6 py-4">
												<div className="flex gap-2">
													<button
														onClick={() => openDetail(user.id)}
														className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
													>
														Xem chi tiết
													</button>
													<button
														onClick={() => handleDelete(user.id)}
														className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700"
													>
														Xóa
													</button>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{showDetail && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
					<div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
						<div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
							<div>
								<p className="text-sm uppercase tracking-[0.2em] text-slate-400">Chi tiết user</p>
								<h2 className="text-2xl font-bold text-slate-900">
									{selectedUser ? selectedUser.name : "Đang tải..."}
								</h2>
							</div>
							<button
								onClick={() => setShowDetail(false)}
								className="rounded-full bg-slate-100 px-3 py-1 text-2xl leading-none text-slate-600 hover:bg-slate-200"
							>
								✕
							</button>
						</div>

						<div className="px-6 py-5">
							{detailLoading ? (
								<div className="py-16 text-center text-slate-500">Đang tải chi tiết user...</div>
							) : selectedUser ? (
								<div className="grid gap-5 md:grid-cols-[120px_1fr] md:items-start">
									{selectedUser.avatar ? (
										<img
											src={selectedUser.avatar}
											alt={selectedUser.name}
											className="h-28 w-28 rounded-2xl object-cover ring-1 ring-slate-200"
										/>
									) : (
										<div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-slate-200 text-4xl font-bold text-slate-700">
											{(selectedUser.name || "U").charAt(0).toUpperCase()}
										</div>
									)}

									<div className="space-y-3">
										<div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
											<p className="text-sm text-slate-500">Tên</p>
											<p className="text-lg font-semibold text-slate-900">{selectedUser.name || "—"}</p>
										</div>
										<div className="grid gap-3 md:grid-cols-2">
											<div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
												<p className="text-sm text-slate-500">Email</p>
												<p className="font-medium text-slate-900">{selectedUser.email || "—"}</p>
											</div>
											<div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
												<p className="text-sm text-slate-500">Vai trò</p>
												<p className="font-medium text-slate-900">{roleLabels[selectedUser.role] || selectedUser.role || "Khách hàng"}</p>
											</div>
										</div>
										<div className="grid gap-3 md:grid-cols-2">
											<div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
												<p className="text-sm text-slate-500">Google ID</p>
												<p className="font-medium text-slate-900">{selectedUser.google_id || "—"}</p>
											</div>
											<div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
												<p className="text-sm text-slate-500">Mã user</p>
												<p className="font-medium text-slate-900">#{selectedUser.id}</p>
											</div>
										</div>
									</div>
								</div>
							) : null}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
