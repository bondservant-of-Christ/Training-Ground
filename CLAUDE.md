# Barracks notes
- Classic scripts in src/ share global scope; load order is in index.html. State `S` persists to localStorage "barracks-v1"; migrations are S.v2/S.v3.
- Ranks: 10 ranks x 3 tiers, profLv() 0..29; zone t unlocks if floor(profLv()/3) >= t-1.
- calc(): atk=str*2+gear, def=end+gear, hp=50+vit*10+gear. Combat: dmgTo = max(1, round(raw - def*.5)); enemy hp=a*7, atk=h*.11+d*.5.
- Rewards: XP 7*sets+25*rankups; gold 6*sets+25*rankups. Battle cooldown 300s, HP persists until healed.
- Enemy art: jagged full-body silhouettes (ENM in 10-enemies.js). No cartoon/realistic styles.
- Run/walk travel is honor-system; no GPS verification.
- Bump VERSION in sw.js each release.
