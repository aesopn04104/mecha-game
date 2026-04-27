const log = document.getElementById("log");

const statNameMap = {
    attackBonus: "攻擊",
    defenseBonus: "防禦",
    hitBonus: "命中",
    evasionBonus: "閃避",
    maxHpBonus: "耐久"
};

const slotNameMap = {
    armor: "裝甲",
    weapon: "武器",
    propulsion: "推進",
    aim: "瞄準"
};

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

function setupBaseStats(unit) {
    unit.baseAttack = unit.attack;
    unit.baseDefense = unit.defense;
    unit.baseHit = unit.hit;
    unit.baseEvasion = unit.evasion || 0;
}

function applyEquipmentStats(unit) {
    unit.attack = unit.baseAttack || unit.attack;
    unit.defense = unit.baseDefense || unit.defense;
    unit.hit = unit.baseHit || unit.hit;
    unit.evasion = unit.baseEvasion || unit.evasion || 0;

    if (!unit.equipped) return;

    Object.values(unit.equipped).forEach(item => {
        if (!item || !item.stats) return;
        unit.attack += item.stats.attackBonus || 0;
        unit.defense += item.stats.defenseBonus || 0;
        unit.hit += item.stats.hitBonus || 0;
        unit.evasion += item.stats.evasionBonus || 0;
    });
}

function formatStatValue(key, value) {
    let name = statNameMap[key] || key;
    let sign = value > 0 ? "+" : "";
    return `${name}${sign}${value}`;
}

function formatItemStats(item) {
    return Object.entries(item.stats || {})
        .map(([k, v]) => formatStatValue(k, v))
        .join("，");
}

function calcDamage(attacker, target) {
    let baseAttack = attacker.attack || 0;
    let defense = target.defense || 0;
    let varianceRange = 0.3 + (attacker.varianceBonus || 0);
    let variance = (Math.random() * 2 - 1) * varianceRange;
    let finalAttack = Math.floor(baseAttack * (1 + variance));
    let damage = Math.max(0, finalAttack - defense);

    return { damage, variance, finalAttack };
}

// ⭐ 修改點：最低命中率30%
function calcFinalHit(attacker, target) {
    let raw = calcHit(attacker, target) - (target.evasion || 0);
    return Math.max(30, raw);
}

// 以下不變
