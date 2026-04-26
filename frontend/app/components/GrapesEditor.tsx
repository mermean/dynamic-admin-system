"use client";

import { useEffect, useRef } from "react";
import grapesjs from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";

interface Props {
  content: string;
  setContent: (value: string) => void;
}

export default function GrapesEditor({
  content,
  setContent,
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstance = useRef<any>(null);

  useEffect(() => {
    if (!editorRef.current || editorInstance.current) return;

    const editor = grapesjs.init({
      container: editorRef.current,
      height: "600px",
      fromElement: false,
      storageManager: false,
      components: content || "<p>Dosya içeriği burada görünecek</p>",
    });

    editor.on("update", () => {
      const html = editor.getHtml();
      setContent(html);
    });

    editorInstance.current = editor;
  }, []);

  return (
    <div
      ref={editorRef}
      className="border rounded-xl overflow-hidden"
    />
  );
}