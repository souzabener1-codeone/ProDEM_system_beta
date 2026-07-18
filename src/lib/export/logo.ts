import logoAsset from "@/assets/prodem-logo.png.asset.json";

export interface LogoData {
  dataUrl: string;
  base64: string;
  width: number;
  height: number;
}

let cache: Promise<LogoData> | null = null;

export function loadLogoData(): Promise<LogoData> {
  if (cache) return cache;
  cache = (async () => {
    const res = await fetch(logoAsset.url);
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
    const dims = await new Promise<{ w: number; h: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => reject(new Error("logo load failed"));
      img.src = dataUrl;
    });
    return {
      dataUrl,
      base64: dataUrl.split(",")[1] ?? "",
      width: dims.w,
      height: dims.h,
    };
  })();
  return cache;
}
