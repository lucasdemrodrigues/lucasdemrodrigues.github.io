import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";

const authView = document.querySelector("#auth-view");
const privateView = document.querySelector("#private-view");
const loginForm = document.querySelector("#login-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const loginButton = document.querySelector("#login-button");
const logoutButton = document.querySelector("#logout-button");
const authMessage = document.querySelector("#auth-message");

const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const showMessage = (message = "", isError = false) => {
  authMessage.textContent = message;
  authMessage.classList.toggle("is-error", isError);
};

const showAuth = () => {
  authView.hidden = false;
  privateView.hidden = true;
};

const showPrivate = () => {
  authView.hidden = true;
  privateView.hidden = false;
};

if (!isConfigured) {
  showAuth();
  loginButton.disabled = true;
  showMessage("Autenticação ainda não configurada.", true);
} else {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  const syncSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      showAuth();
      return;
    }
    showPrivate();
  };

  loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    showMessage();

    if (!loginForm.checkValidity()) {
      loginForm.reportValidity();
      return;
    }

    loginButton.disabled = true;
    loginButton.textContent = "Entrando…";

    const { error } = await supabase.auth.signInWithPassword({
      email: emailInput.value.trim(),
      password: passwordInput.value
    });

    loginButton.disabled = false;
    loginButton.textContent = "Entrar";

    if (error) {
      showMessage("E-mail ou senha inválidos.", true);
      return;
    }

    passwordInput.value = "";
    showPrivate();
  });

  logoutButton.addEventListener("click", async () => {
    logoutButton.disabled = true;
    await supabase.auth.signOut();
    logoutButton.disabled = false;
    showAuth();
    emailInput.focus();
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    session ? showPrivate() : showAuth();
  });

  syncSession();
}
