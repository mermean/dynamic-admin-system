"use client";

import { useEffect, useState } from "react";

export default function SupervisorPage() {
  const [role, setRole] = useState("");
  const [pageName, setPageName] = useState("");

  const [canCreate, setCanCreate] = useState(false);
  const [canRead, setCanRead] = useState(false);
  const [canUpdate, setCanUpdate] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  const [permissions, setPermissions] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const normalizeBool = (value: any) => {
    return value === true || value === "true";
  };

  const fetchPermissions = async () => {
    try {
      const response = await fetch("http://localhost:8000/permissions");
      const data = await response.json();
      setPermissions(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPermissions();
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      window.location.href = "/";
      return;
    }

    if (role !== "admin") {
      window.location.href = "/";
      return;
    }
  }, []);

  const resetForm = () => {
    setRole("");
    setPageName("");
    setCanCreate(false);
    setCanRead(false);
    setCanUpdate(false);
    setCanDelete(false);
  };

const handleSave = async () => {
  if (!role || !pageName) {
    alert("Role ve Page Name boş olamaz");
    return;
  }

  const url = editingId
    ? `http://localhost:8000/update-permission/${editingId}`
    : "http://localhost:8000/create-permission";

  const method = editingId ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role,
        page_name: pageName,
        can_create: canCreate,
        can_read: canRead,
        can_update: canUpdate,
        can_delete: canDelete,
      }),
    });

    const data = await response.json();

    alert(data.message);

    fetchPermissions();
    resetForm();
    setEditingId(null);
  } catch (error) {
    console.log(error);
    alert("Bir hata oluştu");
  }
};

  const handleDelete = async (id: number) => {
    try {
      await fetch(
        `http://localhost:8000/delete-permission/${id}`,
        {
          method: "DELETE",
        }
      );

      fetchPermissions();
    } catch (error) {
      console.log(error);
      alert("Silme işlemi başarısız");
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);

    setRole(item.role);
    setPageName(item.page_name);

    setCanCreate(item.can_create === true || item.can_create === "true");
    setCanRead(item.can_read === true || item.can_read === "true");
    setCanUpdate(item.can_update === true || item.can_update === "true");
    setCanDelete(item.can_delete === true || item.can_delete === "true");
};

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Supervisor Dashboard
          </h1>
          <p className="text-slate-600 text-lg">
            Role bazlı yetki yönetim sistemi
          </p>
        </div>

        {/* Permission Form */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Yetki Oluştur
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <input
              type="text"
              placeholder="Role (student / teacher / admin)"
              className="border border-slate-300 rounded-xl p-4 text-slate-900 outline-none"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />

            <input
              type="text"
              placeholder="Page Name (dashboard / reports)"
              className="border border-slate-300 rounded-xl p-4 text-slate-900 outline-none"
              value={pageName}
              onChange={(e) => setPageName(e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-6">

            <label className="border border-slate-300 rounded-xl p-4 flex items-center gap-3 text-slate-800 font-medium">
              <input
                type="checkbox"
                checked={canCreate}
                onChange={(e) => setCanCreate(e.target.checked)}
              />
              <span>Create</span>
            </label>

            <label className="border border-slate-300 rounded-xl p-4 flex items-center gap-3 text-slate-800 font-medium">
              <input
                type="checkbox"
                checked={canRead}
                onChange={(e) => setCanRead(e.target.checked)}
              />
              <span>Read</span>
            </label>

            <label className="border border-slate-300 rounded-xl p-4 flex items-center gap-3 text-slate-800 font-medium">
              <input
                type="checkbox"
                checked={canUpdate}
                onChange={(e) => setCanUpdate(e.target.checked)}
              />
              <span>Update</span>
            </label>

            <label className="border border-slate-300 rounded-xl p-4 flex items-center gap-3 text-slate-800 font-medium">
              <input
                type="checkbox"
                checked={canDelete}
                onChange={(e) => setCanDelete(e.target.checked)}
              />
              <span>Delete</span>
            </label>

          </div>

          <button
            onClick={handleSave}
            className="w-full bg-slate-900 text-white rounded-xl p-4 font-semibold hover:opacity-90"
          >
            Kaydet
          </button>
        </div>

        {/* Permission Table */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Yetkililer
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700">
                  <th className="text-left py-4">Role</th>
                  <th className="text-left">Page</th>
                  <th className="text-center">Create</th>
                  <th className="text-center">Read</th>
                  <th className="text-center">Update</th>
                  <th className="text-center">Delete</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {permissions.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100"
                  >
                    <td className="py-4 text-slate-900 font-medium">
                      {item.role}
                    </td>

                    <td className="text-slate-700">
                      {item.page_name}
                    </td>

                    <td className="text-center">
                      {normalizeBool(item.can_create) ? "✅" : "❌"}
                    </td>

                    <td className="text-center">
                      {normalizeBool(item.can_read) ? "✅" : "❌"}
                    </td>

                    <td className="text-center">
                      {normalizeBool(item.can_update) ? "✅" : "❌"}
                    </td>

                    <td className="text-center">
                      {normalizeBool(item.can_delete) ? "✅" : "❌"}
                    </td>

                    <td className="text-center">
                        <button
                        onClick={() => handleEdit(item)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg mr-2"
                        >
                        Edit
                        </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:opacity-90"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {permissions.length === 0 && (
              <p className="text-center text-slate-500 mt-6">
                Henüz kayıt bulunmuyor.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}