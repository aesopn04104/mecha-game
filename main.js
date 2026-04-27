const log = document.getElementById("log");

// ⭐ 修復：全域狀態
let player;
let allies = [];
let enemies = [];
let roster = [];
let availableRecruits = [];
let battleOver = false;
let resources = 0;

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

    allies = roster.slice(0, 4);

    availableRecruits = recruitPool.map(r => {
        let unit = clone(r);
        setupBaseStats(unit);
        return unit;
    });
}

// ⭐ 修正敵人數量：小隊+2
function generateEnemies() {
    enemies = [];

    let teamSize = allies.length + 1;
    let maxEnemies = teamSize + 2;

    let count = Math.floor(Math.random() * maxEnemies) + 1;

    for (let i = 0; i < count; i++) {
        let enemy = clone(defaultEnemy);
        enemy.id = `enemy-${Date.now()}-${i}`;
        enemy.name = `敵機-${i + 1}`;
        setupBaseStats(enemy);
        enemies.push(enemy);
    }
}

function renderAllyStatus() {
    const el = document.getElementById("allyStatus");
    el.innerHTML = `上陣：${allies.length}/4<br>`;

    [player, ...allies].forEach(unit => {
        let div = document.createElement("div");
        div.innerText = `${unit.name} HP:${Math.max(0, unit.hp)}/${unit.maxHp}`;
        el.appendChild(div);
    });
}

function renderEnemyStatus() {
    const el = document.getElementById("enemyStatus");
    el.innerHTML = "";

    enemies.forEach(enemy => {
        let div = document.createElement("div");
        div.innerText = `${enemy.name} HP:${Math.max(0, enemy.hp)}/${enemy.maxHp}`;
        el.appendChild(div);
    });
}

function updateTargetUI() {
    const select = document.getElementById("targetSelect");
    select.innerHTML = "";

    enemies.filter(e => e.hp > 0).forEach(enemy => {
        let option = document.createElement("option");
        option.value = enemy.id;
        option.text = `${enemy.name}`;
        select.appendChild(option);
    });
}

function updateUI() {
    document.getElementById("playerHp").innerText =
        `${Math.max(0, player.hp)}/${player.maxHp}`;

    document.getElementById("resources").innerText = resources;

    renderAllyStatus();
    renderEnemyStatus();
    updateTargetUI();
}

function attackSelectedTarget() {
    if (battleOver) return;

    const targetId = document.getElementById("targetSelect").value;
    const target = enemies.find(e => e.id === targetId && e.hp > 0);

    if (!target) {
        write("沒有有效目標");
        return;
    }

    let dmg = Math.max(0, player.attack - target.defense);
    target.hp -= dmg;

    write(`你攻擊 ${target.name} (${dmg})`);

    enemyTurn();
    updateUI();
}

// ⭐ 修正AI：隨機打全隊
function enemyTurn() {
    let targets = [player, ...allies].filter(u => u.hp > 0);

    enemies.forEach(enemy => {
        if (enemy.hp <= 0) return;

        let target = targets[Math.floor(Math.random() * targets.length)];

        let dmg = Math.max(0, enemy.attack - target.defense);
        target.hp -= dmg;

        write(`${enemy.name} 攻擊 ${target.name} (${dmg})`);
    });
}

function toggleRecruitPanel() {
    const panel = document.getElementById("recruitPanel");
    panel.style.display =
        panel.style.display === "none" ? "block" : "none";
}

function write(text) {
    log.innerText += text + "\n";
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

restartGame();