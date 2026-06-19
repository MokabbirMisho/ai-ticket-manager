import { type ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../api/axios";
import { EmptyState } from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";

type UserRole = "ADMIN" | "AGENT";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  department: string | null;
  jobTitle: string | null;
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

type StaffFormState = {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  department: string;
  jobTitle: string;
  isActive: boolean;
};

const emptyStaffForm: StaffFormState = {
  name: "",
  email: "",
  password: "",
  phone: "",
  role: "AGENT",
  department: "",
  jobTitle: "",
  isActive: true,
};

const isValidEmail = (value: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const getStaffValidationError = (
  form: StaffFormState,
  options: { requirePassword: boolean },
) => {
  if (!form.name.trim()) return "Full name is required";
  if (!form.email.trim()) return "Email is required";
  if (!isValidEmail(form.email.trim())) return "A valid email is required";
  if (options.requirePassword && !form.password.trim()) {
    return "Temporary password is required";
  }
  if (!form.phone.trim()) return "Phone is required";
  if (!form.role) return "Role is required";
  if (!form.department.trim()) return "Department is required";
  if (!form.jobTitle.trim()) return "Job title is required";
  if (typeof form.isActive !== "boolean") return "Status is required";

  return "";
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const apiError = error as { response?: { data?: { message?: string } } };
    return apiError.response?.data?.message || fallback;
  }

  return fallback;
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

  const [createForm, setCreateForm] =
    useState<StaffFormState>(emptyStaffForm);
  const [editForm, setEditForm] = useState<StaffFormState>(emptyStaffForm);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (user?.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  const updateCreateForm = (
    field: keyof StaffFormState,
    value: string | boolean,
  ) => {
    setCreateForm((current) => ({ ...current, [field]: value }));
  };

  const updateEditForm = (
    field: keyof StaffFormState,
    value: string | boolean,
  ) => {
    setEditForm((current) => ({ ...current, [field]: value }));
  };

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

  const handleCreateStaff = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = getStaffValidationError(createForm, {
      requirePassword: true,
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsCreating(true);
      setError("");
      setSuccess("");

      await api.post("/users", {
        ...createForm,
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        phone: createForm.phone.trim(),
        department: createForm.department.trim(),
        jobTitle: createForm.jobTitle.trim(),
      });

      setSuccess(
        "Staff member created successfully. A temporary password has been set.",
      );
      setCreateForm(emptyStaffForm);
      await fetchUsers(1);
    } catch (error) {
      setError(getApiErrorMessage(error, "Failed to create staff account"));
    } finally {
      setIsCreating(false);
    }
  };

  const openEditModal = (userToEdit: User) => {
    setSelectedUser(userToEdit);
    setEditForm({
      name: userToEdit.name,
      email: userToEdit.email,
      password: "",
      phone: userToEdit.phone ?? "",
      role: userToEdit.role,
      department: userToEdit.department ?? "",
      jobTitle: userToEdit.jobTitle ?? "",
      isActive: userToEdit.isActive,
    });
    setError("");
    setSuccess("");
  };

  const closeEditModal = () => {
    setSelectedUser(null);
    setEditForm(emptyStaffForm);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    const validationError = getStaffValidationError(editForm, {
      requirePassword: false,
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsUpdating(true);
      setError("");
      setSuccess("");

      await api.patch(`/users/${selectedUser.id}`, {
        ...editForm,
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        department: editForm.department.trim(),
        jobTitle: editForm.jobTitle.trim(),
        password: editForm.password.trim() || undefined,
      });

      setSuccess("Staff member updated successfully.");
      closeEditModal();
      await fetchUsers(pagination.page);
    } catch (error) {
      setError(getApiErrorMessage(error, "Failed to update staff account"));
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
    } catch (error) {
      setError(getApiErrorMessage(error, "Failed to deactivate user"));
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

      <section
        id="create-staff"
        className="mt-6 rounded-2xl bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-bold text-slate-900">
          Create Staff Account
        </h2>

        <form onSubmit={handleCreateStaff} className="mt-5 space-y-6">
          <StaffProfileFields
            form={createForm}
            onChange={updateCreateForm}
            requirePassword
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isCreating}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {isCreating ? "Creating..." : "Create Staff"}
            </button>
          </div>
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

      <section className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
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
          <EmptyState
            title="No staff members yet"
            message="Add agents or admins to help manage tickets for this workspace."
            actionLabel="Add Staff Member"
            onAction={() =>
              document
                .getElementById("create-staff")
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          />
        )}

        {!isLoading && users.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Phone</th>
                    <th className="px-5 py-3 font-medium">Role</th>
                    <th className="px-5 py-3 font-medium">Department</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Created</th>
                    <th className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {users.map((listedUser) => (
                    <tr key={listedUser.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-medium text-slate-900">
                        <div>{listedUser.name}</div>
                        {listedUser.jobTitle && (
                          <div className="mt-1 text-xs text-slate-400">
                            {listedUser.jobTitle}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {listedUser.email}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {listedUser.phone || "-"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {listedUser.role}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {listedUser.department || "-"}
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
                        {new Date(listedUser.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(listedUser)}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </button>

                          {listedUser.role !== "ADMIN" &&
                            listedUser.isActive && (
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
                  ))}
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

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 px-4 py-8">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Edit Staff Account
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Update staff profile, role, and access status.
                </p>
              </div>

              <button
                onClick={closeEditModal}
                className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-6">
              <StaffProfileFields
                form={editForm}
                onChange={updateEditForm}
                passwordHelperText="Leave empty to keep the current password."
              />

              <div className="flex justify-end gap-3 pt-2">
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

function StaffProfileFields({
  form,
  onChange,
  requirePassword = false,
  passwordHelperText,
}: {
  form: StaffFormState;
  onChange: (field: keyof StaffFormState, value: string | boolean) => void;
  requirePassword?: boolean;
  passwordHelperText?: string;
}) {
  return (
    <>
      <FormSection title="Basic Information">
        <TextField
          label="Full Name"
          value={form.name}
          onChange={(value) => onChange("name", value)}
          placeholder="Full name"
          required
        />
        <TextField
          label="Email"
          type="email"
          value={form.email}
          onChange={(value) => onChange("email", value)}
          placeholder="name@company.com"
          required
        />
        <TextField
          label="Temporary Password"
          type="password"
          value={form.password}
          onChange={(value) => onChange("password", value)}
          placeholder="Temporary password"
          required={requirePassword}
          helperText={passwordHelperText}
        />
        <TextField
          label="Phone"
          value={form.phone}
          onChange={(value) => onChange("phone", value)}
          placeholder="+1 555 0100"
          required
        />
      </FormSection>

      <FormSection title="Role & Access">
        <SelectField
          label="Role"
          value={form.role}
          onChange={(value) => onChange("role", value as UserRole)}
          options={[
            { label: "Agent", value: "AGENT" },
            { label: "Admin", value: "ADMIN" },
          ]}
          required
        />
        <TextField
          label="Department"
          value={form.department}
          onChange={(value) => onChange("department", value)}
          placeholder="Support"
          required
        />
        <TextField
          label="Job Title"
          value={form.jobTitle}
          onChange={(value) => onChange("jobTitle", value)}
          placeholder="Support Agent"
          required
        />
        <SelectField
          label="Status"
          value={form.isActive ? "active" : "inactive"}
          onChange={(value) => onChange("isActive", value === "active")}
          options={[
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ]}
          required
        />
      </FormSection>
    </>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h3>
      <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {children}
      </div>
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  helperText,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
        placeholder={placeholder}
      />
      {helperText && (
        <p className="mt-1 text-xs leading-5 text-slate-500">{helperText}</p>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <select
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
