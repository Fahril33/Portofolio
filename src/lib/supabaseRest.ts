type SupabaseConfig = {
  url: string;
  anonKey: string;
};

export type StorageBucket = {
  id: string;
  name: string;
  public: boolean;
  created_at?: string;
  updated_at?: string;
};

export type StorageObject = {
  name: string;
  id?: string;
  updated_at?: string;
  created_at?: string;
  last_accessed_at?: string;
  metadata?: unknown;
};

type SupabaseAuthResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: {
    id: string;
    email?: string;
  };
};

export type SupabaseSession = {
  version: 1;
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // unix seconds
  userId: string;
  email?: string;
};

const SESSION_KEY = "portfolio_supabase_session_v1";

const getConfig = (): SupabaseConfig | null => {
  let url = import.meta.env.VITE_SUPABASE_URL?.trim()?.replace(/\/+$/, "") || "";
  if (url.endsWith("/rest/v1")) {
    url = url.slice(0, -8);
  }
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;
  return { url, anonKey };
};

export const storagePublicUrl = (bucket: string, path: string) => {
  const config = getConfig();
  if (!config) return "";
  const cleanBucket = bucket.trim();
  const cleanPath = path.trim().replace(/^\/+/, "");
  if (!cleanBucket || !cleanPath) return "";
  return `${config.url}/storage/v1/object/public/${cleanBucket}/${cleanPath}`;
};

export const listStorageBuckets = async (accessToken: string) => {
  const config = getConfig();
  if (!config) throw new Error("Supabase env is not configured.");

  const res = await fetch(`${config.url}/storage/v1/bucket`, {
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) throw new Error("Failed to load storage buckets.");
  return (await res.json()) as StorageBucket[];
};

export const listStorageObjects = async (bucket: string, prefix: string, accessToken: string) => {
  const config = getConfig();
  if (!config) throw new Error("Supabase env is not configured.");

  const cleanBucket = bucket.trim();
  if (!cleanBucket) return [];

  const res = await fetch(`${config.url}/storage/v1/object/list/${cleanBucket}`, {
    method: "POST",
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      prefix: prefix?.trim() ?? "",
      limit: 100,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    }),
  });

  if (!res.ok) throw new Error("Failed to load storage objects.");
  return (await res.json()) as StorageObject[];
};

export const signStorageObjectUrl = async (
  bucket: string,
  path: string,
  accessToken: string,
  expiresInSeconds = 60,
) => {
  const config = getConfig();
  if (!config) throw new Error("Supabase env is not configured.");

  const cleanBucket = bucket.trim();
  const cleanPath = path.trim().replace(/^\/+/, "");
  if (!cleanBucket || !cleanPath) return "";

  const res = await fetch(
    `${config.url}/storage/v1/object/sign/${cleanBucket}/${cleanPath}`,
    {
      method: "POST",
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ expiresIn: expiresInSeconds }),
    },
  );

  if (!res.ok) throw new Error("Failed to sign storage URL.");
  const data = (await res.json()) as { signedURL?: string };
  const signedURL = typeof data.signedURL === "string" ? data.signedURL : "";
  if (!signedURL) return "";
  if (signedURL.startsWith("http://") || signedURL.startsWith("https://")) return signedURL;
  return `${config.url}${signedURL.startsWith("/") ? "" : "/"}${signedURL}`;
};

export const uploadStorageObject = async (
  bucket: string,
  path: string,
  file: File,
  accessToken: string,
  upsert = true,
) => {
  const config = getConfig();
  if (!config) throw new Error("Supabase env is not configured.");

  const cleanBucket = bucket.trim();
  const cleanPath = path.trim().replace(/^\/+/, "");
  if (!cleanBucket || !cleanPath) throw new Error("Invalid bucket/path.");

  const res = await fetch(`${config.url}/storage/v1/object/${cleanBucket}/${cleanPath}`, {
    method: "POST",
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": file.type || "application/octet-stream",
      Accept: "application/json",
      ...(upsert ? { "x-upsert": "true" } : {}),
    },
    body: file,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(body || "Upload failed.");
  }

  return await res.json().catch(() => ({}));
};

export const getSupabaseEnvStatus = () => {
  const missing: string[] = [];
  if (!import.meta.env.VITE_SUPABASE_URL) missing.push("VITE_SUPABASE_URL");
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) missing.push("VITE_SUPABASE_ANON_KEY");
  return {
    configured: missing.length === 0,
    missing,
    mode: (import.meta as unknown as { env?: { MODE?: string } })?.env?.MODE ?? "unknown",
  };
};

export const isSupabaseConfigured = () => getSupabaseEnvStatus().configured;

export const getSession = (): SupabaseSession | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SupabaseSession> | null;
    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.version !== 1) return null;
    if (
      typeof parsed.accessToken !== "string" ||
      typeof parsed.refreshToken !== "string" ||
      typeof parsed.expiresAt !== "number" ||
      typeof parsed.userId !== "string"
    ) {
      return null;
    }
    return parsed as SupabaseSession;
  } catch {
    return null;
  }
};

