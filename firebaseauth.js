import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from 'https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js';
import { 
    getFirestore, 
    setDoc, 
    doc,
    getDoc
} from 'https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyD7Dedmc7mQQlJWBop5_1_tiV5l1NRGjZo",
    authDomain: "easyp-b3b98.firebaseapp.com",
    projectId: "easyp-b3b98",
    storageBucket: "easyp-b3b98.firebasestorage.app",
    messagingSenderId: "393751176682",
    appId: "1:393751176682:web:12e1cb3743d77d4a3cfe93"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const tabs = document.querySelectorAll('.tab-header button');
const forms = document.querySelectorAll('form');
const showMessage = (msg, type, target) => {
    const div = document.getElementById(target);
    div.textContent = msg;
    div.className = `message show ${type}`;
    setTimeout(() => div.classList.remove('show'), 4000);
};

tabs.forEach(btn => btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    forms.forEach(f => f.classList.remove('active'));
    document.getElementById(btn.dataset.target).classList.add('active');
    btn.classList.add('active');
}));

// Toggle password visibility
document.querySelectorAll('.eye-icon').forEach(icon => {
    icon.addEventListener('click', () => {
        const input = icon.previousElementSibling;
        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        // Alterna ícones: car (fechado) e car-on (aberto)
        icon.classList.toggle('fa-car', !isHidden);
        icon.classList.toggle('fa-car-on', isHidden);
    });
});

// Corrigido: Removido o evento duplicado de signup
document.getElementById('form-signup').addEventListener('submit', async e => {
    e.preventDefault();
    const password = e.target.password.value.trim();
    if (password.length < 6) {
        showMessage('A senha precisa ter no mínimo 6 caracteres.', 'error', 'msg-signup');
        return;
    }
    try {
        const email = e.target.email.value;
        const firstName = e.target.firstName.value;
        const lastName = e.target.lastName.value;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCredential.user.uid), { email, firstName, lastName });
        showMessage('Conta criada com sucesso!', 'success', 'msg-signup');
        setTimeout(() => location.href = './homepage.html', 1500);
    } catch(err) {
        const code = err.code;
        const msg = code === 'auth/email-already-in-use' ? 'Email já está em uso.' : 'Erro ao criar usuário.';
        showMessage(msg, 'error', 'msg-signup');
    }
});

document.getElementById('form-signin').addEventListener('submit', async e => {
    e.preventDefault();
    const password = e.target.password.value.trim();
    if (password.length < 6) {
        showMessage('A senha precisa ter no mínimo 6 caracteres.', 'error', 'msg-signin');
        return;
    }
    try {
        const email = e.target.email.value;
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        showMessage('Login realizado!', 'success', 'msg-signin');
        localStorage.setItem('loggedInUserId', userCredential.user.uid);
        setTimeout(() => location.href = './homepage.html', 1000);
    } catch(err) {
        let msg;
        switch(err.code) {
            case 'auth/user-not-found':
                msg = 'Usuário não cadastrado.';
                break;
            case 'auth/wrong-password':
            case 'auth/invalid-password':
                msg = 'Email ou senha incorretos.';
                break;
            default:
                msg = 'Erro ao realizar login.';
        }
        showMessage(msg, 'error', 'msg-signin');
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const regionSelector = document.getElementById("regionSelector");
    const dropdown = document.getElementById("regionDropdown");
    
    if (regionSelector && dropdown) {
        // Abre/fecha o dropdown ao clicar no seletor
        regionSelector.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdown.classList.toggle("active");
        });
        
        // Fecha o dropdown ao clicar em um item
        const buttons = dropdown.querySelectorAll("button");
        buttons.forEach(button => {
            button.addEventListener("click", () => {
                // Atualiza o texto do seletor
                const regionName = regionSelector.querySelector(".region-name");
                if (regionName) {
                    regionName.textContent = button.textContent;
                }
                dropdown.classList.remove("active");
            });
        });
        
        // Fecha o dropdown ao clicar fora dele
        document.addEventListener("click", (e) => {
            if (!regionSelector.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove("active");
            }
        });
    }
    
    // Logout
    const logoutBtn = document.getElementById("logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            signOut(auth).then(() => {
                window.location.href = './index.html';
            }).catch((error) => {
                console.error("Erro ao fazer logout:", error);
            });
        });
    }
});

// Verificação de autenticação ao carregar a página
onAuthStateChanged(auth, user => {
    // Verifica se estamos na homepage (existe o elemento com classe 'navbar')
    if (document.querySelector('.navbar')) {
        if (!user) {
            // Se não houver usuário logado, redireciona para a página de login
            window.location.href = './index.html';
        } else {
            // Se houver usuário logado, busca os dados do usuário
            const userId = user.uid;
            getDoc(doc(db, 'users', userId))
                .then(docSnap => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        const greetingText = document.getElementById('greeting-text');
                        if (greetingText) {
                            greetingText.textContent = `Olá, ${userData.firstName}`;
                        }
                    }
                })
                .catch(error => {
                    console.error("Erro ao buscar dados do usuário:", error);
                });
        }
    }
});