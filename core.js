// core.js - V12.1 修复版
// 修复了 renderScene 缺少 'bridge' 逻辑
// 修复了 createBridgePhase 中 'G' vs 'Game' 的变量引用错误

/**
 * @typedef {Object} GameState
 * @property {string} scene - 当前场景ID
 * @property {number} game_year - 当前年份
 * @property {number} max_game_year - 最大年份 (12)
 * @property {number} str - 战力 (每10点解锁一型)
 * @property {number} hp - 当前生命 (100)
 * @property {number} hum - 人性 (影响回血和选项)
 * @property {number} dem - 鬼性 (影响回血和选项)
 * @property {number} ap - 行动点 (仅在桥接阶段使用)
 * @property {number} gi_h - 义勇好感
 * @property {number} sa_h - 锖兔好感
 * @property {number} re_h - 炼狱好感
 * @property {number} gy_h - 岩柱好感
 * @property {number} k_h - 蝴蝶忍好感
 * @property {number} uz_h - 宇髓好感
 * @property {number} sn_h - 实弥好感 (V11新增, 原sa_h是锖兔)
 * @property {string | null} akaza_path - 'human' or 'demon'
 * @property {string | null} trait - 'guardian', 'avenger', 'void', 'destroyer', 'defiant_demon'
 * @property {string} weapon - 'none', 'short_sword', 'gauntlets'
 * @property {boolean} sabito_saved
 * @property {boolean} rengoku_saved
 * @property {boolean} tongue_killed
 * @property {boolean} morale_boost
 * @property {string | null} player_target - 'UM1', 'UM2', 'UM3'
 * @property {number} final_difficulty_mod
 * @property {Object} deployment - { um1: null, um2: null, um3: null }
 */

/** @type {GameState} */
const initialGameState = {
    scene: 'intro',
    game_year: 1,
    max_game_year: 12,
    str: 0,
    hp: 100,
    hum: 0,
    dem: 0,
    ap: 0,
    gi_h: 0,
    sa_h: 0,
    re_h: 0,
    gy_h: 0,
    k_h: 0,
    uz_h: 0,
    sn_h: 0, // 不死川实弥
    akaza_path: null,
    trait: null,
    weapon: 'none',
    sabito_saved: false,
    rengoku_saved: false,
    tongue_killed: false,
    morale_boost: false,
    player_target: null,
    final_difficulty_mod: 0,
    deployment: { um1: null, um2: null, um3: null }
};

// 呼吸法等级映射
const BREATH_NAMES = {
    0: "未入门",
    10: "壹之型·乱式",
    20: "贰之型·空式",
    30: "叁之型·碎式",
    40: "肆之型·芯式",
    50: "伍之型·脚式",
    60: "陆之型·鬼芯·迫击",
    70: "柒之型·流闪群光",
    80: "捌之型·灭式",
    90: "玖之型·顶天",
    100: "拾之型·终式",
    110: "拾壹之型·罗针",
    120: "拾贰之型·万钧破",
    130: "拾叁之型·虚空无式",
    140: "拾肆之型·狛治·烟火"
};

// 全局游戏对象
window.Game = {
    scenes: {},
    endings: {},
    /** @type {GameState} */
    state: { ...initialGameState },
    ui: {}, // UI元素引用
    breathNames: BREATH_NAMES
};

// --- 1. UI 元素引用 ---
Game.ui = {
    container: document.getElementById('game-container'),
    storyText: document.getElementById('story-text'),
    choices: document.getElementById('choices'),
    result: document.getElementById('result-message'),
    image: document.getElementById('story-image'),
    endingScreen: document.getElementById('ending-screen'),
    endingTitle: document.getElementById('ending-title'),
    endingText: document.getElementById('ending-text'),
    
    year: document.getElementById('timeline-text'),
    progress: document.getElementById('timeline-progress'),
    
    hpBar: document.getElementById('hp-bar-fill'),
    hpStatus: document.getElementById('hp-status-effect'),
    
    stats: {
        str: document.getElementById('str'),
        hum: document.getElementById('hum'),
        dem: document.getElementById('dem'),
        hp: document.getElementById('hp'),
        ap: document.getElementById('ap'),
        apCard: document.querySelector('.stat-card.ap'),
        breathLevel: document.getElementById('breath-level'),
        gi_h: document.getElementById('gi-h'),
        sa_h: document.getElementById('sa-h'),
        re_h: document.getElementById('re-h'),
        sn_h: document.getElementById('sn-h'),
        gy_h: document.getElementById('gy-h'),
        k_h: document.getElementById('k-h'),
        uz_h: document.getElementById('uz-h'),
    }
};

