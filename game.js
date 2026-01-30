/**
 * Quiz de tocedor raiz - Game Logic
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Elements
const mainMenu = document.getElementById('main-menu');
const hud = document.getElementById('hud');
const gameOverScreen = document.getElementById('game-over');
const scoreValue = document.getElementById('score-value');
const timerBar = document.getElementById('timer-bar');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const finalScoreElement = document.getElementById('final-score');

const playerNameInput = document.getElementById('player-name');
const submitScoreBtn = document.getElementById('submit-score-btn');
const showLeaderboardBtn = document.getElementById('show-leaderboard-btn');
const leaderboardOverlay = document.getElementById('leaderboard');
const scoreList = document.getElementById('score-list');
const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');

// Login Elements
const loginScreen = document.getElementById('login-screen');
const loginUsernameInput = document.getElementById('login-username');
const loginPasswordInput = document.getElementById('login-password');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const togglePasswordBtn = document.getElementById('toggle-password');

const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

// Game State
let gameState = 'LOGIN'; // LOGIN, MENU, PLAYING, GAMEOVER
let currentUser = null;
let score = 0;
let currentQuestionIndex = 0;
let timeLeft = 100;
let timerInterval = null;
let currentDifficulty = 1;
let canAnswer = false;

// New available questions pool to avoid repeats
let availableQuestions = [];

// Question Pool - Futebol 1986 a 2026
const questions = [
    { q: "Quem foi o capitão da Argentina que levantou a taça no Mundial de 1986?", options: ["Passarella", "Maradona", "Valdano", "Burruchaga"], correct: 1 },
    { q: "Qual foi a seleção que eliminou Portugal no Mundial de 1986?", options: ["Marrocos", "Polónia", "Inglaterra", "México"], correct: 0 },
    { q: "Em que ano o AC Milan de Arrigo Sacchi venceu a sua primeira Taça dos Campeões Europeus?", options: ["1988", "1989", "1990", "1991"], correct: 1 },
    { q: "Quem marcou o golo da vitória da Alemanha na final do Mundial de 1990?", options: ["Klinsmann", "Völler", "Matthäus", "Andreas Brehme"], correct: 3 },
    { q: "Qual foi a grande surpresa (vencedora) do Euro 1992, convidada à última hora?", options: ["Suécia", "Dinamarca", "Grécia", "Iugoslávia"], correct: 1 },
    { q: "Quem falhou o penálti decisivo na final do Mundial de 1994, entregando o título ao Brasil?", options: ["Baresi", "Albertini", "Roberto Baggio", "Massaro"], correct: 2 },
    { q: "Em que estádio se realizou a final da Liga dos Campeões de 199 Manchester United 2-1 Bayern?", options: ["Camp Nou", "Wembley", "Santiago Bernabéu", "San Siro"], correct: 0 },
    { q: "Quem foi o melhor marcador (Bota de Ouro) do Mundial de 2002?", options: ["Miroslav Klose", "Rivaldo", "Ronaldo Fenômeno", "Oliver Kahn"], correct: 2 },
    { q: "Qual clube português venceu a Taça UEFA em 2003 e a Liga dos Campeões em 2004?", options: ["Benfica", "Sporting", "FC Porto", "Boavista"], correct: 2 },
    { q: "Quem foi expulso na final do Mundial de 2006 após dar uma cabeçada em Materazzi?", options: ["Henry", "Ribéry", "Vieira", "Zinedine Zidane"], correct: 3 },
    { q: "Em 2008, que seleção venceu o Campeonato da Europa na final contra a Alemanha?", options: ["Espanha", "Portugal", "França", "Itália"], correct: 0 },
    { q: "Quem marcou o golo da Espanha na final do Mundial de 2010 contra os Países Baixos?", options: ["Xavi", "Andrés Iniesta", "David Villa", "Fernando Torres"], correct: 1 },
    { q: "Qual foi o resultado histórico entre Brasil e Alemanha nas meias-finais de 2014?", options: ["1-5", "0-7", "1-7", "2-7"], correct: 2 },
    { q: "Quem marcou o golo que deu a Portugal o título de Campeão Europeu em 2016?", options: ["Cristiano Ronaldo", "Éder", "Nani", "Ricardo Quaresma"], correct: 1 },
    { q: "Qual foi a primeira seleção africana a chegar às meias-finais de um Mundial (2022)?", options: ["Gana", "Senegal", "Nigéria", "Marrocos"], correct: 3 },
    { q: "Quem detém o recorde de mais Bolas de Ouro ganhas até ao ano de 2024?", options: ["Cristiano Ronaldo", "Lionel Messi", "Pelé", "Johan Cruyff"], correct: 1 },
    { q: "Em que cidade portuguesa se realizou a 'Final Eight' da Champions 2020?", options: ["Porto", "Lisboa", "Coimbra", "Braga"], correct: 1 },
    { q: "Qual jogador marcou em cinco edições diferentes do Mundial (2006 a 2022)?", options: ["Lionel Messi", "Cristiano Ronaldo", "Miroslav Klose", "Pelé"], correct: 1 },
    { q: "Quantas seleções participarão na fase final do Mundial de 2026?", options: ["32", "40", "48", "64"], correct: 2 },
    { q: "Quais são os três países que irão organizar conjuntamente o Mundial de 2026?", options: ["EUA, México e Canadá", "Brasil, Argentina e Uruguai", "Espanha, Portugal e Marrocos", "Arábia Saudita, Egito e Gré"], correct: 0 },
    { q: "Quem era o selecionador de Portugal durante a campanha do Euro 2004?", options: ["Luiz Felipe Scolari", "António Oliveira", "Carlos Queiroz", "Paulo Bento"], correct: 0 },
    { q: "Em que país se realizou o Mundial de 1994, onde o Brasil foi tetracampeão?", options: ["França", "Itália", "Alemanha", "Estados Unidos"], correct: 3 },
    { q: "Qual o nome do estádio, em Saint-Denis, onde Portugal foi campeão europeu em 2016?", options: ["Parc des Princes", "Stade Velodrome", "Stade de France", "Stade de Lyon"], correct: 2 },
    { q: "Como ficou conhecido o segundo golo lendário de Maradona contra a Inglaterra em 1986?", options: ["Golo Maravilha", "Golo do Século", "Golo da Argentina", "Golo da Mão de Deus"], correct: 1 },
    { q: "Que seleção surpreendeu o mundo ao vencer Portugal na final do Euro 2004?", options: ["Espanha", "Grécia", "República Checa", "Inglaterra"], correct: 1 },
    { q: "Em que ano Cristiano Ronaldo conquistou a sua primeira Bola de Ouro (Ballon d'Or)?", options: ["2007", "2008", "2009", "2010"], correct: 1 },
    { q: "Qual foi o clube onde Lionel Messi fez toda a sua formação antes de se estrear como profissional?", options: ["Real Madrid", "Newell's Old Boys", "Paris Saint-Germain", "FC Barcelona"], correct: 3 },
    { q: "Quem foi o guarda-redes português que defendeu um penálti sem luvas no Euro 2004?", options: ["Vítor Baía", "Ricardo", "Quim", "Rui Patrício"], correct: 1 },
    { q: "Em que estádio lisboeta se realizou a final da Champions de 2014?", options: ["Estádio de Alvalade", "Estádio do Restelo", "Estádio da Luz", "Estádio Nacional"], correct: 2 },
    { q: "Qual foi a seleção que venceu o Mundial de 2018, realizado na Rússia?", options: ["Croácia", "França", "Bélgica", "Inglaterra"], correct: 1 },
    { q: "Quem detém o recorde de mais golos marcados por uma seleção nacional masculina?", options: ["Ali Daei", "Lionel Messi", "Cristiano Ronaldo", "Pelé"], correct: 2 },
    { q: "Em que ano foi anunciado que Portugal, Espanha e Marrocos organizariam o Mundial 2030?", options: ["2022", "2023", "2024", "2025"], correct: 1 },
    { q: "Quem ganhou a Bota de Ouro (melhor marcador) no Mundial de 2010?", options: ["David Villa", "Wesley Sneijder", "Diego Forlán", "Thomas Müller"], correct: 3 },
    { q: "Qual é o clube que detém o recorde de mais títulos da Liga dos Campeões até 2024?", options: ["Milan", "Bayern", "Liverpool", "Real Madrid"], correct: 3 },
    { q: "Como se chama o sistema de auxílio à arbitragem introduzido no Mundial 2018?", options: ["VAR", "Hawk-Eye", "TGO", "GPS"], correct: 0 },
    { q: "Quem marcou o golo decisivo na final do Euro 2008 pela Espanha?", options: ["David Villa", "Xavi", "Andrés Iniesta", "Fernando Torres"], correct: 3 },
    { q: "Em que região dos EUA se realizará a final do Mundial de 2026?", options: ["Los Angeles", "Miami", "Nova Jersey/Nova Iorque", "Dallas"], correct: 2 },
    { q: "Qual seleção africana derrotou Portugal por 3-1 no Mundial de 1986?", options: ["Argélia", "Marrocos", "Camarões", "Senegal"], correct: 1 },
    { q: "Quem era o capitão e camisola 7 da França no Mundial de 1998?", options: ["Lilian Thuram", "Didier Deschamps", "Laurent Blanc", "Zinedine Zidane"], correct: 1 },
    { q: "Qual o nome do atual troféu do Mundial, que substituiu a Taça Jules Rimet?", options: ["Copa Ouro", "FIFA World Cup Trophy", "Troféu do Século", "Taça Mundo"], correct: 1 }
];

// Background Particles for Canvas
let particles = [];

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.reset();
        }
    }

    draw() {
        ctx.fillStyle = `rgba(129, 140, 248, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < 100; i++) {
        particles.push(new Particle());
    }
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
}

window.addEventListener('resize', resize);
resize();

// Game Loop
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(update);
}

update();

// Game Control functions
function shuffleQuestions() {
    availableQuestions = [...questions].sort(() => Math.random() - 0.5);
}

function startGame() {
    gameState = 'PLAYING';
    score = 0;
    currentQuestionIndex = 0;
    currentDifficulty = 1;
    scoreValue.textContent = score;

    // Remove old input reset logic as we now use currentUser
    // playerNameInput.value = '';
    // playerNameInput.disabled = false;
    submitScoreBtn.disabled = false;

    shuffleQuestions(); // Initialize and shuffle questions

    mainMenu.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    hud.classList.remove('hidden');

    nextQuestion();
}

function nextQuestion() {
    if (gameState !== 'PLAYING') return;

    if (availableQuestions.length === 0) {
        // Se todas as perguntas foram feitas, reembaralha o pool principal
        shuffleQuestions();
    }

    canAnswer = true;

    // Remove a última pergunta da lista embaralhada disponível
    const currentQ = availableQuestions.pop();

    questionText.textContent = currentQ.q;

    optionsContainer.innerHTML = '';
    currentQ.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;
        btn.onclick = () => selectOption(index, currentQ.correct);
        optionsContainer.appendChild(btn);
    });

    startQuestionTimer();
}

function startQuestionTimer() {
    if (timerInterval) clearInterval(timerInterval);

    const duration = 15000; // 15 seconds per question, resets on correct
    const startTime = Date.now();

    timerInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = duration - elapsed;
        timeLeft = (remaining / duration) * 100;

        if (remaining <= 0) {
            timeLeft = 0;
            clearInterval(timerInterval);
            endGame();
        }

        timerBar.style.width = `${timeLeft}%`;

        if (timeLeft < 25) {
            timerBar.style.background = '#ef4444';
        } else if (timeLeft < 50) {
            timerBar.style.background = '#eab308';
        } else {
            timerBar.style.background = 'linear-gradient(to right, #22c55e, #eab308)';
        }
    }, 100);
}

function selectOption(index, correctIndex) {
    if (!canAnswer) return;
    canAnswer = false;
    clearInterval(timerInterval); // Stop timer on answer

    const buttons = optionsContainer.querySelectorAll('.option-btn');

    if (index === correctIndex) {
        buttons[index].classList.add('correct');
        const points = Math.floor(100 + (timeLeft));
        addScore(points);

        setTimeout(() => {
            nextQuestion(); // This will call startQuestionTimer and reset it
        }, 500);
    } else {
        buttons[index].classList.add('incorrect');
        buttons[correctIndex].classList.add('correct');

        setTimeout(() => {
            endGame();
        }, 1500);
    }
}

function addScore(points) {
    score += points;
    scoreValue.textContent = score;

    // Tiny bounce animation for score
    scoreValue.parentElement.style.transform = 'scale(1.2)';
    setTimeout(() => {
        scoreValue.parentElement.style.transform = 'scale(1)';
    }, 200);
}

function endGame() {
    gameState = 'GAMEOVER';
    clearInterval(timerInterval);

    hud.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    finalScoreElement.textContent = score;
}

// Event Listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Leaderboard Logic using LocalStorage
function getLeaderboard() {
    const scores = localStorage.getItem('quiz_leaderboard');
    return scores ? JSON.parse(scores) : [];
}

function saveToLeaderboard(newEntry) {
    let leaderboard = getLeaderboard();
    leaderboard.push(newEntry);
    // Sort by score descending and keep top 10
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);
    localStorage.setItem('quiz_leaderboard', JSON.stringify(leaderboard));
}

function submitScore() {
    if (!currentUser) return alert('Erro: Usuário não logado!');

    const newEntry = {
        name: currentUser,
        score: score,
        date: new Date().toISOString()
    };

    saveToLeaderboard(newEntry);
    alert('Pontuação salva com sucesso!');
    submitScoreBtn.disabled = true;
}

function loadLeaderboard() {
    const data = getLeaderboard();

    scoreList.innerHTML = '';
    if (data.length === 0) {
        scoreList.innerHTML = '<li>Nenhuma pontuação registrada ainda.</li>';
    } else {
        data.forEach((entry, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>#${index + 1} ${entry.name}</span> <span>${entry.score} pts</span>`;
            scoreList.appendChild(li);
        });
    }

    leaderboardOverlay.classList.remove('hidden');
}



submitScoreBtn.addEventListener('click', submitScore);
showLeaderboardBtn.addEventListener('click', loadLeaderboard);
closeLeaderboardBtn.addEventListener('click', () => leaderboardOverlay.classList.add('hidden'));

// Login Logic using LocalStorage
function getUsers() {
    const users = localStorage.getItem('quiz_users');
    return users ? JSON.parse(users) : {};
}

function saveUser(username, password) {
    const users = getUsers();
    users[username] = password;
    localStorage.setItem('quiz_users', JSON.stringify(users));
}

function checkLoginInputs() {
    if (loginUsernameInput.value.trim().length > 0 && loginPasswordInput.value.trim().length > 0) {
        loginBtn.disabled = false;
        if (registerBtn) registerBtn.disabled = false; // Enable register button too if inputs are valid
    } else {
        loginBtn.disabled = true;
        if (registerBtn) registerBtn.disabled = true;
    }
}

loginUsernameInput.addEventListener('input', checkLoginInputs);
loginPasswordInput.addEventListener('input', checkLoginInputs);

function performLogin() {
    const username = loginUsernameInput.value.trim();
    const password = loginPasswordInput.value.trim();

    if (!username || !password) return;

    const users = getUsers();

    if (users[username]) {
        // User exists, check password
        if (users[username] === password) {
            currentUser = username;
            successLogin();
        } else {
            alert('Senha incorreta.');
        }
    } else {
        // User does not exist
        alert('Usuário não encontrado. Por favor, cadastre-se primeiro.');
    }
}

function performRegister() {
    const username = loginUsernameInput.value.trim();
    const password = loginPasswordInput.value.trim();

    if (!username || !password) return;

    const users = getUsers();

    if (users[username]) {
        alert('Usuário já existe. Tente fazer login.');
    } else {
        saveUser(username, password);
        currentUser = username;
        alert('Usuário cadastrado com sucesso!');
        successLogin();
    }
}

function successLogin() {
    gameState = 'MENU';
    loginScreen.classList.add('hidden');
    mainMenu.classList.remove('hidden');
    localStorage.setItem('currentUser', currentUser);
}



loginBtn.addEventListener('click', performLogin);
if (registerBtn) registerBtn.addEventListener('click', performRegister);

// Toggle Password Visibility
togglePasswordBtn.addEventListener('click', () => {
    const type = loginPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    loginPasswordInput.setAttribute('type', type);

    // Toggle Icon
    if (type === 'text') {
        // Show Eye Off
        togglePasswordBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
    } else {
        // Show Eye
        togglePasswordBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
    }
});

