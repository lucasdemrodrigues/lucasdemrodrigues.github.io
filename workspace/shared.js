import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY
);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

export const $ = selector => document.querySelector(selector);

export const localIsoDate = (date = new Date()) => {
  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );

  return local.toISOString().slice(0, 10);
};

export const todayIso = () => localIsoDate();

export const formatDate = value => {
  if (!value) return "—";
  return value.split("-").reverse().join("/");
};

export const formatDateTime = value => {
  if (!value) return "—";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
};

export const escapeHtml = value =>
  String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);

export const bindLogout = element => {
  if (!element || !supabase) return;

  element.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "./";
  });
};

export const initProtectedPage = async ({
  loading,
  authRequired,
  view,
  onReady
}) => {
  if (!supabase) {
    loading.hidden = true;
    authRequired.hidden = false;
    return;
  }

  const {
    data: { session }
  } = await supabase.auth.getSession();

  loading.hidden = true;

  if (!session) {
    authRequired.hidden = false;
    return;
  }

  view.hidden = false;
  await onReady(session);
};
