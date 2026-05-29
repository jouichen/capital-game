let score = 0;
let gameInterval, timerInterval, isPlaying = false;
let currentConfig = {};
let currentModeType = 'CHILD';
let currentThemeKey = ''; 

// 獨立地理資料庫：優化版（移除干擾圖案，真首都有國旗，假城市純文字）
const MODES = { 
    TODDLER: { 
        speed: 2100, duration: 40000, penalty: 0, size: '20px', switchProb: 0,
        themes: {
            ASIA: { n: "🗾 亞洲經典組", text: "🎯 任務：請點擊正確的國家首都！", pool: [{e:'🇹🇼 台北', t:true}, {e:'🇯🇵 東京', t:true}, {e:'🇰🇷 首爾', t:true}, {e:'🇹🇭 曼谷', t:true}, {e:'羅馬', t:false}, {e:'雪梨', t:false}], c: '#475569' },
            EUROPE: { n: "🏰 歐洲漫遊組", text: "🎯 任務：請點擊正確的國家首都！", pool: [{e:'🇫🇷 巴黎', t:true}, {e:'🇬🇧 倫敦', t:true}, {e:'🇩🇪 柏林', t:true}, {e:'🇮🇹 羅馬', t:true}, {e:'京都', t:false}, {e:'紐約', t:false}], c: '#334155' }
        }
    },
    CHILD: { 
        speed: 1300, duration: 45000, penalty: 5, size: '18px', switchProb: 0.25, 
        themes: {
            ASIA: { 
                n: "🗾 亞洲進階特訓 (假首都陷阱)", 
                text: "任務：聽從國家隊指令抓首都！", 
                pool_squirrel: [{e:'🇹🇼 台北', t:true}, {e:'🇯🇵 東京', t:true}, {e:'🇰🇷 首爾', t:true}, {e:'大阪', t:false}, {e:'京都', t:false}, {e:'普吉島', t:false}], 
                pool_rabbit: [{e:'🇻🇳 河內', t:true}, {e:'🇵🇭 馬尼拉', t:true}, {e:'🇲🇾 吉隆坡', t:true}, {e:'胡志明市', t:false}, {e:'長灘島', t:false}, {e:'🇸🇬 新加坡', t:true}], 
                c: '#2563eb' 
            },
            EUROPE: { 
                n: "🏰 歐洲與世界大戰", 
                text: "任務：考驗國際觀與反射神經！", 
                pool_squirrel: [{e:'🇫🇷 巴黎', t:true}, {e:'🇬🇧 倫敦', t:true}, {e:'🇩🇪 柏林', t:true}, {e:'🇮🇹 羅馬', t:true}, {e:'米蘭', t:false}, {e:'巴塞隆納', t:false}], 
                pool_rabbit: [{e:'🇺🇸 華盛頓', t:true}, {e:'🇨🇦 渥太華', t:true}, {e:'🇦🇺 堪培拉', t:true}, {e:'🇹🇷 安卡拉', t:true}, {e:'紐約', t:false}, {e:'雪梨', t:false}, {e:'伊斯坦堡', t:false}], 
                c: '#1d4ed8' 
            }
        }
    },
    SENIOR: { 
        speed: 2600, duration: 60000, penalty: 0, size: '20px', switchProb: 0.1,
        themes: {
            ASIA: { n: "🗾 樂齡漫步亞洲", text: "👵 請注意：收集各國正統首都", pool_squirrel: [{e:'🇹🇼 台北', t:true}, {e:'🇯🇵 東京', t:true}, {e:'高雄', t:false}], pool_rabbit: [{e:'🇰🇷 首爾', t:true}, {e:'🇹🇭 曼谷', t:true}, {e:'芭達雅', t:false}], c: '#0d9488' },
            WORLD: { n: "🌍 樂齡環球大腦操", text: "👵 請注意：美國首都是華盛頓不是紐約喔！", pool_squirrel: [{e:'🇺🇸 華盛頓', t:true}, {e:'🇨🇦 渥太華', t:true}, {e:'紐約', t:false}], pool_rabbit: [{e:'🇦🇺 堪培拉', t:true}, {e:'🇫🇷 巴黎', t:true}, {e:'雪梨', t:false}], c: '#0f766e' }
        }
    }
};

const correctSound = new Audio('success.mp3');
const wrongSound = new Audio('pop.mp3');
let activePool = [];

function showMenu() {
    isPlaying = false;
    clearInterval(gameInterval); 
    clearInterval(timerInterval);

    document.getElementById('menu-overlay').style.display = 'flex';
    document.getElementById('sub-menu-overlay').style.display = 'none'; 
    document.getElementById('restart-btn').style.display = 'none';
    document.getElementById('timer-container').style.display = 'none';
    document.getElementById('level-indicator').innerText = '';
    
    const obj = document.getElementById('game-object');
    if (obj) {
        obj.style.display = 'none';
        obj.innerText = ''; 
    }

    const inst = document.getElementById('instruction');
    if (inst) {
        inst.innerHTML = "🌍 歡迎來到地理首都特訓班 🌍";
    }
}

