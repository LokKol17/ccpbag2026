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
      console.error("Erro no login:", erro.code, erro.message);
      
      if (erro.code === 'auth/unauthorized-domain') {
        alert("Erro: Este domínio não está autorizado no Firebase. Adicione 'ccpbag2026.vercel.app' nos domínios autorizados do Console do Firebase.");
      } else if (erro.code === 'auth/popup-blocked') {
        alert("O seu navegador bloqueou o popup de login. Por favor, permita popups para este site.");
      } else {
        alert("Erro ao tentar fazer login. Verifique o console para mais detalhes.");
      }
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