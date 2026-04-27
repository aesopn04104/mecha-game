const log = document.getElementById("log");

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function rollStat(range) {
    return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
}

function generateEquipmentStats(template) {
    let stats = {};

    if (!template.statRanges) return stats;

    for (let key in template.statRanges) {
        stats[key] = rollStat(template.statRanges[key]);
    }

    return stats;
}

function generateAllies() {
    allies = [];
    allyTemplates.forEach(template => {
        allies.push(clone(template));
    });
}

function generateEnemies() {
    enemies = [];
    let baseCount = allies.length + 1;
    let variation = Math.floor(Math.random() * 5) - 2;
    let count = Math.max(1, baseCount + variation);

    for (let i = 0; i < count; i++) {
        let enemy = clone(defaultEnemy);
        enemy.id = `enemy-${Date.now()}-${i}`;
        enemy.name = `敵機-${i+1}`;
        enemies.push(enemy);
    }
}

function dropEquipment() {
    if (Math.random() < 0.7) {
        let template = equipmentPool[Math.floor(Math.random() * equipmentPool.length)];
        let item = clone(template);
        item.stats = generateEquipmentStats(template);

        inventory.push(item);

        let statText = Object.entries(item.stats)
            .map(([k,v]) => `${k}+${v}`)
            .join(", ");

        write(`獲得裝備：【${item.name}】 (${statText})`);
    } else {
        write("沒有發現可用裝備。");
    }
}

function updateTargetUI() {
    const select = document.getElementById("targetSelect");
    const currentValue = select.value;
    select.innerHTML = "";

    getAliveEnemies().forEach(enemy => {
        let option = document.createElement("option");
        option.value = enemy.id;
        option.text = `${enemy.name} (${Math.max(enemy.hp, 0)}/${enemy.maxHp})`;
        select.appendChild(option);
    });

    if (currentValue && getAliveEnemies().some(enemy => enemy.id === currentValue)) {
        select.value = currentValue;
    }
}

function restartGame() {
    player = clone(defaultPlayer);
    generateAllies();
    generateEnemies();

    battleOver = false;
    turn = 1;
    resources = 50;
    inventory = [];
    log.innerText = "";

    document.getElementById("actions").style.display = "grid";
    document.getElementById("baseActions").style.display = "none";

    write(`小隊人數：${allies.length + 1}，敵方偵測數量：約 ${enemies.length}。`);
    write("戰鬥開始。");

    updateUI();
}

function write(text) {
    log.innerText += text + "\n";
    log.scrollTop = log.scrollHeight;
}

function getAliveEnemies() {
    return enemies.filter(e => e.hp > 0);
}

function getAliveAllies() {
    return [player, ...allies].filter(a => a.hp > 0);
}

function renderAllyStatus() {
    const el = document.getElementById("allyStatus");
    el.innerHTML = "";

    [player, ...allies].forEach(unit => {
        let div = document.createElement("div");
        div.innerText = `${unit.name} | HP: ${Math.max(unit.hp,0)}/${unit.maxHp}`;
        el.appendChild(div);
    });
}

function renderEnemyStatus() {
    const el = document.getElementById("enemyStatus");
    el.innerHTML = "";

    enemies.forEach(enemy => {
        let div = document.createElement("div");
        div.innerText = `${enemy.name} | HP: ${Math.max(enemy.hp,0)}/${enemy.maxHp}`;
        el.appendChild(div);
    });
}

function updateUI() {
    document.getElementById("playerHp").innerText = `${Math.max(player.hp, 0)} / ${player.maxHp}`;
    document.getElementById("playerState").innerText = player.state;
    document.getElementById("resources").innerText = resources;

    renderAllyStatus();
    renderEnemyStatus();
    updateTargetUI();
}

function checkBattleEnd() {
    if (getAliveEnemies().length === 0) {
        battleOver = true;
        let reward = 30 + enemies.length * 5;
        resources += reward;

        write("敵方全滅。");
        write(`獲得資源 ${reward}`);
        dropEquipment();
        enterBase();
        updateUI();
        return true;
    }

    if (player.hp <= 0) {
        battleOver = true;
        write("你被擊敗。");
        updateUI();
        return true;
    }

    return false;
}

function checkEquipment() {
    write("\n=== 裝備列表 ===");

    if (inventory.length === 0) {
        write("目前沒有任何裝備。");
        return;
    }

    inventory.forEach((item, index) => {
        let statText = Object.entries(item.stats || {})
            .map(([k,v]) => `${k}+${v}`)
            .join(", ");

        write(`${index+1}. ${item.name} (${statText})`);
    });
}

function attackSelectedTarget() { /* 保持原樣 */ }
function alliesTurn() { /* 保持原樣 */ }
function enemyTurn() { /* 保持原樣 */ }
function goToBase() { /* 保持原樣 */ }
function repairMech() { /* 保持原樣 */ }
function restPilot() { /* 保持原樣 */ }
function enterBase() { /* 保持原樣 */ }
function startNextMission() { /* 保持原樣 */ }

restartGame();