// --- 2. 核心工具函数 ---

Game.addScene = (id, data) => Game.scenes[id] = data;
Game.addEnding = (id, data) => Game.endings[id] = data;

/**
 * 设置结果提示
 * @param {string} msg - 显示的消息
 * @param {'normal' | 'good' | 'bad'} type - 消息类型
 */
Game.setResult = function(msg, type = 'normal') {
    const el = Game.ui.result;
    el.innerText = msg;
    el.className = 'show';
    
    if (type === 'good') {
        el.style.color = '#4dff88';
        el.style.borderColor = '#4dff88';
    } else if (type === 'bad') {
        el.style.color = '#ff4d4d';
        el.style.borderColor = '#ff4d4d';
    } else {
        el.style.color = 'var(--accent-gold)';
        el.style.borderColor = 'var(--accent-gold)';
    }

    setTimeout(() => el.className = 'hidden', 3000);
};

// 剧烈震动
Game.triggerShake = function() {
    Game.ui.container.classList.remove('shake-violent');
    void Game.ui.container.offsetWidth; // 强制回流
    Game.ui.container.classList.add('shake-violent');
};

// 爱心特效
Game.triggerHeartEffect = function() {
    const container = document.getElementById('global-particle-container');
    for (let i = 0; i < 20; i++) {
        const heart = document.createElement('div');
        heart.innerText = ['❤️', '💖', '💕'][Math.floor(Math.random() * 3)];
        heart.className = 'heart-particle';
        heart.style.left = (Math.random() * 100) + 'vw';
        heart.style.top = (Math.random() * 50 + 50) + 'vh';
        heart.style.setProperty('--tx', (Math.random() * 400 - 200) + 'px');
        heart.style.setProperty('--ty', -(Math.random() * 300 + 200) + 'px');
        heart.style.setProperty('--r', (Math.random() * 360) + 'deg');
        container.appendChild(heart);
        setTimeout(() => heart.remove(), 1500);
    }
};

// --- 3. 状态与数值系统 (V11核心) ---

/**
 * 检查HP状态并返回战力惩罚
 * @returns {number} 战力惩罚值
 */
Game.checkHpStatus = function() {
    const s = Game.state;
    const ui = Game.ui.hpStatus;
    let penalty = 0;

    if (s.hp <= 0) {
        Game.showEnding('h_bad_dead');
        return 999;
    } 
    
    if (s.hp < 20) {
        ui.className = 'injury';
        ui.innerText = '重伤';
        penalty = 30;
    } else if (s.hp < 50) {
        ui.className = 'fatigue';
        ui.innerText = '疲劳';
        penalty = 10;
    } else {
        ui.className = 'hidden';
        ui.innerText = '';
    }
    return penalty;
};

/**
 * 渲染所有UI面板
 */
Game.renderStats = function() {
    const s = Game.state;
    const statsUI = Game.ui.stats;

    // 渲染主属性
    statsUI.str.innerText = s.str;
    statsUI.hum.innerText = s.hum;
    statsUI.dem.innerText = s.dem;
    statsUI.hp.innerText = s.hp;
    statsUI.ap.innerText = s.ap;

    // 渲染好感度
    statsUI.gi_h.innerText = s.gi_h;
    statsUI.sa_h.innerText = s.sa_h;
    statsUI.re_h.innerText = s.re_h;
    statsUI.sn_h.innerText = s.sn_h;
    statsUI.gy_h.innerText = s.gy_h;
    statsUI.k_h.innerText = s.k_h;
    statsUI.uz_h.innerText = s.uz_h;

    // 渲染HP条和状态
    Game.ui.hpBar.style.width = s.hp + '%';
    Game.ui.hpBar.style.backgroundColor = s.hp < 30 ? '#f00' : (s.hp < 50 ? '#b8860b' : '#0f0');
    Game.checkHpStatus();

    // 渲染呼吸法
    let currentBreath = "未入门";
    for (const level in BREATH_NAMES) {
        if (s.str >= parseInt(level)) {
            currentBreath = BREATH_NAMES[level];
        }
    }
    statsUI.breathLevel.innerText = currentBreath;

    // 渲染时间轴
    Game.ui.year.innerText = `大正 ${s.game_year} 年`;
    const progress = (s.game_year / s.max_game_year) * 100;
    Game.ui.progress.style.width = `${progress}%`;
    
    // AP显示
    statsUI.apCard.className = s.ap > 0 ? 'stat-card ap' : 'stat-card ap hidden';
};

/**
 * 更新状态 (V11版)
 * @param {Partial<GameState>} changes - 状态变更对象
 */
