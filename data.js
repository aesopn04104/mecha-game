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

let player = {};
let allies = [];
let enemies = [];
let battleOver = false;
let turn = 1;
let resources = 50;
