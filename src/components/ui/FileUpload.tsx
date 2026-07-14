import { useCallback, useEffect, useRef, useState } from "react";
import {
  Upload,
  X,
  RefreshCw,
  CircleAlert,
  FileText,
  FileSpreadsheet,
  FileArchive,
  Image as ImageIcon,
  Video,
  Headphones,
  File as FileIcon,
} from "lucide-react";

type UploadStatus = "uploading" | "completed" | "error";

interface FileUploadItem {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: UploadStatus;
  error?: string;
}

interface FileUploadProps {
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  multiple?: boolean;
  simulateUpload?: boolean;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getFileIcon(type: string) {
  const base = "h-5 w-5";
  if (type.startsWith("image/")) return <ImageIcon className={`${base} text-brand-blue`} />;
  if (type.startsWith("video/")) return <Video className={`${base} text-purple-500`} />;
  if (type.startsWith("audio/")) return <Headphones className={`${base} text-pink-500`} />;
  if (type.includes("pdf")) return <FileText className={`${base} text-danger`} />;
  if (type.includes("word") || type.includes("doc")) return <FileText className={`${base} text-brand-blue`} />;
  if (type.includes("excel") || type.includes("sheet")) return <FileSpreadsheet className={`${base} text-success`} />;
  if (type.includes("zip") || type.includes("rar")) return <FileArchive className={`${base} text-brand-orange`} />;
  return <FileIcon className={`${base} text-slate-500`} />;
}

export function FileUpload({
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024,
  accept = "*",
  multiple = true,
  simulateUpload = true,
}: FileUploadProps) {
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const arr = Array.from(incoming);
      const newErrors: string[] = [];
      const accepted: FileUploadItem[] = [];

      for (const file of arr) {
        if (files.length + accepted.length >= maxFiles) {
          newErrors.push(`Limite de ${maxFiles} arquivos atingido.`);
          break;
        }
        if (file.size > maxSize) {
          newErrors.push(`"${file.name}" excede ${formatBytes(maxSize)}.`);
          continue;
        }
        accepted.push({
          id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
          file,
          preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
          progress: 0,
          status: "uploading",
        });
      }

      setErrors(newErrors);
      if (accepted.length) setFiles((prev) => [...prev, ...accepted]);
    },
    [files.length, maxFiles, maxSize]
  );

  useEffect(() => {
    if (!simulateUpload) return;
    const interval = setInterval(() => {
      setFiles((prev) =>
        prev.map((f) => {
          if (f.status !== "uploading") return f;
          const inc = Math.random() * 15 + 5;
          const next = Math.min(f.progress + inc, 100);
          if (next > 50 && Math.random() < 0.08) {
            return { ...f, status: "error", error: "Falha no upload. Tente novamente." };
          }
          if (next >= 100) return { ...f, progress: 100, status: "completed" };
          return { ...f, progress: next };
        })
      );
    }, 500);
    return () => clearInterval(interval);
  }, [simulateUpload]);

  const removeItem = (id: string) => {
    setFiles((prev) => {
      const found = prev.find((f) => f.id === id);
      if (found?.preview) URL.revokeObjectURL(found.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const retry = (id: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, progress: 0, status: "uploading", error: undefined } : f))
    );
  };

  const clearAll = () => {
    files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
    setFiles([]);
    setErrors([]);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const completed = files.filter((f) => f.status === "completed").length;
  const failed = files.filter((f) => f.status === "error").length;
  const uploading = files.filter((f) => f.status === "uploading").length;

  return (
    <div className="space-y-4">
      <label
        onDragEnter={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[16px] border-2 border-dashed px-6 py-8 text-center transition-colors ${
          isDragging
            ? "border-brand-blue bg-brand-blue-soft/60"
            : "border-slate-200 bg-slate-50/50 hover:border-brand-blue hover:bg-brand-blue-soft/40"
        }`}
      >
        <Upload className="h-5 w-5 text-slate-400" />
        <span className="text-sm text-slate-600">Clique para selecionar arquivos ou arraste aqui</span>
        <span className="text-xs text-slate-400">
          PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (máx. {formatBytes(maxSize)})
        </span>
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {files.length > 0 && (
        <div className="flex items-center justify-between rounded-[16px] border border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-800">Progresso do Upload</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {completed > 0 && (
                <span className="inline-flex items-center rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
                  Concluídos: {completed}
                </span>
              )}
              {failed > 0 && (
                <span className="inline-flex items-center rounded-full bg-danger-soft px-2 py-0.5 text-xs font-medium text-danger">
                  Falhas: {failed}
                </span>
              )}
              {uploading > 0 && (
                <span className="inline-flex items-center rounded-full bg-brand-blue-soft px-2 py-0.5 text-xs font-medium text-brand-blue-strong">
                  Enviando: {uploading}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium text-slate-500 transition-colors hover:text-danger"
          >
            Limpar todos
          </button>
        </div>
      )}

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-3 rounded-[16px] border border-slate-200 bg-white p-3"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-slate-50">
                {f.preview ? (
                  <img src={f.preview} alt={f.file.name} className="h-full w-full object-cover" />
                ) : (
                  getFileIcon(f.file.type)
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{f.file.name}</p>
                    <p className="text-xs text-slate-500">{formatBytes(f.file.size)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {f.status === "error" && (
                      <button
                        type="button"
                        onClick={() => retry(f.id)}
                        aria-label="Tentar novamente"
                        className="rounded-full p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-blue"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeItem(f.id)}
                      aria-label="Remover arquivo"
                      className="rounded-full p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-danger"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {f.status === "uploading" && (
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-brand-blue transition-all"
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                )}

                {f.status === "error" && f.error && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-danger">
                    <CircleAlert className="h-3.5 w-3.5" />
                    {f.error}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {errors.length > 0 && (
        <div className="flex items-start gap-2 rounded-[16px] border border-danger/30 bg-danger-soft px-4 py-3">
          <CircleAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-danger" />
          <div className="text-sm text-danger">
            <p className="font-medium">Erro(s) no envio de arquivos</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs">
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