Game.updateStats = function(changes) {
    const s = Game.state;
    let msgParts = [];
    let hasHeart = false;
    let strGained = 0;
    let humGained = 0;

    for (let key in changes) {
        if (!s.hasOwnProperty(key)) continue;

        let value = changes[key];

        // 1. 应用特质 (Traits)
        if (key === 'str' && s.trait === 'avenger') value = Math.round(value * 1.2);
        if (key === 'hum') {
            if (s.trait === 'guardian') value = Math.round(value * 1.2);
            if (s.trait === 'avenger') value = Math.round(value * 0.8);
        }

        // 2. 累加/替换数值
        if (typeof s[key] === 'number' && typeof value === 'number') {
            s[key] += value;
        } else {
            s[key] = value; // 替换 (用于 trait, weapon, scene 等)
        }

        // 3. 处理边界和特殊逻辑
        if (key === 'hp') {
            if (s.hp > 100) s[key] = 100;
            if (s.hp <= 0) {
                s[key] = 0;
                // 延迟触发死亡,给动画时间
                setTimeout(() => Game.showEnding('h_bad_dead'), 500); 
            }
        }
        
        if (key === 'str' && typeof value === 'number') strGained = value;
        if (key === 'hum' && typeof value === 'number') humGained = value;

        // 4. 构建提示信息 (只为数值变化构建)
        if (typeof value === 'number' && value !== 0) {
            if (key.endsWith('_h')) {
                if (value > 0) hasHeart = true;
                const name = Game.ui.stats[key]?.parentElement?.title || key;
                msgParts.push(`${name}好感 ${value > 0 ? '+' : ''}${value}`);
            } else if (key === 'str') {
                 msgParts.push(`战力 ${value > 0 ? '+' : ''}${value}`);
            } else if (key === 'hum') {
                 msgParts.push(`人性 ${value > 0 ? '+' : ''}${value}`);
            } else if (key === 'dem') {
                 msgParts.push(`鬼性 ${value > 0 ? '+' : ''}${value}`);
            } else if (key === 'hp') {
                 msgParts.push(`HP ${value > 0 ? '+' : ''}${value}`);
            }
        }
    }

    // 5. 检查呼吸法升级
    let oldBreath = "未入门";
    for (const l in BREATH_NAMES) if ((s.str - strGained) >= parseInt(l)) oldBreath = BREATH_NAMES[l];
    let newBreath = "未入门";
    for (const l in BREATH_NAMES) if (s.str >= parseInt(l)) newBreath = BREATH_NAMES[l];

    if (newBreath !== oldBreath) {
        Game.setResult(`领悟了【${newBreath}】！`, 'good');
    } else if (msgParts.length > 0) {
        Game.setResult(msgParts.join(', '));
    }
    
    if (hasHeart) Game.triggerHeartEffect();

    // 6. 统一渲染
    Game.renderStats();
};

/**
 * 核心战斗判定 (V11版)
 * @param {number} requiredStr - 判定所需的STR值
 * @returns {boolean}
 */
Game.checkSTR = function(requiredStr) {
    const s = Game.state;
    // 1. 获取HP惩罚
    const penalty = Game.checkHpStatus();
    // 2. 获取特质加成
    let bonus = 0;
    if (s.akaza_path === 'demon' && s.trait === 'destroyer') bonus = 10;
    
    const finalSTR = s.str - penalty;
    const checkValue = requiredStr - bonus;
    
    return finalSTR >= checkValue;
};

/**
 * 核心人性判定
 * @param {number} requiredHum
 * @returns {boolean}
*/
Game.checkHUM = (requiredHum) => Game.state.hum >= requiredHum;

/**
 * 核心好感度判定
 * @param {string} charKey - (e.g., 'gi_h')
 * @param {number} requiredLevel
 * @returns {boolean}
 */
Game.checkGoodwill = (charKey, requiredLevel) => Game.state[charKey] >= requiredLevel;

// --- 4. 场景与导航 (V11核心) ---

/**
 * 跳转场景
 * @param {string} id - 场景ID
 * @param {number} [yearInc=0] - 增加的年份
 */
Game.gotoScene = function(id, yearInc = 0) {
    if (Game.state.hp <= 0) return; // 防止死亡后跳转

    Game.state.scene = id;
    const sceneData = Game.scenes[id];
    
    // V11.1: 仅在进入桥接阶段时增加年份并重置AP
    if (sceneData && sceneData.type === 'bridge') {
        Game.state.game_year += yearInc; // 只有在进入桥接时才跳年份
        Game.state.ap = 2; // 赋予2点AP
    }
    
    if (Game.state.game_year > Game.state.max_game_year) {
        Game.state.game_year = Game.state.max_game_year;
    }
    Game.renderScene();
};

