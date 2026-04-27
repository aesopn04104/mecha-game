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

write("你坐在聯邦量產機的駕駛艙內，前方街口被煙塵遮住。敵方機體停在斷牆後，炮口偶爾從牆邊探出。");
write("戰鬥開始。");

updateUI();
setActionButtons(false);
}

function write(text) {
log.innerText += text + "\n";
log.scrollTop = log.scrollHeight;
}

function updateUI() {
document.getElementById("playerState").innerText = player.state;
document.getElementById("enemyState").innerText = enemy.state;
document.getElementById("resources").innerText = resources;

document.getElementById("playerHpBar").style.width = `${Math.max(player.hp, 0) / player.maxHp * 100}%`;
document.getElementById("enemyHpBar").style.width = `${Math.max(enemy.hp, 0) / enemy.maxHp * 100}%`;

document.getElementById("playerState").innerText = player.state;
document.getElementById("enemyState").innerText = enemy.state;
}

function setActionButtons(disabled) {
const buttons = document.querySelectorAll("#actions button");
buttons.forEach(button => {
if (button.innerText !== "重新開始") {
button.disabled = disabled;
}
});
}

function checkBattleEnd() {
if (enemy.hp <= 0) {
enemy.hp = 0;
enemy.state = "失去作戰能力";
battleOver = true;
write("敵方機體膝部一沉，整台機體撞進街邊殘牆，胸口位置冒出黑煙。");
let reward = 35;
resources += reward;

write("戰鬥結束：你擊倒了敵方機體。");
write(`回收小隊從敵方殘骸中拆出可用零件，獲得資源 ${reward}。`);
enterBase();
updateUI();
return true;
}

if (player.hp <= 0) {
player.hp = 0;
player.state = "失去作戰能力";
battleOver = true;
write("警報聲刺進耳膜，駕駛艙畫面劇烈閃爍。你的機體向後倒下，視野被煙塵吞沒。");
write("戰鬥結束：玩家機體失去作戰能力。");
setActionButtons(true);
updateUI();
return true;
}

return false;
}

function startTurn() {
player.defending = false;
player.state = "可作戰";
enemy.state = "警戒";
write("");
write(`—— 第 ${turn} 回合 ——`);
}

function endTurn() {
if (checkBattleEnd()) return;
enemyTurn();
if (checkBattleEnd()) return;
turn++;
updateUI();
}

function attack() {
if (battleOver) return;

startTurn();

let bonus = player.aimBonus;
player.aimBonus = 0;

let chance = calcHit(player, enemy, bonus);
write(`你瞄準敵方機體開火。`);

if (isHit(chance)) {
let dmg = dealDamage(14, 24);
enemy.hp -= dmg;
enemy.state = "中彈";
write(`命中。敵方機體受到 ${dmg} 點傷害。`);
} else {
write("炮火擦過敵方機體側面，沒有造成有效命中。");
}

endTurn();
}

function defend() {
if (battleOver) return;

startTurn();

player.defending = true;
player.state = "防禦姿態";
write("你讓機體壓低重心，靠近斷牆，準備承受下一輪攻擊。");

endTurn();
}

function observe() {
if (battleOver) return;

startTurn();

player.aimBonus = 15;
player.state = "觀察中";
write("你沒有急著開火，而是觀察敵方機體探身開火的節奏。下一次攻擊會更容易命中。");

endTurn();
}

function enemyTurn() {
if (battleOver || enemy.hp <= 0) return;

let action = chooseEnemyAction();

if (action === "attack") {
enemyAttack();
}

if (action === "defend") {
enemyDefend();
}

if (action === "observe") {
enemyObserve();
}

if (action === "retreat") {
enemyRetreat();
}
}
function chooseEnemyAction() {
let enemyHpRate = enemy.hp / enemy.maxHp;
let playerHpRate = player.hp / player.maxHp;

if (enemyHpRate <= 0.25) {
if (Math.random() < 0.45) return "retreat";
return "defend";
}

if (player.defending) {
if (Math.random() < 0.55) return "observe";
return "attack";
}

if (playerHpRate <= 0.35) {
if (Math.random() < 0.75) return "attack";
return "observe";
}

if (enemy.lastAction === "observe") {
return "attack";
}

let r = Math.random();

if (r < 0.55) return "attack";
if (r < 0.8) return "observe";
return "defend";
}

