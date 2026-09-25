import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export const $ = selector => document.querySelector(selector);

export const todayIso = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

export const formatDate = value => {
  if (!value) return "—";
  return value.split("-").reverse().join("/");
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
  element.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "./";
  });
};

export const initProtectedPage = async ({ loading, authRequired, view, onReady }) => {
  const { data: { session } } = await supabase.auth.getSession();

  loading.hidden = true;

  if (!session) {
    authRequired.hidden = false;
    return;
  }

  view.hidden = false;
  await onReady(session);
};