/**
 * 渲染场景 (V12.1 修复版)
 */
Game.renderScene = function() {
    // ########## BUG 修复 ##########
    // 确保 's' 和 'scene' 在顶部定义
    const s = Game.state;
    const scene = Game.scenes[s.scene];
    // #############################

    if (!scene) {
        console.error(`场景丢失: ${s.scene}`);
        return;
    }
    
    // ########## BUG 修复 ##########
    // 缺少对 'bridge' 类型的检查
    if (scene.type === 'bridge') {
        if (s.ap <= 0) {
            // AP耗尽，自动跳转到桥接的下一场景
            Game.setResult("行动点(AP)耗尽，进入下一年...", 'normal');
            setTimeout(() => Game.gotoScene(scene.nextScene, 1), 1000); // 延迟1秒并增加1年
            return;
        }
        // AP未耗尽，调用专用的桥接渲染器
        Game.renderBridgeScene(scene);
        return;
    }
    // #############################

    // --- 以下是 'event' 类型的场景渲染 ---

    Game.ui.container.style.display = 'block';
    Game.ui.endingScreen.className = 'hidden';

    // 1. 图片
    const imgName = scene.image || "default.jpg"; 
    Game.ui.image.style.display = 'block'; 
    Game.ui.image.src = `images/${imgName}`; // 假设有 images 文件夹

    // 2. 文本
    let txt = typeof scene.text === 'function' ? scene.text(s) : scene.text;
    Game.ui.storyText.innerHTML = `<h3>${scene.title || ''} (大正 ${s.game_year} 年)</h3>${txt}`;

    // 3. 渲染选项 (V11版, 带判定)
    Game.ui.choices.innerHTML = '';
    if (scene.choices) {
        // V12.1: 修正 - choices 可能是一个函数 (用于排兵布阵)
        const choices = typeof scene.choices === 'function' ? scene.choices(s) : scene.choices;
        
        choices.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'choice-button';
            
            let disabled = false;
            let reqText = "";

            // 检查判定 (V12.1: 使用 opt.check 函数)
            if (opt.check) {
                const check = opt.check(s, Game);
                if (!check.passed) {
                    disabled = true;
                    reqText = check.reqText || "???";
                } else if (check.reqText) {
                    // 即使通过，也显示条件
                    reqText = check.reqText;
                }
            }
            
            // 检查隐藏条件 (V12.1: 使用 opt.hideIf 函数)
            if (opt.hideIf && opt.hideIf(s)) {
                return; // 跳过此选项的渲染
            }
            
            // V12.1: 动态文本
            let btnText = typeof opt.text === 'function' ? opt.text(s) : opt.text;
            btn.innerHTML = `${btnText} ${reqText ? `<span class="requirement">(${reqText})</span>` : ''}`;
            
            if (disabled) {
                btn.classList.add('disabled');
            } else {
                btn.onclick = () => {
                    if (opt.action) opt.action(s, Game); // 传递 s 和 Game
                };
            }
            
            Game.ui.choices.appendChild(btn);
        });
    }

    // 4. 渲染所有状态
    Game.renderStats();
};

// ########## BUG 修复 ##########
// 添加 V11.1 缺失的 renderBridgeScene 函数
/**
 * 渲染桥接阶段 (V12.1 新增)
 * @param {object} scene - 桥接场景的数据
 */
Game.renderBridgeScene = function(scene) {
    const s = Game.state;
    const ui = Game.ui;

    ui.container.style.display = 'block';
    ui.endingScreen.className = 'hidden';
    
    // 1. 文本
    let baseText = typeof scene.text === 'function' ? scene.text(s) : scene.text;
    baseText += `<br><br>你还剩下 <span class="key-plot-point">${s.ap}</span> 个行动点(AP)。`;
    ui.storyText.innerHTML = `<h3>${scene.title || ''} (大正 ${s.game_year}-${s.game_year+1} 年)</h3>${baseText}`;

    // 2. 选项 (V12.1: 调用 V12 的 'choices' 函数)
    ui.choices.innerHTML = '';
    
    // 调用 createBridgePhase 里的 'choices' 函数
    // 它会返回一个已过滤、已映射的按钮对象数组
    const choiceObjects = scene.choices(); 

    choiceObjects.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'choice-button bridge-choice';
        
        // 'text' 属性已经包含了 AP cost (由 createBridgePhase 生成)
        btn.innerHTML = opt.text; 

        // 'action' 属性是 createBridgePhase 生成的 wrapper
        // 它包含了 AP 消耗、状态标记 和 G.renderScene() 的调用
        btn.onclick = opt.action; 

        ui.choices.appendChild(btn);
    });

    // 3. 渲染状态
    Game.renderStats();
};
// ########## 修复结束 ##########


