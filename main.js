const log = document.getElementById("log");

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function restartGame() {
    player = clone(defaultPlayer);
    enemy = clone(defaultEnemy);
    battleOver = false;
    turn = 1;
    resources = 50;
    log.innerText = "";

    document.getElementById("actions").style.display = "grid";
    document.getElementById("baseActions").style.display = "none";

    write("你坐在聯邦量產機的駕駛艙內，前方街口被煙塵遮住。敵方機體停在斷牆後。");
    write("戰鬥開始。");

    updateUI();
    setActionButtons(false);
}

function write(text) {
    log.innerText += text + "\n";
    log.scrollTop = log.scrollHeight;
}

function updateUI() {
    document.getElementById("playerHp").innerText = `${Math.max(player.hp, 0)} / ${player.maxHp}`;
    document.getElementById("enemyHp").innerText = `${Math.max(enemy.hp, 0)} / ${enemy.maxHp}`;
    document.getElementById("playerState").innerText = player.state;
    document.getElementById("enemyState").innerText = enemy.state;
    document.getElementById("resources").innerText = resources;
}

function setActionButtons(disabled) {
    document.querySelectorAll("#actions button").forEach(btn => {
        if (btn.innerText !== "重新開始") btn.disabled = disabled;
    });
}

function checkBattleEnd() {
    if (enemy.hp <= 0) {
        battleOver = true;
        let reward = 35;
        resources += reward;

        write("敵機被擊毀。");
        write(`獲得資源 ${reward}`);
        enterBase();
        updateUI();
        return true;
    }

    if (player.hp <= 0) {
        battleOver = true;
        write("你被擊敗。");
        setActionButtons(true);
        updateUI();
        return true;
    }

    return false;
}

function getRestHitBonus() {
    return player.restBonus || 0;
}

function reduceRestHitBonus() {
    if (!player.restBonus) return;

    player.restBonus = Math.max(0, player.restBonus - 10);

    if (player.restBonus <= 0) {
        player.restBonus = 0;
        player.rested = false;
        write("休息帶來的專注感已經消退。");
    } else {
        write(`休息效果下降，目前命中加成剩餘 ${player.restBonus}%。`);
    }
}

function attack() {
    if (battleOver) return;

    let restBonus = getRestHitBonus();
    let chance = calcHit(player, enemy) + restBonus;

    if (restBonus > 0) {
        write(`休息讓你的瞄準更穩，本回合命中增加 ${restBonus}%。`);
    }

    if (isHit(chance)) {
        let dmg = dealDamage(14, 24);
        enemy.hp -= dmg;
        write(`命中，造成 ${dmg}`);
    } else {
        write("未命中");
    }

    reduceRestHitBonus();
    enemyTurn();
    checkBattleEnd();
    updateUI();
}

function defend() {
    player.defending = true;
    write("進入防禦");
    reduceRestHitBonus();
    enemyTurn();
    checkBattleEnd();
    updateUI();
}

function observe() {
    player.aimBonus = 15;
    write("觀察敵人");
    reduceRestHitBonus();
    enemyTurn();
    checkBattleEnd();
    updateUI();
}

function enemyTurn() {
    if (battleOver) return;

    let chance = calcHit(enemy, player);

    if (isHit(chance)) {
        let dmg = dealDamage(10, 20);
        player.hp -= dmg;
        write(`敵人命中你 ${dmg}`);
    } else {
        write("敵人未命中");
    }
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
    player.rested = true;
    player.restBonus = 50;
    player.state = "休息後狀態穩定";
    write("你休息了一會。下一場戰鬥首回合命中增加 50%，之後每回合減少 10%。");
    updateUI();
}

function enterBase() {
    document.getElementById("actions").style.display = "none";
    document.getElementById("baseActions").style.display = "grid";
}

function startNextMission() {
    enemy = clone(defaultEnemy);
    battleOver = false;

    document.getElementById("actions").style.display = "grid";
    document.getElementById("baseActions").style.display = "none";

    write("下一場戰鬥開始");
    updateUI();
}

restartGame();
