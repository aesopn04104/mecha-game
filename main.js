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

function calcDamage(attacker, target) {
    let baseAttack = attacker.attack || 0;
    let defense = target.defense || 0;
    let varianceRange = 0.3 + (attacker.varianceBonus || 0);
    let variance = (Math.random() * 2 - 1) * varianceRange;
    let finalAttack = Math.floor(baseAttack * (1 + variance));
    let damage = Math.max(0, finalAttack - defense);

    return {
        damage: damage,
        variance: variance,
        finalAttack: finalAttack
    };
}

function generateAllies() {
    allies = [];
    allyTemplates.forEach(template => {
        allies.push(clone(template));
    });
}

function healAlliesAfterBattle() {
    let healAmount = 30;

    allies.forEach(ally => {
        if (ally.hp <= 0) {
            ally.state = "重創待修";
            return;
        }

        let beforeHp = ally.hp;
        ally.hp = Math.min(ally.maxHp, ally.hp + healAmount);

        if (ally.hp > beforeHp) {
            write(`${ally.name} 完成臨時維修，HP 從 ${beforeHp} 回復到 ${ally.hp}。`);
        }
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
        healAlliesAfterBattle();
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
    let chance = calcHit(player, target) + restBonus + (player.aimBonus || 0);

    if (isHit(chance)) {
        let result = calcDamage(player, target);
        target.hp -= result.damage;

        if (result.variance >= 0.2) {
            write(`命中弱點！你命中 ${target.name}，造成 ${result.damage}`);
        } else {
            write(`你命中 ${target.name}，造成 ${result.damage}`);
        }
    } else {
        write("未命中");
    }

    if (player.restBonus) {
        player.restBonus = Math.max(0, player.restBonus - 10);
    }
    player.aimBonus = 0;
    player.varianceBonus = 0;

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
            let result = calcDamage(unit, target);
            target.hp -= result.damage;
            write(`${unit.name} 命中 ${target.name} (${result.damage})`);
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
            let result = calcDamage(enemy, target);
            target.hp -= result.damage;
            write(`${enemy.name} 命中 ${target.name} (${result.damage})`);
        } else {
            write(`${enemy.name} 未命中`);
        }
    });
}

function goToBase() {
    battleOver = true;
    healAlliesAfterBattle();
    enterBase();
    updateUI();
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

function observe() {
    player.aimBonus = 15;
    player.varianceBonus = 0.2;
    write("你觀察敵人，找到弱點。下一擊命中率提高，並更容易打出高傷害。");
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
