"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GrapesEditor from "../components/GrapesEditor";

export default function AdminPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newRole, setNewRole] = useState("student");
  const [users, setUsers] = useState<any[]>([]);
  const [role, setRole] = useState("");
  const [allowedExtensions, setAllowedExtensions] = useState<string[]>([]);
  const [filePermissions, setFilePermissions] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [canReadFiles, setCanReadFiles] = useState(true);  
  const [files, setFiles] = useState<any[]>([]);
  const [editingFileId, setEditingFileId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [editingFileName, setEditingFileName] = useState("");

  const [aiResult, setAiResult] = useState("");
  const [aiFileName, setAiFileName] = useState("");
  
  const [viewContent, setViewContent] = useState("");
  const [viewFileName, setViewFileName] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);

const fetchReadPermission = async () => {
  const savedRole = localStorage.getItem("role");

  try {
    const response = await fetch(
      "http://localhost:8000/permissions"
    );

    const data = await response.json();

    const permission = data.find(
      (p: any) =>
        p.role === savedRole &&
        p.page_name === "files"
    );

    if (permission) {
      setCanReadFiles(permission.can_read);
    }
  } catch (error) {
    console.log(error);
  }
};

  const handleViewFile = async (fileId: number) => {
    const savedUsername = localStorage.getItem("username");
    const savedRole = localStorage.getItem("role");

    if (!canReadFiles) {
      alert("Read yetkiniz yok ");
      return;
    }


    try {
      const response = await fetch(
        `http://localhost:8000/file-content/${fileId}?username=${savedUsername}&role=${savedRole}`
      );

      const data = await response.json();

      if (data.message) {
        alert(data.message);
        return;
      }

      setViewFileName(data.file_name);
      setViewContent(data.content);
      setShowViewModal(true);
    } catch (error) {
      console.log(error);
      alert("Dosya görüntülenirken hata oluştu");
    }
  };

  
  
  const availableExtensions = [
    "docx",
    "pdf",
    "jpg",
    "png",
    "txt",
    "xlsx",
    "jpeg",
  ];

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:8000/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.log(error);
      alert("Kullanıcılar yüklenirken hata oluştu");
    }
  };

  const fetchFilePermissions = async () => {
    try {
      const response = await fetch("http://localhost:8000/file-permissions");
      const data = await response.json();
      setFilePermissions(data);
    } catch (error) {
      console.log(error);
      alert("Dosya yetkileri yüklenirken hata oluştu");
    }
  };

  const fetchFiles = async () => {
  try {
    const response = await fetch("http://localhost:8000/files");
    const data = await response.json();

    setFiles(data); // admin full access
  } catch (error) {
    console.log(error);
    alert("Dosyalar yüklenirken hata oluştu");
  }
};

  useEffect(() => {
    fetchUsers();
    fetchFilePermissions();
    fetchFiles();
    fetchReadPermission();

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

  const handleRefresh = () => {
    fetchUsers();
    fetchFilePermissions();
    fetchFiles();
    alert("Veriler güncellendi ");
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm(
      "Bu kullanıcıyı silmek istediğine emin misin?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:8000/delete-user/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      alert(data.message);

      fetchUsers();
    } catch (error) {
      console.log(error);
      alert("Silme işlemi sırasında hata oluştu");
    }
  };

  const handleUpdate = async (
    id: number,
    currentName: string,
    currentRole: string
  ) => {
    const newName = prompt(
      "Yeni ad soyad gir:",
      currentName
    );

    if (!newName) return;

    const updatedRole = prompt(
      "Yeni rol gir (student / teacher / admin):",
      currentRole
    );

    if (!newRole) return;

    try {
      const response = await fetch(
        `http://localhost:8000/update-user/${id}?full_name=${newName}&role=${updatedRole}`,
        {
          method: "PUT",
        }
      );

      const data = await response.json();

      alert(data.message);

      fetchUsers();
    } catch (error) {
      console.log(error);
      alert("Güncelleme sırasında hata oluştu");
    }
  };

  // -----------------------------
// DELETE FILE
// -----------------------------
const handleDeleteFile = async (id: number) => {
  const savedUsername = localStorage.getItem("username");
  const savedRole = localStorage.getItem("role");

  try {
    const response = await fetch(
      `http://localhost:8000/delete-file/${id}?username=${savedUsername}&role=${savedRole}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    alert(data.message);
    fetchFiles();
  } catch (error) {
    console.log(error);
    alert("Dosya silinirken hata oluştu");
  }
};

// -----------------------------
// EDIT FILE
// -----------------------------
const handleEditFile = async (fileId: number) => {
  const savedUsername = localStorage.getItem("username");
  const savedRole = localStorage.getItem("role");

    if (!canReadFiles) {
      alert("Read yetkiniz yok ");
      return;
    }

  try {
    const response = await fetch(
      `http://localhost:8000/file-content/${fileId}?username=${savedUsername}&role=${savedRole}`
    );

    const data = await response.json();

    if (data.message) {
      alert(data.message);
      return;
    }

    setEditingFileId(fileId);
    setEditingContent(data.content);
    setEditingFileName(data.file_name);
  } catch (error) {
    console.log(error);
    alert("Dosya açılırken hata oluştu");
  }
};

// -----------------------------
// SAVE EDIT
// -----------------------------
const handleSaveEdit = async () => {
  if (!editingFileId) return;

  const savedUsername = localStorage.getItem("username");
  const savedRole = localStorage.getItem("role");

  try {
    const response = await fetch(
      `http://localhost:8000/update-file/${editingFileId}?content=${encodeURIComponent(
        editingContent
      )}&username=${savedUsername}&role=${savedRole}`,
      {
        method: "PUT",
      }
    );

    const data = await response.json();

    alert(data.message);

    setEditingFileId(null);
    setEditingContent("");
    setEditingFileName("");

    fetchFiles();
  } catch (error) {
    console.log(error);
    alert("Dosya güncellenirken hata oluştu");
  }
};

// -----------------------------
// AI ANALYSIS
// -----------------------------
const handleAIAnalysis = async (fileId: number) => {
  const savedUsername = localStorage.getItem("username");
  const savedRole = localStorage.getItem("role");

  try {
    const response = await fetch(
      `http://localhost:8000/analyze-file/${fileId}?username=${savedUsername}&role=${savedRole}`
    );

    const data = await response.json();

    if (data.message) {
      alert(data.message);
      return;
    }

    setAiFileName(data.file_name);
    setAiResult(data.ai_result);
  } catch (error) {
    console.log(error);
    alert("AI analiz sırasında hata oluştu");
  }
};

  const handleExtensionChange = (extension: string) => {
    if (allowedExtensions.includes(extension)) {
      setAllowedExtensions(
        allowedExtensions.filter((item) => item !== extension)
      );
    } else {
      setAllowedExtensions([
        ...allowedExtensions,
        extension,
      ]);
    }
  };

const handleCreateUser = async () => {
  try {
    const response = await fetch(
      "http://localhost:8000/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName,
          username,
          email,
          password,
          role: newRole,
        }),
      }
    );

    const data = await response.json();

    alert(data.message);

    setFullName("");
    setUsername("");
    setEmail("");
    setPassword("");
    setNewRole("student");

    fetchUsers();
  } catch (error) {
    console.log(error);
    alert("Kullanıcı oluşturulurken hata oluştu");
  }
};

  const handleSaveFilePermission = async () => {
    if (!role || allowedExtensions.length === 0) {
      alert("Role ve extension boş olamaz");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8000/create-file-permission",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role,
            allowed_extensions: allowedExtensions.join(","),
          }),
        }
      );

      const data = await response.json();

      alert(data.message);

      setRole("");
      setAllowedExtensions([]);

      fetchFilePermissions();
    } catch (error) {
      console.log(error);
      alert("Bir hata oluştu");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Lütfen önce bir dosya seç");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const savedUsername = localStorage.getItem("username");
      const response = await fetch(
        `http://localhost:8000/upload?role=admin&username=${savedUsername}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      alert(data.message || "Dosya başarıyla yüklendi ");
    } catch (error) {
      console.log(error);
      alert("Upload sırasında hata oluştu");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Admin Panel
          </h1>

          <p className="text-slate-600 text-lg">
            Full sistem kontrol ve yönetim paneli
          </p>
        </div>

        {/* Admin Info */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Admin Bilgisi
          </h2>
            
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-slate-500">Ad Soyad</p>
              <p className="text-xl font-semibold text-slate-900">
                90240000226
              </p>
            </div>

            <div>
              <p className="text-slate-500">Rol</p>
              <p className="text-xl font-semibold text-slate-900">
                Admin
              </p>
            </div>

            <div>
              <p className="text-slate-500">Yetki</p>
              <p className="text-xl font-semibold text-green-600">
                Full Kontrol
              </p>
            </div>

            <div>
              <p className="text-slate-500">Durum</p>
              <p className="text-xl font-semibold text-green-600">
                Aktif
              </p>
            </div>
          </div>
        </div>
<div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
    <h2 className="text-2xl font-bold text-slate-900 mb-8">
      Yeni Kullanıcı Oluştur 
    </h2>

  <div className="grid md:grid-cols-2 gap-5">

    <input
      type="text"
      placeholder="Ad Soyad"
      value={fullName}
      onChange={(e) => setFullName(e.target.value)}
      className="border border-slate-300 p-4 rounded-xl text-slate-500"
    />

    <input
      type="text"
      placeholder="Username"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      className="border border-slate-300 p-4 rounded-xl text-slate-500"
    />

    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="border border-slate-300 p-4 rounded-xl text-slate-500"
    />

    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="border border-slate-300 p-4 rounded-xl text-slate-500"
    />

    <select
      value={newRole}
      onChange={(e) => setNewRole(e.target.value)}
      className="border border-slate-300 p-4 rounded-xl text-slate-500"
    >
      <option value="student">Student</option>
      <option value="teacher">Teacher</option>
    </select>

  </div>

  <button
    onClick={handleCreateUser}
    className="mt-6 bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold"
  >
    Kullanıcı Oluştur
  </button>
</div>
        {/* Upload File */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">
            Dosya Yükle
          </h2>

          <input
            type="file"
              className="w-full border border-slate-300 rounded-xl p-4 bg-white text-slate-700 font-medium"            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setSelectedFile(e.target.files[0]);
              }
            }}
          />

          <button
            onClick={handleUpload}
            className="mt-4 bg-slate-900 text-white rounded-xl px-6 py-3 font-semibold"
          >
            Dosya Yükle
          </button>
        </div>

        {/* User Management */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Kullanıcı Yönetimi
            </h2>

            <button
              onClick={handleRefresh}
              className="bg-slate-900 text-white px-5 py-2 rounded-xl font-semibold"
            >
              Yenile
            </button>
          </div>

          <div className="space-y-4">
            {users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user.id}
                  className="border border-slate-200 rounded-2xl p-5 bg-slate-50 flex justify-between items-center"
                >
                  <div>
                    <p className="text-lg font-bold text-slate-900">
                      {user.full_name}
                    </p>

                    <p className="text-slate-700 font-medium mt-1 capitalize">
                      Role: {user.role}
                    </p>

                    <p className="text-slate-600 text-sm mt-1">
                      {user.email}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        handleUpdate(
                          user.id,
                          user.full_name,
                          user.role
                        )
                      }
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                    >
                      Update
                    </button>

                    <button
                      onClick={() => handleDelete(user.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-6">
                Henüz kullanıcı bulunmuyor
              </p>
            )}
          </div>
        </div>

        {/* System Control */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Sistem Kontrolü
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push("/supervisor")}
              className="bg-slate-900 text-white rounded-xl p-4 font-semibold"
            >
              Yetki Yönet
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="bg-slate-900 text-white rounded-xl p-4 font-semibold"
            >
              Sistem Günlüğü
            </button>

          </div>
        </div>

        {/* File Type Permission Management */}

        {/* Full File Management */}
<div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
  <h2 className="text-2xl font-bold text-slate-900 mb-6">
    Tüm dosyaların kontrolü
  </h2>

  <div className="space-y-4">
    {files.length > 0 ? (
      files.map((file) => (
        <div
          key={file.id}
          className="border border-slate-200 rounded-xl p-4 flex justify-between items-center"
        >
          <div>
            <p className="font-semibold text-slate-900">
              {file.file_name}
            </p>

            <p className="text-slate-600">
              Uploaded By: {file.uploaded_by}
            </p>

            <p className="text-slate-500 text-sm">
              Role: {file.uploader_role}
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">

            <button
              onClick={() => handleViewFile(file.id)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              View
            </button>
            <button
              onClick={() => handleEditFile(file.id)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              Edit
            </button>

            <button
              onClick={() => handleDeleteFile(file.id)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              Delete
            </button>

            <button
              onClick={() => handleAIAnalysis(file.id)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg"
            >
              AI ile Analiz Et
            </button>
          </div>
        </div>
      ))
    ) : (
      <p className="text-slate-500 text-center py-6">
        Henüz dosya bulunmuyor
      </p>
    )}
  </div>
</div>

{/* File Editor */}
{editingFileId && (
  <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
    <h2 className="text-2xl font-bold text-slate-900 mb-6">
      Dosya Editör
    </h2>

    <p className="font-semibold mb-4">
      {editingFileName}
    </p>

   <GrapesEditor
      content={editingContent}
      setContent={setEditingContent}
    />
    <button
      onClick={handleSaveEdit}
      className="mt-4 bg-slate-900 text-white px-6 py-3 rounded-xl"
    >
      Kaydet
    </button>
  </div>
)}


{showViewModal && (
  <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
    <h2 className="text-2xl font-bold text-slate-900 mb-6">
      Dosya Görüntüle 👀
    </h2>

    <p className="font-semibold mb-4">
      {viewFileName}
    </p>

    <textarea
      value={viewContent}
      readOnly
      className="w-full h-80 border border-slate-300 rounded-xl p-4 bg-slate-50 text-slate-800"
    />

    <button
      onClick={() => setShowViewModal(false)}
      className="mt-4 bg-slate-900 text-white px-6 py-3 rounded-xl"
    >
      Kapat
    </button>
  </div>
)}

{/* AI Result */}
{aiResult && (
  <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
    <h2 className="text-2xl font-bold text-slate-900 mb-6">
      AI Analysis 🤖
    </h2>

    <p className="font-semibold mb-4">
      {aiFileName}
    </p>

    <textarea
      value={aiResult}
      readOnly
      className="w-full h-80 border rounded-xl p-4"
    />
  </div>
)}


        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Dosya Yükleme Yetki Kontrolü
          </h2>

          <div className="space-y-6">
            <select
              className="w-full border border-slate-300 bg-white text-slate-900 rounded-2xl p-4 font-medium focus:outline-none focus:ring-2 focus:ring-slate-300"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">Role Seç</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {availableExtensions.map((extension) => (
                <label 
                  key={extension}
                  className="border border-slate-200 bg-slate-50 rounded-2xl p-5 hover:bg-slate-100 transition text-slate-500"
                >
                  <input
                    type="checkbox"
                    checked={allowedExtensions.includes(extension)}
                    onChange={() => handleExtensionChange(extension)}
                  />
                  {extension}
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveFilePermission}
            className="w-full bg-slate-900 text-white rounded-xl p-4 font-semibold mt-6"
          >
            Kaydet
          </button>

          <div className="mt-8 space-y-4">
            {filePermissions.length > 0 ? (
              filePermissions.map((item) => (
                <div
                  key={item.id}
                  className="border border-slate-200 rounded-xl p-4"
                >
                  <p className="font-semibold text-slate-900">
                    {item.role}
                  </p>

                  <p className="text-slate-600">
                    Allowed: {item.allowed_extensions}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center">
                Henüz dosya yetkisi tanımlanmamış
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}