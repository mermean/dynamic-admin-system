"use client";

import { useState } from "react";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("username", username);

        if (data.role === "admin") {
          window.location.href = "/admin";
        } else if (data.role === "teacher") {
          window.location.href = "/teacher";
        } else if (data.role === "student") {
          window.location.href = "/student";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        alert(data.error || "Giriş başarısız");
      }
    } catch (error) {
      console.log(error);
      alert("Login sırasında hata oluştu");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-[420px] border border-slate-200">

        <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">
          Dynamic Admin System 
        </h1>

        <p className="text-center text-slate-500 mb-8">
          Role Based Secure Login
        </p>

        <input
          type="text"
          placeholder="Username"
          className="w-full border border-slate-300 p-4 rounded-xl mb-4"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border border-slate-300 p-4 rounded-xl mb-6"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-slate-900 text-white p-4 rounded-xl font-semibold"
        >
          Giriş Yap
        </button>

        <div className="mt-8 border-t pt-6 text-sm text-slate-500">
          <p className="font-semibold mb-2">
            Admin Login:
          </p>

          <p>Username: mermean</p>
          <p>Password: 6464</p>
        </div>

      </div>
    </div>
  );
}