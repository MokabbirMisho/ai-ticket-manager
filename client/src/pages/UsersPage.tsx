import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";

type UserRole = "ADMIN" | "AGENT";

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type Pagination = {
  page: number;
  limit: number;
  totalUsers: number;
  totalPages: number;
};

export function UsersPage() {
  const { user } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    totalUsers: 0,
    totalPages: 1,
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState<UserRole>("AGENT");
  const [editIsActive, setEditIsActive] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (user?.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  const fetchUsers = async (page = pagination.page) => {
    try {
      setIsLoading(true);
      setError("");

      const response = await api.get("/users", {
        params: {
          page,
          limit: pagination.limit,
          search: search || undefined,
          role: role || undefined,
          status: status || undefined,
        },
      });

      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
    } catch {
      setError("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [search, role, status]);

  const resetCreateForm = () => {
    setName("");
    setEmail("");
    setPassword("");
  };

  const handleCreateAgent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsCreating(true);
      setError("");
      setSuccess("");

      await api.post("/users", {
        name,
        email,
        password,
      });

      setSuccess("Agent created successfully");
      resetCreateForm();
      await fetchUsers(1);
    } catch {
      setError("Failed to create agent");
    } finally {
      setIsCreating(false);
    }
  };

  const openEditModal = (userToEdit: User) => {
    setSelectedUser(userToEdit);
    setEditName(userToEdit.name);
    setEditEmail(userToEdit.email);
    setEditPassword("");
    setEditRole(userToEdit.role);
    setEditIsActive(userToEdit.isActive);
    setError("");
    setSuccess("");
  };

  const closeEditModal = () => {
    setSelectedUser(null);
    setEditName("");
    setEditEmail("");
    setEditPassword("");
    setEditRole("AGENT");
    setEditIsActive(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      setIsUpdating(true);
      setError("");
      setSuccess("");

      const payload: {
        name: string;
        email: string;
        role: UserRole;
        isActive: boolean;
        password?: string;
      } = {
        name: editName,
        email: editEmail,
        role: editRole,
        isActive: editIsActive,
      };

      if (editPassword.trim()) {
        payload.password = editPassword;
      }

      await api.patch(`/users/${selectedUser.id}`, payload);

      setSuccess("User updated successfully");
      closeEditModal();
      await fetchUsers(pagination.page);
    } catch {
      setError("Failed to update user");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      setError("");
      setSuccess("");

      await api.delete(`/users/${userId}`);

      setSuccess("User deactivated successfully");
      await fetchUsers(pagination.page);
    } catch {
      setError("Failed to deactivate user");
    }
  };

  const goToPreviousPage = () => {
    if (pagination.page > 1) {
      fetchUsers(pagination.page - 1);
    }
  };

  const goToNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      fetchUsers(pagination.page + 1);
    }
  };

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <p className="mt-2 text-slate-500">
          Admin-only area to create and manage staff accounts.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-1">
          <h2 className="text-lg font-bold text-slate-900">Create Agent</h2>

          <form onSubmit={handleCreateAgent} className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Name
              </label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                placeholder="Support Agent"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                placeholder="agent@example.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                placeholder="agent123"
              />
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {isCreating ? "Creating..." : "Create Agent"}
            </button>
          </form>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm lg:col-span-2">
          <div className="border-b border-slate-100 px-6 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">All Users</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Showing {users.length} of {pagination.totalUsers} users
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                  placeholder="Search name or email..."
                />

                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                >
                  <option value="">All roles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="AGENT">Agent</option>
                </select>

                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                >
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="p-6 text-sm text-slate-500">Loading users...</div>
          )}

          {!isLoading && users.length === 0 && (
            <div className="p-6 text-sm text-slate-500">No users found.</div>
          )}

          {!isLoading && users.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-5 py-3 font-medium">Name</th>
                      <th className="px-5 py-3 font-medium">Email</th>
                      <th className="px-5 py-3 font-medium">Role</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Created</th>
                      <th className="px-5 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {users.map((listedUser) => {
                      const isAdmin = listedUser.role === "ADMIN";

                      return (
                        <tr key={listedUser.id} className="hover:bg-slate-50">
                          <td className="px-5 py-4 font-medium text-slate-900">
                            {listedUser.name}
                          </td>

                          <td className="px-5 py-4 text-slate-600">
                            {listedUser.email}
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                              {listedUser.role}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                listedUser.isActive
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {listedUser.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-slate-500">
                            {new Date(
                              listedUser.createdAt,
                            ).toLocaleDateString()}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditModal(listedUser)}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                              >
                                Edit
                              </button>

                              {!isAdmin && listedUser.isActive && (
                                <button
                                  onClick={() =>
                                    handleDeactivateUser(listedUser.id)
                                  }
                                  className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                                >
                                  Deactivate
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
                <p className="text-sm text-slate-500">
                  Page {pagination.page} of {pagination.totalPages || 1}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={goToPreviousPage}
                    disabled={pagination.page <= 1}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <button
                    onClick={goToNextPage}
                    disabled={pagination.page >= pagination.totalPages}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Edit User</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Update staff account details.
                </p>
              </div>

              <button
                onClick={closeEditModal}
                className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Name
                </label>
                <input
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(event) => setEditEmail(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  New Password
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(event) => setEditPassword(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                  placeholder="Leave empty to keep current password"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Role
                  </label>
                  <select
                    value={editRole}
                    onChange={(event) =>
                      setEditRole(event.target.value as UserRole)
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="AGENT">Agent</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Status
                  </label>
                  <select
                    value={editIsActive ? "active" : "inactive"}
                    onChange={(event) =>
                      setEditIsActive(event.target.value === "active")
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={closeEditModal}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpdateUser}
                  disabled={isUpdating}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