function enemyAttack() {
let chance = calcHit(enemy, player);

if (player.defending) {
chance -= 25;
}

if (enemy.lastAction === "observe") {
chance += 15;
}

write("敵方機體從斷牆後探出半個身位，短管炮口微微一抬。");

if (isHit(chance)) {
let dmg = dealDamage(10, 20);

if (player.defending) {
dmg = Math.floor(dmg * 0.6);
}

player.hp -= dmg;
player.state = "中彈";
enemy.state = "攻擊後撤";
write(`敵人命中你，造成 ${dmg} 點傷害。`);
} else {
enemy.state = "攻擊落空";
write("敵方炮火打進你旁邊的牆面，碎石敲在外殼上。");
}

enemy.lastAction = "attack";
}

function enemyDefend() {
enemy.state = "防禦姿態";
enemy.lastAction = "defend";
write("敵方機體縮回斷牆後，只露出半邊肩甲。");
}

function enemyObserve() {
enemy.state = "觀察中";
enemy.lastAction = "observe";
write("敵方機體暫時停火，像是在等你先動。");
}

function enemyRetreat() {
enemy.state = "嘗試撤離";
enemy.lastAction = "retreat";

if (Math.random() < 0.6) {
battleOver = true;
let reward = 10;
resources += reward;

write("敵方機體拖著受損機體撤離戰場。");
write("戰鬥結束：敵方撤退。");
write(`你們只來得及回收少量戰場零件，獲得資源 ${reward}。`);
enterBase();
}
else {
write("敵方機體試圖撤離，但沒有成功。");
}
}
function goToBase() {
battleOver = true;
setActionButtons(true);

write("");
write("你選擇撤回基地。機體拖著受損的步伐離開街口，通訊裡只剩下低沉的雜音。");
write("你回到臨時整備區。這裡沒有真正的安全，只有短暫喘息。");

enterBase();
}
function repairMech() {
if (!battleOver) {
write("現在還在戰鬥中，無法維修。");
return;
}

let repairCost = 20;
let repairAmount = 30;

if (resources < repairCost) {
write("");
write("資源不足，維修班只能簡單檢查外殼，沒辦法替你更換受損部件。");
return;
}

if (player.hp >= player.maxHp) {
write("");
write("你的機體目前狀態良好，暫時不需要維修。");
return;
}

let beforeHp = player.hp;
let beforeResources = resources;

resources -= repairCost;
player.hp = Math.min(player.maxHp, player.hp + repairAmount);
player.state = "已維修";

write("");
write(`維修班替你的機體重新固定受損部件。HP 從 ${beforeHp} 回復到 ${player.hp}。`);
write(`消耗資源 ${repairCost}，剩餘資源 ${resources}。`);

updateUI();
}
if (!battleOver) {
write("現在還在戰鬥中，無法維修。");
return;
}

let before = player.hp;
let repairAmount = 30;

player.hp = Math.min(player.maxHp, player.hp + repairAmount);
player.state = "已維修";

write("");
write(`維修班替你的機體重新固定受損部件。HP 從 ${before} 回復到 ${player.hp}。`);

updateUI();
}
function enterBase() {
setActionButtons(true);

document.getElementById("actions").style.display = "none";
document.getElementById("baseActions").style.display = "grid";

write("");
write("交火結束後，小隊撤回臨時整備區。維修燈一盞盞亮起，受損機體被拖進檢查位。");
}
restartGame();
