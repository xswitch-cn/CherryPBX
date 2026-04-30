import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 获取label
export const getLabels = (
  data: any[],
  val: string | number | undefined | null,
  returnField?: string,
  compareField?: string,
) => {
  // 设置默认值
  const returnKey = returnField ?? "label";
  const compareKey = compareField ?? "value";

  if (val == null || !data?.length) return val ?? "";

  const found = data.find((item) => String(item[compareKey]) === String(val));
  return found?.[returnKey] ?? val;
};

export function formatSizeUnits(bytes: number | undefined): string {
  if (bytes == null || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
