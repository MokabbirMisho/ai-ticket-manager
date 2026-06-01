import { useEffect, useState } from "react";
import { api } from "../api/axios";

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

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await api.get("/users");
      setUsers(response.data.data.users);
    } catch {
      setError("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
      await fetchUsers();
    } catch {
      setError("Failed to create agent");
    } finally {
      setIsCreating(false);
    }
  };

  const startEdit = (user: User) => {
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditIsActive(user.isActive);
    setError("");
    setSuccess("");
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setEditName("");
    setEditEmail("");
    setEditIsActive(true);
  };

  const handleUpdateUser = async (userId: string) => {
    try {
      setError("");
      setSuccess("");

      await api.patch(`/users/${userId}`, {
        name: editName,
        email: editEmail,
        isActive: editIsActive,
      });

      setSuccess("User updated successfully");
      cancelEdit();
      await fetchUsers();
    } catch {
      setError("Failed to update user");
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      setError("");
      setSuccess("");

      await api.delete(`/users/${userId}`);

      setSuccess("User deactivated successfully");
      await fetchUsers();
    } catch {
      setError("Failed to deactivate user");
    }
  };

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <p className="mt-2 text-slate-500">
          Admin-only area to create and manage support agents.
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
            <h2 className="text-lg font-bold text-slate-900">All Users</h2>
          </div>

          {isLoading && (
            <div className="p-6 text-sm text-slate-500">Loading users...</div>
          )}

          {!isLoading && users.length === 0 && (
            <div className="p-6 text-sm text-slate-500">No users found.</div>
          )}

          {!isLoading && users.length > 0 && (
            <div className="divide-y divide-slate-100">
              {users.map((user) => {
                const isEditing = editingUserId === user.id;
                const isAdmin = user.role === "ADMIN";

                return (
                  <div key={user.id} className="p-5">
                    {!isEditing ? (
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900">
                              {user.name}
                            </h3>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                              {user.role}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                user.isActive
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {user.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-slate-500">
                            {user.email}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(user)}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </button>

                          {!isAdmin && user.isActive && (
                            <button
                              onClick={() => handleDeactivateUser(user.id)}
                              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-slate-700">
                            Name
                          </label>
                          <input
                            value={editName}
                            onChange={(event) =>
                              setEditName(event.target.value)
                            }
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
                            onChange={(event) =>
                              setEditEmail(event.target.value)
                            }
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                          />
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

                        <div className="flex gap-2 md:col-span-3">
                          <button
                            onClick={() => handleUpdateUser(user.id)}
                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                          >
                            Save
                          </button>

                          <button
                            onClick={cancelEdit}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
