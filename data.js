const defaultPlayer = {
    name: "四號機（你）",
    maxHp: 100,
    hp: 100,
    hit: 70,
    attack: 24,
    defense: 6,
    evasion: 10,
    mobility: 10,
    state: "可作戰",
    aimBonus: 0,
    varianceBonus: 0,
    defending: false,
    rested: false,
    restBonus: 0,
    weaponCooldown: 0,
    equipped: {
        armor: null,
        weapon: null,
        propulsion: null,
        aim: null
    },
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
        evasion: 8,
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
        evasion: 11,
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
    evasion: 8,
    mobility: 8,
    state: "警戒",
    type: "light",
    lastAction: null
};

const equipmentPool = [
    {
        name: "重甲",
        category: "armor",
        description: "大量增加防禦力，但會降低閃避率和命中率。",
        statRanges: {
            defenseBonus: [6, 10],
            evasionBonus: [-8, -4],
            hitBonus: [-8, -4]
        }
    },
    {
        name: "輕甲",
        category: "armor",
        description: "少量增加防禦力，並少量增加閃避率和命中率。",
        statRanges: {
            defenseBonus: [2, 4],
            evasionBonus: [2, 5],
            hitBonus: [2, 4]
        }
    },
    {
        name: "狙擊槍",
        category: "weapon",
        description: "大量增加攻擊力及命中率，但每2回合只可攻擊一次。",
        cooldownTurns: 1,
        statRanges: {
            attackBonus: [10, 16],
            hitBonus: [10, 16]
        }
    },
    {
        name: "步槍",
        category: "weapon",
        description: "少量增加攻擊力，沒有命中率加成。",
        statRanges: {
            attackBonus: [3, 6]
        }
    },
    {
        name: "大刀",
        category: "weapon",
        description: "大量增加攻擊力，但少量減少命中率，且不可裝備瞄準分類。",
        blocksAim: true,
        statRanges: {
            attackBonus: [12, 18],
            hitBonus: [-6, -3]
        }
    },
    {
        name: "加強推進器",
        category: "propulsion",
        description: "中量增加閃避率，少量增加命中率。",
        statRanges: {
            evasionBonus: [6, 10],
            hitBonus: [2, 4]
        }
    },
    {
        name: "光學瞄準器",
        category: "aim",
        description: "中量增加命中率。大刀不可裝備。",
        statRanges: {
            hitBonus: [6, 10]
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
