const defaultPlayer = {
    name: "四號機（你）",
    maxHp: 100,
    hp: 100,
    hit: 70,
    mobility: 10,
    state: "可作戰",
    aimBonus: 0,
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
        mobility: 8,
        state: "可作戰",
        role: "重裝支援"
    },
    {
        name: "三號機",
        maxHp: 80,
        hp: 80,
        hit: 66,
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
    mobility: 8,
    state: "警戒",
    type: "light",
    lastAction: null
};

const equipmentPool = [
    {
        name: "改良型步槍瞄準器",
        type: "武器配件",
        description: "提升射擊穩定性的瞄準模組。"
    },
    {
        name: "強化關節護板",
        type: "防護裝備",
        description: "可降低關節部位受損風險的外掛護板。"
    },
    {
        name: "輕量化推進噴口",
        type: "推進裝備",
        description: "提高短距離機動反應的推進組件。"
    },
    {
        name: "備用感測器組件",
        type: "感測裝備",
        description: "可用於替換受損雷達與光學輔助模組。"
    }
];

let player = {};
let allies = [];
let enemies = [];
let inventory = [];
let battleOver = false;
let turn = 1;
let resources = 50;
