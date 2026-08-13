"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Loader2,
  Trash2,
  PencilLine,
  Users,
  Search,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import {
  fetchUsers,
  updateUser,
  deleteAdminUser,
  type AdminUser,
} from "@/helpers/adminApi";

export default function AdminUsersPage() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "customer" | "admin">("all");

  const [page, setPage] = useState(1);
  const PER_PAGE = 5;

  useEffect(() => {
    loadUsers();
  }, []);

  function loadUsers() {
    setIsLoading(true);
    fetchUsers()
      .then((res) => {
        if (res.data) setUsers(res.data.users);
      })
      .catch((error) =>
        toast.error(error instanceof Error ? error.message : "Failed to load users")
      )
      .finally(() => setIsLoading(false));
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);
      return matchesRole && matchesSearch;
    });
  }, [users, search, roleFilter]);

  // Reset to page 1 whenever search query or role filter changes
  useEffect(() => {
    setPage(1);
  }, [search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PER_PAGE));
  const visibleUsers = filteredUsers.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const startCount = filteredUsers.length === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const endCount = Math.min(page * PER_PAGE, filteredUsers.length);

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<"customer" | "admin">("customer");
  const [isSaving, setIsSaving] = useState(false);

  function openEditModal(user: AdminUser) {
    setEditingUser(user);
    setEditName(user.name);
    setEditRole(user.role);
  }

  function closeEditModal() {
    if (isSaving) return;
    setEditingUser(null);
  }

  async function handleSaveEdit() {
    if (!editingUser) return;

    const name = editName.trim();

    if (!name) {
      toast.error("Name cannot be empty");
      return;
    }

    const payload: { name?: string; role?: "customer" | "admin" } = {};
    if (name !== editingUser.name) payload.name = name;
    if (editRole !== editingUser.role) payload.role = editRole;

    if (Object.keys(payload).length === 0) {
      setEditingUser(null);
      return;
    }

    setIsSaving(true);
    setBusyId(editingUser.id);
    try {
      const res = await updateUser(editingUser.id, payload);
      const updated = res.data?.user;
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? { ...u, ...(updated ?? payload) }
            : u
        )
      );
      toast.success(`${name} updated`);
      setEditingUser(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update user");
    } finally {
      setIsSaving(false);
      setBusyId(null);
    }
  }

  async function handleDelete(user: AdminUser) {
    if (!confirm(`Delete ${user.name}? This cannot be undone.`)) return;

    setBusyId(user.id);
    try {
      await deleteAdminUser(user.id);
      toast.success(`${user.name} deleted`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete user");
    } finally {
      setBusyId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={28} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Users size={26} className="text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500">Manage all registered users and their roles</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="relative sm:w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or email..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-600"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as "all" | "customer" | "admin")}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600 cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="customer">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <p className="text-sm text-gray-500">
            Showing {startCount}-{endCount} of {filteredUsers.length} users
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Verified</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3">Orders</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((user) => {
                const isSelf = user.id === currentAdmin?.id;

                return (
                  <tr key={user.id} className="border-b border-gray-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {user.role === "admin" ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {user.isVerified ? (
                        <Check size={16} className="text-green-600" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900">{user.orderCount}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          disabled={busyId === user.id}
                          title="Edit user"
                          className="flex items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-blue-600 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
                        >
                          <PencilLine size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={busyId === user.id || isSelf}
                          title={isSelf ? "You cannot delete your own account" : "Delete user"}
                          className="flex items-center justify-center rounded-full border border-red-200 p-1.5 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredUsers.length > PER_PAGE && (
            <div className="flex items-center justify-center gap-3 border-t border-gray-100 p-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={16} />
                Prev
              </button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 disabled:opacity-40 cursor-pointer"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {filteredUsers.length === 0 && (
            <p className="p-5 text-sm text-gray-500">No users match your search.</p>
          )}
        </div>
      </div>

      {editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeEditModal}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Edit User</h2>
              <button
                onClick={closeEditModal}
                className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  disabled
                  readOnly
                  className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as "customer" | "admin")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="customer">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeEditModal}
                disabled={isSaving}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              >
                {isSaving && <Loader2 size={14} className="animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}