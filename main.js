const log = document.getElementById("log");

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
}

function generateEnemies() {
    enemies = [];

    let teamSize = allies.length + 1;
    let maxEnemies = Math.max(3, teamSize + 2); // ⭐ 保底

    let count = Math.floor(Math.random() * maxEnemies) + 1;

    for (let i = 0; i < count; i++) {
        if (!defaultEnemy) continue;

        let enemy = clone(defaultEnemy);
        enemy.id = `enemy-${Date.now()}-${i}`;
        enemy.name = `敵機-${i + 1}`;
        setupBaseStats(enemy);
        enemies.push(enemy);
    }

    // ⭐ 防止完全沒有敵人
    if (enemies.length === 0 && defaultEnemy) {
        let enemy = clone(defaultEnemy);
        enemy.id = `enemy-fallback`;
        enemy.name = `敵機-備用`;
        setupBaseStats(enemy);
        enemies.push(enemy);
    }
}

function renderAllyStatus() {
    const el = document.getElementById("allyStatus");
    if (!el) return;

    el.innerHTML = `上陣：${allies.length}/4<br>`;

    [player, ...allies].forEach(unit => {
        let div = document.createElement("div");
        div.innerText = `${unit.name} HP:${Math.max(0, unit.hp)}/${unit.maxHp}`;
        el.appendChild(div);
    });
}

function renderEnemyStatus() {
    const el = document.getElementById("enemyStatus");
    if (!el) return;

    el.innerHTML = "";

    enemies.forEach(enemy => {
        let div = document.createElement("div");
        div.innerText = `${enemy.name} HP:${Math.max(0, enemy.hp)}/${enemy.maxHp}`;
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
        option.text = `${enemy.name}`;
        select.appendChild(option);
    });
}

function updateUI() {
    const hpEl = document.getElementById("playerHp");
    if (hpEl) hpEl.innerText = `${Math.max(0, player.hp)}/${player.maxHp}`;

    const resEl = document.getElementById("resources");
    if (resEl) resEl.innerText = resources;

    renderAllyStatus();
    renderEnemyStatus();
    updateTargetUI();
}

function attackSelectedTarget() {
    if (battleOver) return;

    const targetId = document.getElementById("targetSelect")?.value;
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

function write(text) {
    if (!log) return;
    log.innerText += text + "\n";
}

function restartGame() {
    player = clone(defaultPlayer);
    setupBaseStats(player);

    generateAllies();
    generateEnemies();

    battleOver = false;
    resources = 50;
    if (log) log.innerText = "";

    document.getElementById("actions").style.display = "grid";
    document.getElementById("baseActions").style.display = "none";

    write("戰鬥開始");
    updateUI();
}

// ⭐ 確保 DOM 載入後才執行
window.onload = function() {
    restartGame();
};
