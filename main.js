// 新增：裝備UI控制
function toggleEquipmentPanel() {
    const panel = document.getElementById("equipmentPanel");

    if (panel.style.display === "none") {
        panel.style.display = "block";
        renderEquipmentUI();
    } else {
        panel.style.display = "none";
    }
}

function renderEquipmentUI() {
    const equippedDiv = document.getElementById("equippedStatus");
    const inventoryDiv = document.getElementById("inventoryList");

    equippedDiv.innerHTML = "<h3>已裝備</h3>";

    Object.entries(player.equipped).forEach(([slot, item]) => {
        let line = document.createElement("div");
        line.innerText = `${slot}: ${item ? item.name : "無"}`;
        equippedDiv.appendChild(line);
    });

    inventoryDiv.innerHTML = "<h3>背包</h3>";

    inventory.forEach((item, index) => {
        let btn = document.createElement("button");
        btn.innerText = `${item.name} (${formatItemStats(item)})`;
        btn.onclick = () => {
            equipItem(index);
        };
        inventoryDiv.appendChild(btn);
    });
}

function equipItem(index) {
    let item = inventory[index];

    if (!item) return;

    if (item.category === "aim" && player.equipped.weapon && player.equipped.weapon.blocksAim) {
        write("大刀無法使用瞄準器");
        return;
    }

    if (item.category === "weapon" && item.blocksAim) {
        player.equipped.aim = null;
        write("裝備大刀 → 瞄準器已卸下");
    }

    player.equipped[item.category] = item;

    applyEquipmentStats(player);
    renderEquipmentUI();
    updateUI();

    write(`裝備成功：${item.name}`);
}

// === 狙擊槍冷卻系統 ===
function canAttack(unit) {
    if (unit.weaponCooldown && unit.weaponCooldown > 0) {
        return false;
    }
    return true;
}

function applyWeaponCooldown(unit) {
    if (unit.equipped.weapon && unit.equipped.weapon.cooldownTurns) {
        unit.weaponCooldown = unit.equipped.weapon.cooldownTurns;
    }
}

function reduceCooldown(unit) {
    if (unit.weaponCooldown && unit.weaponCooldown > 0) {
        unit.weaponCooldown--;
    }
}

// 修改 attackSelectedTarget（覆蓋原函數）
function attackSelectedTarget() {
    if (battleOver) return;

    if (!canAttack(player)) {
        write("武器冷卻中，無法攻擊");
        return;
    }

    const targetId = document.getElementById("targetSelect").value;
    const target = enemies.find(enemy => enemy.id === targetId && enemy.hp > 0);
    if (!target) {
        write("沒有有效目標。");
        return;
    }

    let chance = calcFinalHit(player, target);

    if (isHit(chance)) {
        let result = calcDamage(player, target);
        target.hp -= result.damage;

        if (result.variance >= 0.2) {
            write(`命中弱點！造成 ${result.damage}`);
        } else {
            write(`命中，造成 ${result.damage}`);
        }
    } else {
        write("未命中");
    }

    applyWeaponCooldown(player);
    reduceCooldown(player);

    updateUI();

    if (checkBattleEnd()) return;

    alliesTurn();
    if (checkBattleEnd()) return;

    enemyTurn();
    reduceCooldown(player);

    updateUI();
}
