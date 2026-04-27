const defaultPlayer = {
maxHp: 100,
hp: 100,
hit: 70,
mobility: 10,
state: "可作戰",
aimBonus: 0,
defending: false
};

const defaultEnemy = {
maxHp: 80,
hp: 80,
hit: 60,
mobility: 8,
state: "警戒",
type: "light",
lastAction: null
};

let player = {};
let enemy = {};
let battleOver = false;
let turn = 1;
