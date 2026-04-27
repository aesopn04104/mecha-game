// 招募系統整合版本
const log = document.getElementById("log");

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function setupBaseStats(unit) {
    unit.baseAttack = unit.attack;
    unit.baseDefense = unit.defense;
    unit.baseHit = unit.hit;
    unit.baseEvasion = unit.evasion || 0;
}

function generateAllies() {
    roster = [];
    allies = [];

    allyTemplates.forEach(template => {
        let ally = clone(template);
        setupBaseStats(ally);
        roster.push(ally);
    });

    // 初始上陣最多4人
    allies = roster.slice(0, 4);

    // 初始化可招募名單
    availableRecruits = recruitPool.map(r => {
        let unit = clone(r);
        setupBaseStats(unit);
        return unit;
    });
}

// === 招募 UI ===
function toggleRecruitPanel() {
    const panel = document.getElementById("recruitPanel");

    if (panel.style.display === "none") {
        panel.style.display = "block";
        renderRecruitUI();
    } else {
        panel.style.display = "none";
    }
}

function renderRecruitUI() {
    const list = document.getElementById("recruitList");
    list.innerHTML = "";

    if (availableRecruits.length === 0) {
        list.innerText = "目前沒有可招募對象";
        return;
    }

    availableRecruits.forEach((unit, index) => {
        let btn = document.createElement("button");
        btn.innerText = `${unit.name}（攻${unit.attack} 防${unit.defense} 命${unit.hit} 閃${unit.evasion}）`;
        btn.onclick = () => recruitUnit(index);
        list.appendChild(btn);
    });
}

function recruitUnit(index) {
    let unit = availableRecruits[index];

    roster.push(unit);

    if (allies.length < 4) {
        allies.push(unit);
        write(`招募成功：${unit.name} 已加入上陣小隊`);
    } else {
        write(`招募成功：${unit.name} 已加入候補（未上陣）`);
    }

    availableRecruits.splice(index, 1);

    renderRecruitUI();
    updateUI();
}

// === UI ===
function renderAllyStatus() {
    const el = document.getElementById("allyStatus");
    el.innerHTML = `上陣：${allies.length}/4<br>`;

    [player, ...allies].forEach(unit => {
        let div = document.createElement("div");
        div.innerText = `${unit.name} HP:${unit.hp}/${unit.maxHp} 攻:${unit.attack} 防:${unit.defense} 命:${unit.hit} 閃:${unit.evasion}`;
        el.appendChild(div);
    });
}

// === 其他保持原邏輯 ===
function generateEnemies() {
    enemies = [];
    let count = Math.floor(Math.random() * 7) + 1;

    for (let i = 0; i < count; i++) {
        let enemy = clone(defaultEnemy);
        enemy.id = `enemy-${Date.now()}-${i}`;
        enemy.name = `敵機-${i + 1}`;
        setupBaseStats(enemy);
        enemies.push(enemy);
    }
}

function restartGame() {
    player = clone(defaultPlayer);
    setupBaseStats(player);
    generateAllies();
    generateEnemies();

    battleOver = false;
    resources = 50;
    log.innerText = "";

    document.getElementById("actions").style.display = "grid";
    document.getElementById("baseActions").style.display = "none";

    write("戰鬥開始");
    updateUI();
}

function write(text) {
    log.innerText += text + "\n";
}

function getAliveEnemies() {
    return enemies.filter(e => e.hp > 0);
}

function getAliveAllies() {
    return [player, ...allies].filter(a => a.hp > 0);
}

function updateUI() {
    document.getElementById("playerHp").innerText =
        `${player.hp}/${player.maxHp}`;

    document.getElementById("resources").innerText = resources;

    renderAllyStatus();

    // 👉 加這兩行（關鍵）
    renderEnemyStatus();
    updateTargetUI();
}
function renderEnemyStatus() {
    const el = document.getElementById("enemyStatus");
    if (!el) return;

    el.innerHTML = "";

    enemies.forEach(enemy => {
        let div = document.createElement("div");
        div.innerText = `${enemy.name} HP:${enemy.hp}/${enemy.maxHp}`;
        el.appendChild(div);
    });
}

function updateTargetUI() {
    const select = document.getElementById("targetSelect");
    if (!select) return;

    select.innerHTML = "";

    enemies.filter(e => e.hp > 0).forEach(enemy => {
        let option = document.createElement("option");
        option.value = enemy.id;
        option.text = `${enemy.name} (${enemy.hp})`;
        select.appendChild(option);
    });
}
restartGame();

