function calcHit(attacker, target, bonus = 0) {
let chance = attacker.hit + bonus - target.mobility * 2;
return Math.max(10, Math.min(90, chance));
}

function dealDamage(min = 10, max = 20) {
return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isHit(chance) {
return Math.random() * 100 < chance;
}
