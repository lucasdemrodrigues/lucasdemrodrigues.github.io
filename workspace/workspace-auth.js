import {
  $,
  isSupabaseConfigured,
  supabase
} from "./shared.js";

const authView = $("#auth-view");
const privateView = $("#private-view");
const loginForm = $("#login-form");
const emailInput = $("#email");
const passwordInput = $("#password");
const loginButton = $("#login-button");
const logoutButton = $("#logout-button");
const authMessage = $("#auth-message");

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

export const initWorkspaceAuth = async onAuthenticated => {
  if (!isSupabaseConfigured || !supabase) {
    showAuth();
    loginButton.disabled = true;
    showMessage("Autenticação ainda não configurada.", true);
    return;
  }

  const handleAuthenticated = async () => {
    showPrivate();
    await onAuthenticated();
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
    await handleAuthenticated();
  });

  logoutButton.addEventListener("click", async () => {
    logoutButton.disabled = true;
    await supabase.auth.signOut();
    logoutButton.disabled = false;

    showAuth();
    emailInput.focus();
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    if (!session) showAuth();
  });

  const {
    data: { session },
    error
  } = await supabase.auth.getSession();

  if (error || !session) {
    showAuth();
    return;
  }

  await handleAuthenticated();
};
