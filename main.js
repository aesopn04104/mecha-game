const log = document.getElementById("log");

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
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
        enemy.name = `敵機-${i+1}`;
        enemies.push(enemy);
    }
}

function updateTargetUI() {
    const select = document.getElementById("targetSelect");
    select.innerHTML = "";

    getAliveEnemies().forEach(enemy => {
        let option = document.createElement("option");
        option.value = enemy.id;
        option.text = `${enemy.name} (${Math.max(enemy.hp, 0)}/${enemy.maxHp})`;
        select.appendChild(option);
    });
}

function restartGame() {
    player = clone(defaultPlayer);
    generateAllies();
    generateEnemies();

    battleOver = false;
    turn = 1;
    resources = 50;
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

function attackSelectedTarget() {
    if (battleOver) return;

    const targetId = document.getElementById("targetSelect").value;
    const target = enemies.find(enemy => enemy.id === targetId && enemy.hp > 0);
    if (!target) {
        write("沒有有效目標。");
        updateUI();
        return;
    }

    let restBonus = player.restBonus || 0;
    let chance = calcHit(player, target) + restBonus;

    if (restBonus > 0) {
        write(`休息加成 ${restBonus}%`);
    }

    if (isHit(chance)) {
        let dmg = dealDamage(14, 24);
        target.hp -= dmg;
        write(`你命中 ${target.name}，造成 ${dmg}`);
    } else {
        write("未命中");
    }

    if (player.restBonus) {
        player.restBonus = Math.max(0, player.restBonus - 10);
    }

    updateUI();

    if (checkBattleEnd()) return;

    alliesTurn();
    updateUI();

    if (checkBattleEnd()) return;

    enemyTurn();
    checkBattleEnd();
    updateUI();
}

function alliesTurn() {
    getAliveAllies().forEach(unit => {
        if (unit === player) return;

        let target = getAliveEnemies()[0];
        if (!target) return;

        let chance = calcHit(unit, target);
        if (isHit(chance)) {
            let dmg = dealDamage(8, 16);
            target.hp -= dmg;
            write(`${unit.name} 命中 ${target.name} (${dmg})`);
        } else {
            write(`${unit.name} 未命中`);
        }
    });
}

function enemyTurn() {
    getAliveEnemies().forEach(enemy => {
        let targetPool = getAliveAllies();
        if (targetPool.length === 0) return;

        let target = targetPool[Math.floor(Math.random() * targetPool.length)];

        let chance = calcHit(enemy, target);
        if (isHit(chance)) {
            let dmg = dealDamage(10, 20);
            target.hp -= dmg;
            write(`${enemy.name} 命中 ${target.name} (${dmg})`);
        } else {
            write(`${enemy.name} 未命中`);
        }
    });
}

function goToBase() {
    battleOver = true;
    enterBase();
}

function repairMech() {
    if (!battleOver) return;

    if (resources < 20) {
        write("資源不足");
        return;
    }

    resources -= 20;
    player.hp = Math.min(player.maxHp, player.hp + 30);

    write("維修完成");
    updateUI();
}

function restPilot() {
    player.restBonus = 50;
    player.state = "休息後狀態穩定";
    write("休息完成：首回合+50%，每回合-10%。");
    updateUI();
}

function enterBase() {
    document.getElementById("actions").style.display = "none";
    document.getElementById("baseActions").style.display = "grid";
}

function startNextMission() {
    generateEnemies();
    battleOver = false;

    document.getElementById("actions").style.display = "grid";
    document.getElementById("baseActions").style.display = "none";

    write(`敵方出現數量：約 ${enemies.length}`);
    updateUI();
}

restartGame();