/**
 * 显示结局
 * @param {string} id - 结局ID
 */
Game.showEnding = function(id) {
    const end = Game.endings[id];
    if (!end) {
        console.error(`结局丢失: ${id}`);
        return;
    }
    Game.ui.container.style.display = 'none';
    Game.ui.endingScreen.className = '';
    Game.ui.endingTitle.innerText = `【${end.title}】`;
    Game.ui.endingText.innerText = end.text;
};


/**
 * 创建桥接阶段 (V12.1 修复版)
 * @param {string} title - 阶段标题
 * @param {string} desc - 阶段描述
 * @param {string} nextScene - AP耗尽后跳转的场景
 * @param {Array<Object>} options - 桥接选项
 */
Game.createBridgePhase = function(title, desc, nextScene, options) {
    // ########## BUG 修复 ##########
    // 'G' 必须替换为 'Game'
    const G = window.Game;
    // #############################

    return {
        type: 'bridge', // V12.1: 明确类型
        title: title,
        image: "adjustment.jpg", // 通用图片
        text: (s) => `${desc}`, // V12.1: 基础文本，AP在 renderBridgeScene 中添加
        nextScene: nextScene, // V12.1: AP耗尽后跳转
        
        // 动态生成选项
        choices: function() {
            // ########## BUG 修复 ##########
            // 'G' 必须替换为 'Game'
            if (Game.state.ap <= 0) {
                // AP 耗尽，(renderScene 将会处理跳转)
                return [];
            }

            // 过滤掉不满足条件的选项
            return options
                .filter(opt => {
                    // 检查是否已完成 (oneTime)
                    if (opt.oneTime && Game.state[opt.oneTimeFlag] === true) {
                        return false;
                    }
                    // 检查前置条件
                    if (opt.prereq && !opt.prereq(Game.state, Game)) {
                        return false;
                    }
                    return true;
                })
                .map(opt => {
                    let text = opt.text;
                    const cost = opt.cost || 1; // 默认消耗1 AP
                    if(cost) text += ` <span style="font-size:0.8em;color:#888">(消耗 ${cost} AP)</span>`;
                    
                    return {
                        text: text,
                        action: () => {
                             if (Game.state.ap >= cost) {
// ⬇️ ⬇️ ⬇️ 补全的代码从这里开始 ⬇️ ⬇️ ⬇️
                                Game.state.ap -= cost;
                                
                                // 标记一次性事件
                                if (opt.oneTime && opt.oneTimeFlag) {
                                    Game.state[opt.oneTimeFlag] = true;
                                }
                                
                                // 执行效果
                                if (opt.action) opt.action(); 
                                
                                // 重新渲染当前场景
                                // (renderScene 会检查 AP <= 0 并自动跳转)
                                Game.renderScene(); 
                            }
                        }
                    };
                });
        }
    };
}; // End of createBridgePhase

// --- 5. 游戏启动 ---
document.addEventListener('DOMContentLoaded', () => {
    // 检查UI元素是否都已加载
    let allUILoaded = true;
    for (const key in Game.ui) {
        if (!Game.ui[key]) {
            console.error(`UI 元素 "${key}" (ID: ${key}) 未在 HTML 中找到!`);
            allUILoaded = false;
        } else if (key === 'stats') {
            for (const statKey in Game.ui.stats) {
                if (!Game.ui.stats[statKey]) {
                    console.error(`Stats UI 元素 "${statKey}" (ID: ${statKey}) 未在 HTML 中找到!`);
                    allUILoaded = false;
                }
            }
        }
    }
    
    if (!allUILoaded) {
        document.body.innerHTML = `<div style="color: red; background: white; padding: 20px; font-size: 1.2em; border: 2px solid red;"><strong>游戏初始化失败:</strong><br>一个或多个 UI 元素的 ID (e.g., 'ap', 'sn-h') 在 'index.html' 中缺失或拼写错误。<br>请检查 'core.js' 中的 'Game.ui' 对象并核对你的 HTML 文件。</div>`;
        return;
    }

    console.log("RPG V12 Initializing...");
    // 初始化界面 (V12: renderStats 会自动读取 Game.state)
    Game.renderStats();
    // 进入第一个场景
    Game.gotoScene('intro');
    console.log("Game Started.");
});