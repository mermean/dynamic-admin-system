"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const [permissions, setPermissions] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const permissionRes = await fetch("http://localhost:8000/permissions");
      const permissionData = await permissionRes.json();
      setPermissions(permissionData);

      const logRes = await fetch("http://localhost:8000/activity-logs");
      const logData = await logRes.json();
      setLogs(logData);
    } catch (error) {
      console.log(error);
      alert("Veriler yüklenirken hata oluştu");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
    alert("Veriler güncellendi ");
  };



  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Dashboard 
          </h1>

          <p className="text-slate-600 text-lg">
            Dynamic Admin System Yönetim Paneli
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
            <h2 className="text-slate-500 text-sm mb-2">
              Toplam Permission
            </h2>

            <p className="text-3xl font-bold text-slate-900">
              {permissions.length}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
            <h2 className="text-slate-500 text-sm mb-2">
              Toplam Activity Log
            </h2>

            <p className="text-3xl font-bold text-slate-900">
              {logs.length}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
            <h2 className="text-slate-500 text-sm mb-2">
              Aktif Roller
            </h2>

            <p className="text-3xl font-bold text-slate-900">
              3
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
            <h2 className="text-slate-500 text-sm mb-2">
              Sistem Durumu
            </h2>

            <p className="text-3xl font-bold text-green-600">
              Online
            </p>
          </div>

        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Quick Actions
          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            <button
              onClick={() => router.push("/supervisor")}
              className="bg-slate-900 text-white rounded-xl p-4 font-semibold hover:opacity-90"
            >
              Permission Yönet
            </button>

            <button
              onClick={handleRefresh}
              className="border border-slate-300 text-slate-900 rounded-xl p-4 font-semibold hover:bg-slate-50"
            >
              Verileri Yenile
            </button>

          </div>
        </div>

        {/* Activity Logs */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Recent Activity Logs
          </h2>

          <div className="space-y-4">
            {logs.length > 0 ? (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50"
                >
                  <p className="font-semibold text-slate-900">
                    {log.user_name} ({log.user_role})
                  </p>

                  <p className="text-slate-700 mt-1">
                    {log.action} → {log.target}
                  </p>

                  <p className="text-sm text-slate-500 mt-2">
                    {log.created_at}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-6">
                Henüz activity log bulunmuyor
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}