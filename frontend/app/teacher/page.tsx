"use client";

import { useEffect, useState } from "react";
import GrapesEditor from "../components/GrapesEditor";

export default function TeacherPage() {
  const [viewContent, setViewContent] = useState("");
  const [viewFileName, setViewFileName] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [teacherInfo, setTeacherInfo] = useState<any>(null);
  const [canReadFiles, setCanReadFiles] = useState(true);
  const [files, setFiles] = useState<any[]>([]);
  const [editingFileId, setEditingFileId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [editingFileName, setEditingFileName] = useState("");

  const [aiResult, setAiResult] = useState("");
  const [aiFileName, setAiFileName] = useState("");

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

  const fetchStudents = async () => {
    try {
      const response = await fetch("http://localhost:8000/students");
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.log(error);
      alert("Öğrenci listesi yüklenirken hata oluştu");
    }
  };

  const fetchTeacherInfo = async () => {
    try {
      const savedUsername = localStorage.getItem("username");

      const response = await fetch("http://localhost:8000/users");
      const data = await response.json();

      const currentTeacher = data.find(
        (user: any) =>
          user.username === savedUsername &&
          user.role === "teacher"
      );

      if (currentTeacher) {
        setTeacherInfo(currentTeacher);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch("http://localhost:8000/files");
      const data = await response.json();

      const savedUsername = localStorage.getItem("username");

      const allowedFiles = data.filter(
        (file: any) =>
          file.uploaded_by === savedUsername ||
          file.uploader_role === "student"
      );

      setFiles(allowedFiles);
    } catch (error) {
      console.log(error);
      alert("Dosyalar yüklenirken hata oluştu");
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchTeacherInfo();
    fetchFiles();
    fetchReadPermission();

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      window.location.href = "/";
      return;
    }

    if (role !== "teacher") {
      window.location.href = "/";
      return;
    }

  }, []);

const handleUpdate = async (
  id: number,
  currentName: string
) => {
  const newName = prompt(
    "Yeni öğrenci adı gir:",
    currentName
  );

  if (!newName) return;

  const savedRole = localStorage.getItem("role");

  try {
    const response = await fetch(
      `http://localhost:8000/update-student/${id}?full_name=${newName}&role=${savedRole}`,
      {
        method: "PUT",
      }
    );

    const data = await response.json();

    alert(data.message);
    fetchStudents();
  } catch (error) {
    console.log(error);
    alert("Güncelleme sırasında hata oluştu");
  }
};
  const handleDelete = async (id: number) => {
  const confirmDelete = confirm(
    "Bu öğrenciyi silmek istediğine emin misin?"
  );

  if (!confirmDelete) return;

  const savedRole = localStorage.getItem("role");

  try {
    const response = await fetch(
      `http://localhost:8000/delete-student/${id}?role=${savedRole}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    alert(data.message);
    fetchStudents();
  } catch (error) {
    console.log(error);
    alert("Silme işlemi sırasında hata oluştu");
  }
};

  const handleRefresh = () => {
    fetchStudents();
    fetchFiles();
    alert("Veriler güncellendi 🔥");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Lütfen önce bir dosya seç");
      return;
    }

    const savedUsername = localStorage.getItem("username");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(
        `http://localhost:8000/upload?role=teacher&username=${savedUsername}`,
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
      alert("Kaydetme sırasında hata oluştu");
    }
  };

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

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white rounded-3xl shadow-lg border p-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Öğretmen Paneli
          </h1>

          <p className="text-slate-600 text-lg">
            Öğretmen yönetim ve öğrenci takip ekranı
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
    <h2 className="text-2xl font-bold text-slate-900 mb-8">
      Hakkımda 
    </h2>

    <div className="grid md:grid-cols-2 gap-6">

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
        <p className="text-sm font-medium text-slate-500 mb-2">
          Ad Soyad
        </p>

        <p className="text-xl font-bold text-slate-900">
          {teacherInfo?.full_name || "Yükleniyor..."}
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
        <p className="text-sm font-medium text-slate-500 mb-2">
          Rol
        </p>

        <p className="text-xl font-bold text-slate-900 capitalize">
          {teacherInfo?.role || "Teacher"}
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
        <p className="text-sm font-medium text-slate-500 mb-2">
          Email
        </p>

        <p className="text-lg font-semibold text-slate-800 break-all">
          {teacherInfo?.email || "Yükleniyor..."}
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
        <p className="text-sm font-medium text-slate-500 mb-2">
          Durum
        </p>

        <p className="text-xl font-bold text-green-600">
          Aktif ●
        </p>
      </div>

    </div>
  </div>


  <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
    <h2 className="text-2xl font-bold text-slate-900 mb-8">
      Dosya Yükle 
    </h2>

  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
    <input
      type="file"
      className="w-full border border-slate-300 rounded-xl p-4 bg-white text-slate-700 font-medium"
      onChange={(e) => {
        if (e.target.files && e.target.files[0]) {
          setSelectedFile(e.target.files[0]);
        }
      }}
    />

    <button
      onClick={handleUpload}
      className="mt-6 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-semibold transition"
    >
      Dosya Yükle
    </button>
  </div>
</div>

<div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-2xl font-bold text-slate-900">
      Öğrenci Listesi 
    </h2>

    <button
      onClick={fetchStudents}
      className="bg-slate-900 text-white px-5 py-2 rounded-xl font-semibold"
    >
      Yenile
    </button>
  </div>

  <div className="space-y-4">
    {students.length > 0 ? (
      students.map((student) => (
        <div
          key={student.id}
          className="border border-slate-200 rounded-2xl p-5 bg-slate-50 flex justify-between items-center"
        >
          <div>
            <p className="text-lg font-bold text-slate-900">
              {student.full_name}
            </p>

            <p className="text-slate-700 font-medium mt-1">
              Role: {student.role}
            </p>

            <p className="text-slate-600 text-sm mt-1">
              {student.email}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() =>
                handleUpdate(
                  student.id,
                  student.full_name
                )
              }
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              Update
            </button>

            <button
              onClick={() =>
                handleDelete(student.id)
              }
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              Delete
            </button>
          </div>
        </div>
      ))
    ) : (
      <p className="text-slate-500 text-center py-6">
        Henüz öğrenci bulunmuyor
      </p>
    )}
  </div>
</div>

        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 text-slate-500">
          <h2 className="text-2xl font-bold mb-6">
            Dosya Yönetimi
          </h2>

          <div className="space-y-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="border border-slate-200 rounded-2xl p-5 bg-slate-50"
              >
                <div>
                  <p className="text-lg font-bold text-slate-900">
                    {file.file_name}
                  </p>

                  <p className="text-slate-700 font-medium mt-1">
                    Uploaded by: {file.uploaded_by}
                  </p>

                  <p className="text-slate-600 text-sm mt-1">
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
            ))}
          </div>
        </div>

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
              className="w-full h-80 border border-slate-300 rounded-xl p-4 text-slate-800 font-medium bg-slate-50"
            />
          </div>
        )}
      </div>
    </div>
  );
}