function selectMode(mode) {
    isPlaying = false;
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    
    currentModeType = mode;
    currentConfig = MODES[mode];
    
    const container = document.getElementById('theme-buttons-container');
    container.innerHTML = ''; 
    
    const titles = { TODDLER: "👶 基礎班：選擇區域", CHILD: "⚡ 進階班：選擇賽區", SENIOR: "👵 養生班：選擇旅程" };
    if(document.getElementById('sub-menu-title')) {
        document.getElementById('sub-menu-title').innerText = titles[mode];
    }

    Object.keys(currentConfig.themes).forEach(key => {
        const theme = currentConfig.themes[key];
        const btn = document.createElement('button');
        btn.className = 'mode-btn';
        btn.style.backgroundColor = theme.c;
        btn.innerText = theme.n;
        btn.onclick = () => startThemedGame(key);
        container.appendChild(btn);
    });

    document.getElementById('menu-overlay').style.display = 'none';
    document.getElementById('sub-menu-overlay').style.display = 'flex';
}

function startThemedGame(themeKey) {
    currentThemeKey = themeKey;
    document.getElementById('sub-menu-overlay').style.display = 'none';
    startGame();
}

function startGame() {
    clearInterval(gameInterval);
    clearInterval(timerInterval);

    isPlaying = true;
    score = 0;
    let timeLeft = currentConfig.duration;
    document.getElementById('score').innerText = score;
    document.getElementById('timer-container').style.display = 'block';
    document.getElementById('game-object').style.fontSize = currentConfig.size;
    
    const obj = document.getElementById('game-object');
    if (obj) {
        obj.style.display = 'none';
        obj.innerText = ''; 
    }
    
    updateModeLogic(); 
    nextTurn();

    gameInterval = setInterval(() => {
        if (Math.random() < currentConfig.switchProb) updateModeLogic();
        nextTurn();
    }, currentConfig.speed);

    timerInterval = setInterval(() => {
        timeLeft -= 100;
        document.getElementById('timer-bar').style.width = (timeLeft / currentConfig.duration * 100) + '%';
        if (timeLeft <= 0) endGame();
    }, 100);
}

function updateModeLogic() {
    const inst = document.getElementById('instruction');
    const levelInd = document.getElementById('level-indicator');
    const themeData = currentConfig.themes[currentThemeKey];
    
    if (currentModeType === 'TODDLER') {
        inst.innerHTML = themeData.text;
        activePool = themeData.pool;
        levelInd.innerText = "🎯 指令：認準真正的國旗首都狂點！";
    } else {
        const isSquirrel = Math.random() > 0.5;
        if (currentModeType === 'CHILD') {
            if (currentThemeKey === 'ASIA') {
                inst.innerHTML = isSquirrel ? "🔴 【東北亞隊】指令：快抓 ⛩️ 東北亞首都！" : "🔵 【東南亞隊】指令：快抓 🌴 東南亞首都！";
            }
            if (currentThemeKey === 'EUROPE') {
                inst.innerHTML = isSquirrel ? "🔴 【歐洲國家】指令：抓出 🏰 歐洲各國首都！" : "🔵 【世界大國】指令：抓出 🦅 美/加/澳/土耳其首都！";
            }
            levelInd.innerText = "⚠️ 提示：沒配國旗的城市（如雪梨、紐約）都是假的！";
            activePool = isSquirrel ? themeData.pool_squirrel : themeData.pool_rabbit;
        } else {
            if (currentThemeKey === 'ASIA') inst.innerHTML = isSquirrel ? "🧘 請收集：東亞首都" : "🧘 請收集：東南亞首都";
            if (currentThemeKey === 'WORLD') inst.innerHTML = isSquirrel ? "拉開警報 🚨 美國首都是華盛頓" : "拉開警報 🚨 澳洲首都是堪培拉";
            levelInd.innerText = "🧘 有國旗的才是真首都，看仔細再點。";
            activePool = isSquirrel ? themeData.pool_squirrel : themeData.pool_rabbit;
        }
    }
}

function nextTurn() {
    if (!isPlaying) {
        const obj = document.getElementById('game-object');
        if (obj) obj.style.display = 'none';
        return;
    }

    const item = activePool[Math.floor(Math.random() * activePool.length)];
    const obj = document.getElementById('game-object');
    if (!obj || !item) return;

    obj.innerText = item.e;
    obj.dataset.isTarget = item.t;
    
    // 隨機在畫面上出沒
    obj.style.left = Math.random() * (300 - 20) + 15 + 'px';
    obj.style.top = Math.random() * (280 - 20) + 60 + 'px';
    obj.style.display = 'block';
}

document.getElementById('game-object').addEventListener('pointerdown', function(e) {
    if (!isPlaying) return;
    const isTarget = this.dataset.isTarget === 'true';
    const floatDiv = document.createElement('div');
    floatDiv.className = 'floating-text ' + (isTarget ? 'plus' : 'minus');
    
    if (isTarget) {
        score += 10;
        floatDiv.innerText = currentModeType === 'TODDLER' ? '⭕' : '+10';
        correctSound.currentTime = 0; correctSound.play().catch(e=>{});
    } else {
        score = Math.max(0, score - currentConfig.penalty);
        floatDiv.innerText = currentModeType === 'TODDLER' ? '❌' : `-${currentConfig.penalty}`;
        wrongSound.currentTime = 0; wrongSound.play().catch(e=>{});
    }

    floatDiv.style.left = e.offsetX + 'px';
    floatDiv.style.top = e.offsetY + 'px';
    document.getElementById('stage').appendChild(floatDiv);
    setTimeout(()=>floatDiv.remove(), 800);
    document.getElementById('score').innerText = score;
    this.style.display = 'none';
});

function endGame() {
    isPlaying = false;
    clearInterval(gameInterval); clearInterval(timerInterval);
    document.getElementById('game-object').style.display = 'none';
    document.getElementById('restart-btn').style.display = 'inline-block';
    alert(`特訓結束！您的地理首都得分是：${score}`);
}
