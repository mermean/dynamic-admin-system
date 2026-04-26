"use client";

import { useEffect, useState } from "react";
import GrapesEditor from "../components/GrapesEditor";

export default function StudentPage() {
  const [myFiles, setMyFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [editingFileId, setEditingFileId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [editingFileName, setEditingFileName] = useState("");
  const [canReadFiles, setCanReadFiles] = useState(true);
  const [aiResult, setAiResult] = useState("");
  const [aiFileName, setAiFileName] = useState("");
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const role = "student";

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

  const fetchStudentInfo = async () => {
  try {
    const savedUsername = localStorage.getItem("username");

    const response = await fetch("http://localhost:8000/users");
    const data = await response.json();

    const currentStudent = data.find(
      (user: any) =>
        user.username === savedUsername &&
        user.role === "student"
    );

    if (currentStudent) {
      setStudentInfo(currentStudent);
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


  const fetchFiles = async () => {
    try {
      const response = await fetch("http://localhost:8000/files");
      const data = await response.json();

      const savedUsername = localStorage.getItem("username");

      const onlyMyFiles = data.filter(
        (file: any) => file.uploaded_by === savedUsername
      );

      setMyFiles(onlyMyFiles);
    } catch (error) {
      console.log(error);
      alert("Dosyalar yüklenirken hata oluştu");
    }
  };

    useEffect(() => {
        fetchFiles();
        fetchStudentInfo();
        fetchReadPermission();
        const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      if (!token) {
        window.location.href = "/";
        return;
      }

      if (role !== "student") {
        window.location.href = "/";
        return;
      }

    }, []);

  const handleUpload = async () => {
  if (!selectedFile) {
    alert("Lütfen önce dosya seç");
    return;
  }

  const savedUsername = localStorage.getItem("username");

  if (!savedUsername) {
    alert("Kullanıcı bilgisi bulunamadı, tekrar giriş yap");
    return;
  }

  const formData = new FormData();
  formData.append("file", selectedFile);

  try {
    const response = await fetch(
      `http://localhost:8000/upload?role=student&username=${savedUsername}`,
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

    fetchFiles();
  } catch (error) {
    console.log(error);
    alert("Upload sırasında hata oluştu");
  }
};

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm(
      "Bu dosyayı silmek istediğine emin misin?"
    );

    if (!confirmDelete) return;

    try {
      const savedUsername = localStorage.getItem("username");
      const savedRole = localStorage.getItem("role");
      const response = await fetch(`http://localhost:8000/delete-file/${id}?username=${savedUsername}&role=${savedRole}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      alert(data.message);
      fetchFiles();
    } catch (error) {
      console.log(error);
      alert("Silme sırasında hata oluştu");
    }
  };


  const handleEdit = async (fileId: number) => {
    try {
      const savedUsername = localStorage.getItem("username");
      const savedRole = localStorage.getItem("role");

      if (!canReadFiles) {
        alert("Read yetkiniz yok ");
        return;
      }
      const response = await fetch(`http://localhost:8000/file-content/${fileId}?username=${savedUsername}&role=${savedRole}`
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

  const handleSaveEdit = async () => {
    if (!editingFileId) return;

    try {
      const savedUsername = localStorage.getItem("username");
      const savedRole = localStorage.getItem("role");
      const response = await fetch(`http://localhost:8000/update-file/${editingFileId}?content=${encodeURIComponent(editingContent)}&username=${savedUsername}&role=${savedRole}`,
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
      alert("Kaydetme sırasında hata oluştu");
    }
  };

  const handleAIAnalysis = async (fileId: number) => {
    try {
      const savedUsername = localStorage.getItem("username");
      const savedRole = localStorage.getItem("role");

      const response = await fetch(`http://localhost:8000/analyze-file/${fileId}?username=${savedUsername}&role=${savedRole}`
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

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="bg-white rounded-3xl shadow-lg border p-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Öğrenci Paneli
          </h1>

          <p className="text-slate-600 text-lg">
            Öğrenci dosya ve bilgi yönetim ekranı
          </p>

          {/* Student Info */}
<div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
  <h2 className="text-2xl font-bold text-slate-900 mb-6">
    Hakkımda
  </h2>

  <div className="grid md:grid-cols-2 gap-6">

    <div>
      <p className="text-slate-500">Ad Soyad</p>
      <p className="text-xl font-semibold text-slate-900">
        {studentInfo?.full_name || "Yükleniyor..."}
      </p>
    </div>

    <div>
      <p className="text-slate-500">Rol</p>
      <p className="text-xl font-semibold text-slate-900">
        {studentInfo?.role || "Student"}
      </p>
    </div>

    <div>
      <p className="text-slate-500">Email</p>
      <p className="text-xl font-semibold text-slate-900">
        {studentInfo?.email || "Yükleniyor..."}
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
        </div>

        {/* Upload */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
          <h2 className="text-2xl font-bold mb-6">
            Dosya Yükle
          </h2>

          <input
            type="file"
            className="w-full border border-slate-300 rounded-xl p-4"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setSelectedFile(e.target.files[0]);
              }
            }}
          />

          <button
            onClick={handleUpload}
            className="mt-4 bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold text-slate-500"
          >
            Dosya Yükle
          </button>
        </div>

        {/* My Files */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 text-slate-500">
          <h2 className="text-2xl font-bold mb-6 text-slate-500">
            Dosyalarım
          </h2>

          <div className="space-y-4">
            {myFiles.length > 0 ? (
              myFiles.map((file) => (
                <div
                  key={file.id}
                  className="border border-slate-200 rounded-xl p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {file.file_name}
                    </p>

                    <p className="text-slate-600">
                      Uploaded by: {file.uploaded_by}
                    </p>

                    <p className="text-sm text-slate-500">
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
                      onClick={() => handleEdit(file.id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                    >
                      Edit
                    </button>


                    <button
                      onClick={() => handleDelete(file.id)}
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
              <p className="text-slate-500">
                Henüz dosya yüklenmemiş.
              </p>
            )}
          </div>
        </div>

        {/* File Editor */}
        {editingFileId && (
          <div className="bg-white rounded-3xl shadow-lg border p-8">
            <h2 className="text-2xl font-bold mb-6">
              Dosya Editörü
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
              className="mt-4 bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold"
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

        {/* AI Analysis */}
        {aiResult && (
          <div className="bg-white rounded-3xl shadow-lg border p-8">
            <h2 className="text-2xl font-bold mb-6">
              AI Analizi
            </h2>

            <p className="font-semibold mb-4">
              {aiFileName}
            </p>

            <textarea
              value={aiResult}
              readOnly
              className="w-full h-80 border border-slate-300 rounded-xl p-4"
            />
          </div>
        )}

      </div>
    </div>
  );
}