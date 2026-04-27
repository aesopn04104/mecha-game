const defaultPlayer = {
    name: "四號機（你）",
    maxHp: 100,
    hp: 100,
    hit: 70,
    attack: 24,
    defense: 6,
    mobility: 10,
    state: "可作戰",
    aimBonus: 0,
    varianceBonus: 0,
    defending: false,
    rested: false,
    restBonus: 0,
    isPlayer: true
};

const allyTemplates = [
    {
        name: "二號機",
        maxHp: 95,
        hp: 95,
        hit: 62,
        attack: 22,
        defense: 8,
        mobility: 8,
        state: "可作戰",
        role: "重裝支援"
    },
    {
        name: "三號機",
        maxHp: 80,
        hp: 80,
        hit: 66,
        attack: 20,
        defense: 5,
        mobility: 11,
        state: "可作戰",
        role: "中距離步槍"
    }
];

const defaultEnemy = {
    name: "帝國輕型機",
    maxHp: 80,
    hp: 80,
    hit: 60,
    attack: 20,
    defense: 5,
    mobility: 8,
    state: "警戒",
    type: "light",
    lastAction: null
};

const equipmentPool = [
    {
        name: "改良型步槍瞄準器",
        type: "武器配件",
        description: "大量增加命中率，少量增加攻擊力。",
        statRanges: {
            hitBonus: [8, 12],
            damageBonus: [1, 3]
        }
    },
    {
        name: "強化關節護板",
        type: "防護裝備",
        description: "增加機體耐久與防禦。",
        statRanges: {
            maxHpBonus: [10, 25],
            defenseBonus: [1, 4]
        }
    },
    {
        name: "輕量化推進噴口",
        type: "推進裝備",
        description: "增加機動力，少量增加命中率。",
        statRanges: {
            mobilityBonus: [2, 5],
            hitBonus: [2, 5]
        }
    },
    {
        name: "備用感測器組件",
        type: "感測裝備",
        description: "中量增加命中率。",
        statRanges: {
            hitBonus: [5, 9]
        }
    }
];

let player = {};
let allies = [];
let enemies = [];
let inventory = [];
let battleOver = false;
let turn = 1;
let resources = 50;
