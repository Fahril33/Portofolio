import { navigateTo } from "../../../lib/navigation";
import { supabaseDelete } from "../../../lib/supabaseRest";

/** Require a valid accessToken or redirect to login. Returns null if invalid. */
export const requireToken = async (
  getAccessToken: () => Promise<string | null>,
): Promise<string | null> => {
  const token = await getAccessToken();
  if (!token) {
    navigateTo("/login");
    return null;
  }
  return token;
};

/**
 * Compare baseline IDs with current IDs and delete any rows that were removed.
 * This ensures deletions reach the database correctly.
 */
export const syncDeletions = async <T extends { id: number }>(
  table: string,
  baseline: T[] | null,
  current: T[],
  accessToken: string,
): Promise<void> => {
  if (!baseline || baseline.length === 0) return;
  const currentIds = new Set(current.map((r) => r.id));
  const deletedIds = baseline.filter((r) => !currentIds.has(r.id)).map((r) => r.id);
  if (deletedIds.length === 0) return;
  await supabaseDelete(table, `id=in.(${deletedIds.join(",")})`, accessToken);
};

/**
 * Filter out "new" rows (client-generated IDs that are not in the database).
 * New rows use client-side generated IDs. We strip the `id` field from them
 * so Supabase uses its auto-increment, then upsert existing rows normally.
 */
export const splitNewAndExisting = <T extends { id: number }>(
  rows: T[],
  baseline: T[] | null,
): { existing: T[]; newRows: Omit<T, "id">[] } => {
  const baseIds = new Set((baseline ?? []).map((r) => r.id));
  const existing: T[] = [];
  const newRows: Omit<T, "id">[] = [];
  for (const row of rows) {
    if (baseIds.has(row.id)) {
      existing.push(row);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...rest } = row;
      newRows.push(rest);
    }
  }
  return { existing, newRows };
};

