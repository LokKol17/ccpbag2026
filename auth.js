import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { auth } from "./firebase.js";

const btnLogin = document.getElementById("btn-login");
const userInfo = document.getElementById("user-info");
const userPhoto = document.getElementById("user-photo");
const userName = document.getElementById("user-name");
const btnLogout = document.getElementById("btn-logout");

onAuthStateChanged(auth, (usuario) => {
  if (usuario) {
    btnLogin.classList.add("hidden");
    userInfo.classList.remove("hidden");
    userPhoto.src = usuario.photoURL;
    userName.innerText = usuario.displayName;
  } else {
    btnLogin.classList.remove("hidden");
    userInfo.classList.add("hidden");
  }
});

if (btnLogin) {
  btnLogin.addEventListener("click", () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch((erro) => {
      console.error("Erro no login:", erro);
      alert("Erro ao tentar fazer login.");
    });
  });
}

const modalSair = document.getElementById("modal-sair");
const btnConfirmarSair = document.getElementById("btn-confirmar-sair");
const btnCancelarSair = document.getElementById("btn-cancelar-sair");

if (btnLogout) {
  btnLogout.addEventListener("click", () => {
    modalSair.classList.remove("hidden");
  });
}

if (btnCancelarSair) {
  btnCancelarSair.addEventListener("click", () => {
    modalSair.classList.add("hidden");
  });
}

if (btnConfirmarSair) {
  btnConfirmarSair.addEventListener("click", () => {
    signOut(auth).then(() => {
      modalSair.classList.add("hidden");
    }).catch((erro) => console.error("Erro ao sair:", erro));
  });
}