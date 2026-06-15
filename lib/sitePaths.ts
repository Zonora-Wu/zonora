const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const BASE_PATH = rawBasePath === "/" ? "" : rawBasePath.replace(/\/$/, "");

export function assetPath(path: string) {
  if (!path.startsWith("/")) return path;
  if (!BASE_PATH) return path;
  if (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`)) return path;

  return `${BASE_PATH}${path}`;
}

export function stripBasePath(pathname: string) {
  if (!BASE_PATH) return pathname;
  if (pathname === BASE_PATH) return "/";
  if (pathname.startsWith(`${BASE_PATH}/`)) {
    return pathname.slice(BASE_PATH.length) || "/";
  }

  return pathname;
}