const setSession = (session: SupabaseSession | null) => {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const clearSession = () => setSession(null);

export const signOut = async () => {
  const config = getConfig();
  const session = getSession();

  try {
    if (config && session) {
      await fetch(`${config.url}/auth/v1/logout`, {
        method: "POST",
        headers: {
          apikey: config.anonKey,
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scope: "global" }),
      });
    }
  } catch {
    // ignore
  } finally {
    clearSession();
  }
};

export const signInWithPassword = async (email: string, password: string) => {
  const config = getConfig();
  if (!config) throw new Error("Supabase env is not configured.");

  const res = await fetch(`${config.url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      typeof body?.error_description === "string"
        ? body.error_description
        : "Login failed.";
    throw new Error(message);
  }

  const data = (await res.json()) as SupabaseAuthResponse;
  const expiresAt = Math.floor(Date.now() / 1000) + data.expires_in;
  const session: SupabaseSession = {
    version: 1,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt,
    userId: data.user.id,
    email: data.user.email,
  };
  setSession(session);
  return session;
};

const refreshAccessToken = async (refreshToken: string) => {
  const config = getConfig();
  if (!config) throw new Error("Supabase env is not configured.");

  const res = await fetch(`${config.url}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) throw new Error("Session refresh failed.");
  const data = (await res.json()) as SupabaseAuthResponse;
  const expiresAt = Math.floor(Date.now() / 1000) + data.expires_in;
  const session: SupabaseSession = {
    version: 1,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt,
    userId: data.user.id,
    email: data.user.email,
  };
  setSession(session);
  return session;
};

export const getValidAccessToken = async () => {
  const session = getSession();
  if (!session) return null;

  const now = Math.floor(Date.now() / 1000);
  const skewSeconds = 30;
  if (session.expiresAt > now + skewSeconds) return session.accessToken;

  try {
    const refreshed = await refreshAccessToken(session.refreshToken);
    return refreshed.accessToken;
  } catch {
    clearSession();
    return null;
  }
};

type SupabaseQueryOptions = {
  accessToken?: string;
  select?: string;
  order?: string;
};

export const supabaseGet = async <T>(
  table: string,
  query: string,
  options: SupabaseQueryOptions = {}
) => {
  const config = getConfig();
  if (!config) throw new Error("Supabase env is not configured.");

  const url = new URL(`${config.url}/rest/v1/${table}`);
  if (options.select) url.searchParams.set("select", options.select);
  if (options.order) url.searchParams.set("order", options.order);
  for (const [key, value] of new URLSearchParams(query).entries()) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), {
    headers: {
      apikey: config.anonKey,
      ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
    },
  });

  if (!res.ok) throw new Error(`Failed to fetch ${table}.`);
  return (await res.json()) as T;
};

export const isAdmin = async () => {
  const session = getSession();
  if (!session) return false;
  const accessToken = await getValidAccessToken();
  if (!accessToken) return false;

  try {
    const rows = await supabaseGet<Array<{ user_id: string }>>(
      "admin_users",
      `user_id=eq.${session.userId}`,
      { accessToken, select: "user_id" }
    );
    return rows.length > 0;
  } catch {
    return false;
  }
};

export const supabaseUpsert = async <T>(
  table: string,
  rows: unknown,
  accessToken: string,
  onConflict?: string,
) => {
  const config = getConfig();
  if (!config) throw new Error("Supabase env is not configured.");

  const url = new URL(`${config.url}/rest/v1/${table}`);
  if (onConflict) {
    url.searchParams.set("on_conflict", onConflict);
  }

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation,resolution=merge-duplicates",
    },
    body: JSON.stringify(rows),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw new Error(`Failed to save ${table}: ${errorBody || res.statusText}`);
  }
  return (await res.json()) as T;
};

export const supabasePatch = async <T>(
  table: string,
  query: string,
  patch: unknown,
  accessToken: string
) => {
  const config = getConfig();
  if (!config) throw new Error("Supabase env is not configured.");

  const url = new URL(`${config.url}/rest/v1/${table}`);
  for (const [key, value] of new URLSearchParams(query).entries()) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), {
    method: "PATCH",
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(patch),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw new Error(`Failed to update ${table}: ${errorBody || res.statusText}`);
  }
  return (await res.json()) as T;
};

export const supabaseDelete = async (
  table: string,
  query: string,
  accessToken: string,
) => {
  const config = getConfig();
  if (!config) throw new Error("Supabase env is not configured.");

  const url = new URL(`${config.url}/rest/v1/${table}`);
  for (const [key, value] of new URLSearchParams(query).entries()) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), {
    method: "DELETE",
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw new Error(`Failed to delete from ${table}: ${errorBody || res.statusText}`);
  }
};
