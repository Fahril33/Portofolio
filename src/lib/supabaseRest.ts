export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface StorageBucket {
  id: string;
  name: string;
  public: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StorageObject {
  name: string;
  id?: string;
  updated_at?: string;
  created_at?: string;
  last_accessed_at?: string;
  metadata?: unknown;
}

export interface StorageListOptions {
  limit?: number;
  offset?: number;
  sortBy?: {
    column?: string;
    order?: "asc" | "desc";
  };
}

export interface SupabaseAuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: {
    id: string;
    email?: string;
  };
}

export interface SupabaseSession {
  version: 1;
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // unix seconds
  userId: string;
  email?: string;
}

export interface SupabaseEnvStatus {
  configured: boolean;
  missing: string[];
  mode: string;
}

export interface SupabaseQueryOptions {
  accessToken?: string;
  select?: string;
  order?: string;
  limit?: number;
  offset?: number;
}

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

const parseErrorMessage = async (res: Response, fallback: string): Promise<string> => {
  try {
    const body = (await res.json()) as {
      message?: string;
      hint?: string;
      details?: string;
      error_description?: string;
      msg?: string;
    };
    return (
      body.message ||
      body.error_description ||
      body.hint ||
      body.details ||
      body.msg ||
      fallback
    );
  } catch {
    const text = await res.text().catch(() => "");
    return text || fallback;
  }
};

// ─── Storage Operations ────────────────────────────────────────────────────────

export const storagePublicUrl = (bucket: string, path: string): string => {
  const config = getConfig();
  if (!config) return "";
  const cleanBucket = bucket.trim();
  const cleanPath = path.trim().replace(/^\/+/, "");
  if (!cleanBucket || !cleanPath) return "";
  return `${config.url}/storage/v1/object/public/${cleanBucket}/${cleanPath}`;
};

