import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://hwdwhrtsjhpbjcfzjcky.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Znet58KwaxCwGcgxxabHbw_bsf6eoY0";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const els = {
  authEmail: document.getElementById("authEmail"),
  authPassword: document.getElementById("authPassword"),
  signInBtn: document.getElementById("signInBtn"),
  signUpBtn: document.getElementById("signUpBtn"),
  loginStatusBanner: document.getElementById("loginStatusBanner")
};

function setStatus(message, type = "info") {
  els.loginStatusBanner.textContent = message;
  els.loginStatusBanner.className = `status-banner show ${type}`;
}

function getAuthInput() {
  return {
    email: els.authEmail.value.trim(),
    password: els.authPassword.value
  };
}

function validateAuthInput() {
  const { email, password } = getAuthInput();

  if (!email || !password) {
    setStatus("Enter both email and password.", "error");
    return null;
  }

  if (password.length < 6) {
    setStatus("Password must be at least 6 characters.", "error");
    return null;
  }

  return { email, password };
}

function setLoading(isLoading) {
  els.signInBtn.disabled = isLoading;
  els.signUpBtn.disabled = isLoading;
}

async function signIn() {
  const credentials = validateAuthInput();
  if (!credentials) return;

  setLoading(true);
  const { error } = await supabase.auth.signInWithPassword(credentials);
  setLoading(false);

  if (error) {
    setStatus(`Sign in failed: ${error.message}`, "error");
    return;
  }

  window.location.replace("index.html");
}

async function signUp() {
  const credentials = validateAuthInput();
  if (!credentials) return;

  setLoading(true);
  const { error } = await supabase.auth.signUp(credentials);
  setLoading(false);

  if (error) {
    setStatus(`Sign up failed: ${error.message}`, "error");
    return;
  }

  setStatus("Sign up successful. Check your email if confirmation is required.", "success");
}

async function init() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    setStatus(`Session check failed: ${error.message}`, "error");
    return;
  }

  if (data.session?.user) {
    window.location.replace("index.html");
    return;
  }

  els.signInBtn.addEventListener("click", signIn);
  els.signUpBtn.addEventListener("click", signUp);
}

init();
