let score = 0;
let gameInterval, timerInterval, isPlaying = false;
let currentConfig = {};
let currentModeType = 'CHILD';
let currentThemeKey = ''; 

// 🌍 終極擴充地理資料庫：四大賽區，內建更多國家與經典假首都名城
const MODES = { 
    TODDLER: { 
        speed: 2100, duration: 45000, penalty: 0, size: '16px', switchProb: 0,
        themes: {
            ASIA: { n: "🗾 亞洲經典組", text: "🎯 任務：請點擊正確的國家首都！", pool: [{e:'【台灣】台北', t:true}, {e:'【日本】東京', t:true}, {e:'【韓國】首爾', t:true}, {e:'【泰國】曼谷', t:true}, {e:'大阪', t:false}, {e:'雪梨', t:false}], c: '#475569' },
            EUROPE: { n: "🏰 歐洲漫遊組", text: "🎯 任務：請點擊正確的國家首都！", pool: [{e:'【法國】巴黎', t:true}, {e:'【英國】倫敦', t:true}, {e:'【德國】柏林', t:true}, {e:'【義大利】羅馬', t:true}, {e:'京都', t:false}, {e:'紐約', t:false}], c: '#334155' },
            AMERICA_AFRICA: { n: "🦁 美非大冒險", text: "🎯 任務：請點擊正確的國家首都！", pool: [{e:'【美國】華盛頓', t:true}, {e:'【巴西】巴西利亞', t:true}, {e:'【埃及】開羅', t:true}, {e:'【南非】普利托利亞', t:true}, {e:'紐約', t:false}, {e:'里約熱內盧', t:false}], c: '#1e293b' }
        }
    },
    CHILD: { 
        speed: 1300, duration: 50000, penalty: 5, size: '15px', switchProb: 0.25, 
        themes: {
            ASIA: { 
                n: "🗾 亞洲進階特訓 (假首都陷阱)", 
                text: "任務：聽從國家隊指令抓首都！", 
                pool_squirrel: [{e:'【台灣】台北', t:true}, {e:'【日本】東京', t:true}, {e:'【韓國】首爾', t:true}, {e:'大阪', t:false}, {e:'京都', t:false}, {e:'普吉島', t:false}], 
                pool_rabbit: [{e:'【越南】河內', t:true}, {e:'【菲律賓】馬尼拉', t:true}, {e:'【馬來西亞】吉隆坡', t:true}, {e:'胡志明市', t:false}, {e:'長灘島', t:false}, {e:'【新加坡】新加坡', t:true}], 
                c: '#2563eb' 
            },
            EUROPE: { 
                n: "🏰 歐洲與中東大戰", 
                text: "任務：考驗國際觀與反射神經！", 
                pool_squirrel: [{e:'【法國】巴黎', t:true}, {e:'【英國】倫敦', t:true}, {e:'【德國】柏林', t:true}, {e:'【義大利】羅馬', t:true}, {e:'米蘭', t:false}, {e:'巴塞隆納', t:false}], 
                pool_rabbit: [{e:'【俄羅斯】莫斯科', t:true}, {e:'【土耳其】安卡拉', t:true}, {e:'【荷蘭】阿姆斯特丹', t:true}, {e:'【西班牙】馬德里', t:true}, {e:'伊斯坦堡', t:false}, {e:'鹿特丹', t:false}, {e:'海牙', t:false}], 
                c: '#1d4ed8' 
            },
            AMERICA_AFRICA: {
                n: "🦁 美洲與非洲特訓營",
                text: "任務：提防美非兩大洲的著名大城市！",
                pool_squirrel: [{e:'【美國】華盛頓', t:true}, {e:'【加拿大】渥太華', t:true}, {e:'【巴西】巴西利亞', t:true}, {e:'紐約', t:false}, {e:'多倫多', t:false}, {e:'里約熱內盧', t:false}, {e:'溫哥華', t:false}],
                pool_rabbit: [{e:'【埃及】開羅', t:true}, {e:'【南非】普利托利亞', t:true}, {e:'【肯亞】奈洛比', t:true}, {e:'約翰尼斯堡', t:false}, {e:'開普敦', t:false}, {e:'卡薩布蘭卡', t:false}],
                c: '#1e40af'
            },
            OCEANIA: {
                n: "🏝️ 大洋洲與南方島國",
                text: "任務：點擊南半球島國的正確首都！",
                pool_squirrel: [{e:'【澳洲】堪培拉', t:true}, {e:'【紐西蘭】威靈頓', t:true}, {e:'雪梨', t:false}, {e:'墨爾本', t:false}, {e:'奧克蘭', t:false}],
                pool_rabbit: [{e:'【斐濟】蘇瓦', t:true}, {e:'【巴布亞紐幾內亞】莫士比港', t:true}, {e:'楠迪', t:false}, {e:'大溪地', t:false}],
                c: '#0369a1'
            }
        }
    },
    SENIOR: { 
        speed: 2600, duration: 60000, penalty: 0, size: '16px', switchProb: 0.1,
        themes: {
            ASIA: { n: "🗾 樂齡漫步亞洲", text: "👵 請注意：收集各國正統首都", pool_squirrel: [{e:'【台灣】台北', t:true}, {e:'【日本】東京', t:true}, {e:'高雄', t:false}], pool_rabbit: [{e:'【韓國】首爾', t:true}, {e:'【泰國】曼谷', t:true}, {e:'芭達雅', t:false}], c: '#0d9488' },
            WORLD_A: { n: "🌍 樂齡環球大腦操 (歐美)", text: "👵 請注意：美國首都是華盛頓、加拿大是渥太華喔！", pool_squirrel: [{e:'【美國】華盛頓', t:true}, {e:'【加拿大】渥太華', t:true}, {e:'紐約', t:false}, {e:'多倫多', t:false}], pool_rabbit: [{e:'【英國】倫敦', t:true}, {e:'【法國】巴黎', t:true}, {e:'曼徹斯特', t:false}], c: '#0f766e' },
            WORLD_B: { n: "🦘 樂齡環球大腦操 (紐澳非)", text: "👵 請注意：澳洲首都是堪培拉、巴西是巴西利亞喔！", pool_squirrel: [{e:'【澳洲】堪培拉', t:true}, {e:'【紐西蘭】威靈頓', t:true}, {e:'雪梨', t:false}, {e:'奧克蘭', t:false}], pool_rabbit: [{e:'【巴西】巴西利亞', t:true}, {e:'【南非】普利托利亞', t:true}, {e:'聖保羅', t:false}, {e:'開普敦', t:false}], c: '#115e59' }
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
        levelInd.innerText = "🎯 指令：認準有標註【國家】的真首都狂點！";
    } else {
        const isSquirrel = Math.random() > 0.5;
        if (currentModeType === 'CHILD') {
            if (currentThemeKey === 'ASIA') {
                inst.innerHTML = isSquirrel ? "🔴 【東北亞隊】指令：快抓 東北亞各國首都！" : "🔵 【東南亞隊】指令：快抓 東南亞各國首都！";
            }
            if (currentThemeKey === 'EUROPE') {
                inst.innerHTML = isSquirrel ? "🔴 【歐洲國家】指令：抓出 歐洲各國正統首都！" : "🔵 【中東歐與荷西】指令：抓出 俄/土/荷/西首都！";
            }
            if (currentThemeKey === 'AMERICA_AFRICA') {
                inst.innerHTML = isSquirrel ? "🔴 【美洲大國】指令：快抓 美洲國家正統首都！" : "🔵 【非洲雄獅】指令：快抓 非洲國家正統首都！";
            }
            if (currentThemeKey === 'OCEANIA') {
                inst.innerHTML = isSquirrel ? "🔴 【大洋巨頭】指令：快抓 澳洲與紐西蘭首都！" : "🔵 【太平洋群島】指令：快抓 太平洋島國首都！";
            }
            levelInd.innerText = "⚠️ 提示：前面沒有標【國家】的城市都是假的！";
            activePool = isSquirrel ? themeData.pool_squirrel : themeData.pool_rabbit;
        } else {
            if (currentThemeKey === 'ASIA') inst.innerHTML = isSquirrel ? "特訓指令 🎯：請收集 東北亞國家首都" : "特訓指令 🎯：請收集 東南亞國家首都";
            if (currentThemeKey === 'WORLD_A') inst.innerHTML = isSquirrel ? "大腦體操 🚨 美加首都是華盛頓/渥太華" : "大腦體操 🚨 英法首都是倫敦/巴黎";
            if (currentThemeKey === 'WORLD_B') inst.innerHTML = isSquirrel ? "大腦體操 🚨 紐澳首都是威靈頓/堪培拉" : "大腦體操 🚨 巴西/南非首都是巴西利亞/普利托利亞";
            levelInd.innerText = "🧘 有標記【國家】的才是真首都，看仔細再點。";
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
    
    const stageWidth = document.getElementById('stage').clientWidth;
    const maxX = Math.max(10, stageWidth - 170); // 留出170px安全寬度
    
    obj.style.left = Math.random() * maxX + 10 + 'px';
    obj.style.top = Math.random() * (260 - 20) + 60 + 'px';
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