export const listStorageBuckets = async (accessToken: string): Promise<StorageBucket[]> => {
  const config = getConfig();
  if (!config) throw new Error("Supabase env is not configured.");

  const res = await fetch(`${config.url}/storage/v1/bucket`, {
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const msg = await parseErrorMessage(res, "Failed to load storage buckets.");
    throw new Error(msg);
  }
  return (await res.json()) as StorageBucket[];
};

export const getStorageBucket = async (
  bucketId: string,
  accessToken: string,
): Promise<StorageBucket> => {
  const config = getConfig();
  if (!config) throw new Error("Supabase env is not configured.");

  const cleanId = bucketId.trim();
  if (!cleanId) throw new Error("Bucket ID is required.");

  const res = await fetch(`${config.url}/storage/v1/bucket/${encodeURIComponent(cleanId)}`, {
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const msg = await parseErrorMessage(res, `Failed to load bucket ${cleanId}.`);
    throw new Error(msg);
  }
  return (await res.json()) as StorageBucket;
};

export const createStorageBucket = async (
  bucketId: string,
  isPublic: boolean,
  accessToken: string,
): Promise<StorageBucket> => {
  const config = getConfig();
  if (!config) throw new Error("Supabase env is not configured.");

  const cleanId = bucketId.trim();
  if (!cleanId) throw new Error("Bucket ID is required.");

  const res = await fetch(`${config.url}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ id: cleanId, name: cleanId, public: isPublic }),
  });

  if (!res.ok) {
    const msg = await parseErrorMessage(res, `Failed to create bucket ${cleanId}.`);
    throw new Error(msg);
  }
  return (await res.json()) as StorageBucket;
};

export const deleteStorageBucket = async (
  bucketId: string,
  accessToken: string,
): Promise<void> => {
  const config = getConfig();
  if (!config) throw new Error("Supabase env is not configured.");

  const cleanId = bucketId.trim();
  if (!cleanId) throw new Error("Bucket ID is required.");

  const res = await fetch(`${config.url}/storage/v1/bucket/${encodeURIComponent(cleanId)}`, {
    method: "DELETE",
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const msg = await parseErrorMessage(res, `Failed to delete bucket ${cleanId}.`);
    throw new Error(msg);
  }
};

export const listStorageObjects = async (
  bucket: string,
  prefix: string,
  accessToken: string,
  options: StorageListOptions = {},
): Promise<StorageObject[]> => {
  const config = getConfig();
  if (!config) throw new Error("Supabase env is not configured.");

  const cleanBucket = bucket.trim();
  if (!cleanBucket) return [];

  const res = await fetch(`${config.url}/storage/v1/object/list/${encodeURIComponent(cleanBucket)}`, {
    method: "POST",
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      prefix: prefix?.trim() ?? "",
      limit: options.limit ?? 100,
      offset: options.offset ?? 0,
      sortBy: options.sortBy ?? { column: "name", order: "asc" },
    }),
  });

  if (!res.ok) {
    const msg = await parseErrorMessage(res, "Failed to load storage objects.");
    throw new Error(msg);
  }
  return (await res.json()) as StorageObject[];
};

export const signStorageObjectUrl = async (
  bucket: string,
  path: string,
  accessToken: string,
  expiresInSeconds = 60,
): Promise<string> => {
  const config = getConfig();
  if (!config) throw new Error("Supabase env is not configured.");

  const cleanBucket = bucket.trim();
  const cleanPath = path.trim().replace(/^\/+/, "");
  if (!cleanBucket || !cleanPath) return "";

  const res = await fetch(
    `${config.url}/storage/v1/object/sign/${encodeURIComponent(cleanBucket)}/${cleanPath}`,
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

  if (!res.ok) {
    const msg = await parseErrorMessage(res, "Failed to sign storage URL.");
    throw new Error(msg);
  }
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
): Promise<Record<string, unknown>> => {
  const config = getConfig();
  if (!config) throw new Error("Supabase env is not configured.");

  const cleanBucket = bucket.trim();
  const cleanPath = path.trim().replace(/^\/+/, "");
  if (!cleanBucket || !cleanPath) throw new Error("Invalid bucket or path.");

  const res = await fetch(`${config.url}/storage/v1/object/${encodeURIComponent(cleanBucket)}/${cleanPath}`, {
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
    const msg = await parseErrorMessage(res, "Upload failed.");
    throw new Error(msg);
  }

  return (await res.json().catch(() => ({}))) as Record<string, unknown>;
};

export const deleteStorageObjects = async (
  bucket: string,
  paths: string[],
  accessToken: string,
): Promise<void> => {
  const config = getConfig();
  if (!config) throw new Error("Supabase env is not configured.");

  const cleanBucket = bucket.trim();
  if (!cleanBucket || paths.length === 0) return;

  const res = await fetch(`${config.url}/storage/v1/object/${encodeURIComponent(cleanBucket)}`, {
    method: "DELETE",
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ prefixes: paths }),
  });

  if (!res.ok) {
    const msg = await parseErrorMessage(res, "Failed to delete storage object.");
    throw new Error(msg);
  }
};

// ─── Environment & Session ───────────────────────────────────────────────────

export const getSupabaseEnvStatus = (): SupabaseEnvStatus => {
  const missing: string[] = [];
  if (!import.meta.env.VITE_SUPABASE_URL) missing.push("VITE_SUPABASE_URL");
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) missing.push("VITE_SUPABASE_ANON_KEY");
  return {
    configured: missing.length === 0,
    missing,
    mode: (import.meta as unknown as { env?: { MODE?: string } })?.env?.MODE ?? "unknown",
  };
};

export const isSupabaseConfigured = (): boolean => getSupabaseEnvStatus().configured;

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

const setSession = (session: SupabaseSession | null): void => {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const clearSession = (): void => setSession(null);

export const signOut = async (): Promise<void> => {
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
    // Ignore network errors during sign-out
  } finally {
    clearSession();
  }
};

export const signInWithPassword = async (
  email: string,
  password: string,
): Promise<SupabaseSession> => {
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
    const message = await parseErrorMessage(res, "Login failed.");
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

const refreshAccessToken = async (refreshToken: string): Promise<SupabaseSession> => {
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

export const getValidAccessToken = async (): Promise<string | null> => {
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

// ─── Database CRUD Operations ────────────────────────────────────────────────

export const supabaseGet = async <T>(
  table: string,
  query: string,
  options: SupabaseQueryOptions = {},
): Promise<T> => {
  const config = getConfig();
  if (!config) throw new Error("Supabase env is not configured.");

  const url = new URL(`${config.url}/rest/v1/${table}`);
  if (options.select) url.searchParams.set("select", options.select);
  if (options.order) url.searchParams.set("order", options.order);
  if (typeof options.limit === "number") url.searchParams.set("limit", String(options.limit));
  if (typeof options.offset === "number") url.searchParams.set("offset", String(options.offset));

  const cleanQuery = query.startsWith("?") ? query.slice(1) : query;
  if (cleanQuery) {
    for (const [key, value] of new URLSearchParams(cleanQuery).entries()) {
      url.searchParams.set(key, value);
    }
  }

  const res = await fetch(url.toString(), {
    headers: {
      apikey: config.anonKey,
      Accept: "application/json",
      ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
    },
  });

  if (!res.ok) {
    const message = await parseErrorMessage(res, `Failed to fetch ${table}.`);
    throw new Error(`[Supabase ${table}] ${message}`);
  }
  return (await res.json()) as T;
};

export const supabaseInsert = async <T>(
  table: string,
  rows: unknown,
  accessToken: string,
): Promise<T> => {
  const config = getConfig();
  if (!config) throw new Error("Supabase env is not configured.");

  const url = new URL(`${config.url}/rest/v1/${table}`);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(rows),
  });

  if (!res.ok) {
    const message = await parseErrorMessage(res, `Failed to insert into ${table}.`);
    throw new Error(`[Supabase ${table}] ${message}`);
  }
  return (await res.json()) as T;
};

export const supabaseUpsert = async <T>(
  table: string,
  rows: unknown,
  accessToken: string,
  onConflict?: string,
): Promise<T> => {
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
      Accept: "application/json",
      Prefer: "return=representation,resolution=merge-duplicates",
    },
    body: JSON.stringify(rows),
  });

  if (!res.ok) {
    const message = await parseErrorMessage(res, `Failed to save ${table}.`);
    throw new Error(`[Supabase ${table}] ${message}`);
  }
  return (await res.json()) as T;
};

export const supabasePatch = async <T>(
  table: string,
  query: string,
  patch: unknown,
  accessToken: string,
): Promise<T> => {
  const config = getConfig();
  if (!config) throw new Error("Supabase env is not configured.");

  const url = new URL(`${config.url}/rest/v1/${table}`);
  const cleanQuery = query.startsWith("?") ? query.slice(1) : query;
  if (cleanQuery) {
    for (const [key, value] of new URLSearchParams(cleanQuery).entries()) {
      url.searchParams.set(key, value);
    }
  }

  const res = await fetch(url.toString(), {
    method: "PATCH",
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(patch),
  });

  if (!res.ok) {
    const message = await parseErrorMessage(res, `Failed to update ${table}.`);
    throw new Error(`[Supabase ${table}] ${message}`);
  }
  return (await res.json()) as T;
};

export const supabaseDelete = async (
  table: string,
  query: string,
  accessToken: string,
): Promise<void> => {
  const config = getConfig();
  if (!config) throw new Error("Supabase env is not configured.");

  const url = new URL(`${config.url}/rest/v1/${table}`);
  const cleanQuery = query.startsWith("?") ? query.slice(1) : query;
  if (cleanQuery) {
    for (const [key, value] of new URLSearchParams(cleanQuery).entries()) {
      url.searchParams.set(key, value);
    }
  }

  const res = await fetch(url.toString(), {
    method: "DELETE",
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const message = await parseErrorMessage(res, `Failed to delete from ${table}.`);
    throw new Error(`[Supabase ${table}] ${message}`);
  }
};

export const isAdmin = async (): Promise<boolean> => {
  const session = getSession();
  if (!session) return false;
  const accessToken = await getValidAccessToken();
  if (!accessToken) return false;

  try {
    const rows = await supabaseGet<Array<{ user_id: string }>>(
      "admin_users",
      `user_id=eq.${encodeURIComponent(session.userId)}`,
      { accessToken, select: "user_id" },
    );
    return rows.length > 0;
  } catch {
    return false;
  }
};
