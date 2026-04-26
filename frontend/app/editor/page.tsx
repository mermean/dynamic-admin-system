"use client";

import { useEffect, useRef } from "react";
import grapesjs from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";

export default function EditorPage() {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let editor: any;

    const loadEditor = async () => {
      const response = await fetch("http://localhost:8000/get-html");
      const data = await response.json();

      if (!editorRef.current) return;

      editorRef.current.innerHTML = "";

      editor = grapesjs.init({
        container: editorRef.current,
        height: "100vh",
        width: "auto",
        storageManager: false,
        components: data.html,
      });
    };

    loadEditor();

    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, []);

  return <div ref={editorRef}></div>;
}