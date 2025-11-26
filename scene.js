// app.js - 完整版 (无省略)

// ------------------- 1. 全局状态与配置 -------------------

let state = {
    scene: 'intro',
    str: 0,
    hum: 0,
    dem: 0,
    tp: 10,
    ko_h: 0, // 恋雪
    kz_h: 0, // 庆藏
    f_h: 0,  // 富冈义勇
    k_h: 0,  // 蝴蝶忍
    r_h: 0,  // 炼狱杏寿郎
    akaza_path: null,
    game_year: 1, 
    max_game_year: 5 
};

// 核心数值中文映射
const statNames = {
    str: '战力值',
    hum: '人性值',
    dem: '鬼性值',
    tp: '体力点',
    ko_h: '恋雪好感',
    kz_h: '庆藏好感',
    f_h: '富冈好感',
    k_h: '蝴蝶好感',
    r_h: '炼狱好感',
};

// ------------------- 2. DOM 元素引用 -------------------
// 确保这些ID在index.html中都存在
const storyTextEl = document.getElementById('story-text');
const choicesEl = document.getElementById('choices');
const resultMessageEl = document.getElementById('result-message');
const storyImageEl = document.getElementById('story-image');
const endingScreenEl = document.getElementById('ending-screen');
const endingTextEl = document.getElementById('ending-text');
const gameContainerEl = document.getElementById('game-container');

const currentYearEl = document.getElementById('current-year');
const maxYearEl = document.getElementById('max-year');
const timelineProgressEl = document.getElementById('timeline-progress');


// ------------------- 3. 结局数据库 -------------------
const endings = {
    'A1_martyr': {
        title: "光荣的殉道者",
        text: "在最终决战的血雨腥风中，您以极地柱的身份，舍弃了自己的生命，用【破坏杀·终式】的全部力量，将无惨封印在阳光到来前的最后一刻。\n\n您的灵魂终于得到了安息，与恋雪在彼岸重逢。您以血肉之躯，为人类带来了黎明。虽然躯体消逝，但您的意志成为了鬼杀队永恒的信念，激励着后人。"
    },
    'A2_pioneer': {
        title: "新时代的开拓者",
        text: "您和灶门炭治郎、富冈义勇等幸存者共同努力，彻底消灭了所有的鬼。您活了下来，作为鬼杀队解散后的精神领袖，将您的【破坏杀-呼吸法】改良为强身健体之术，并在大正时代末期广为传播。\n\n您不再是复仇者，而是新时代的武者，带着对恋雪和师傅的爱，继续守护着人世。"
    },
    'A3_failure': {
        title: "功亏一篑的悔恨",
        text: "您的【破坏杀-呼吸法】虽然强大，但您在关键时刻因对力量的迷茫而犹豫。在无限城之战中，您未能阻挡住上弦之壹黑死牟，导致鬼杀队的核心成员阵亡。\n\n无惨最终获得了胜利，鬼的时代降临。您带着无尽的悔恨，看着世界陷入永恒的黑暗。"
    },
    'B1_redemption': {
        title: "救赎的黄昏",
        text: "在与无惨的战斗中，您破碎的记忆瞬间恢复！恋雪和师傅的笑颜，是您最后的牵挂。您用自己的血鬼术和体术，撕碎了无惨的一部分身体，为鬼杀队创造了转机。\n\n最终，您选择在阳光下消亡，让灰烬随风飘散。您未能成为人，但您的行动证明，狛治的心，从未真正死去。"
    },
    'B2_slavery': {
        title: "永恒的奴役",
        text: "您彻底服从了无惨，成为了冷酷无情的上弦之参。鬼杀队最终败亡，世界被黑暗笼罩。\n\n您获得了最强的力量，却永远失去了温暖、情感和记忆。在无尽的永生中，您只是一具执行命令的躯壳，是力量深渊中最可悲的奴隶。您赢得了生存，却输掉了所有。"
    },
};


// ------------------- 4. 辅助功能函数 -------------------

// 动态创建调整阶段场景
function createAdjustmentScene(title, image, baseText, nextSceneId, options) {
    return {
        title: title,
        image: image,
        // 这里使用函数来动态获取TP，防止文本固定
        getText: () => baseText.replace('${state.tp}', `<span class="key-plot-point">${state.tp}</span>`), 
        choices: [
            ...options.map(opt => ({
                text: `${opt.text} (消耗 ${opt.cost} 体力点)`,
                consequence: () => {
                    if (state.tp >= opt.cost) {
                        updateStats({ tp: -opt.cost });
                        opt.effect();
                        // 重新渲染以更新文本和状态
                        renderScene();
                    } else {
                        setResult("⚠️ 体力点不足！请选择其他选项或结束调整。");
                    }
                }
            })),
            {
                text: "➡️ 结束调整阶段，进入下一主线剧情",
                consequence: () => {
                    updateStats({ tp: 10 }); 
                    setResult("您感到精力充沛，体力点回复至 10，准备迎接新的宿命。");
                    gotoScene(nextSceneId, 1);
                }
            }
        ]
    };
}


// ------------------- 5. 场景数据库 -------------------
const scenes = {
    // --- I. 序章 ---
    'intro': {
        text: "您被困在无尽的黑暗中，那是对世界愤怒和绝望的漩涡。您的名字是<span class=\"key-plot-point\">狛治</span>，一个被人唾弃的小偷和恶人。现在，您正被一群愤怒的市民围堵在街角。",
        image: "Placeholder: 愤怒市民围堵狛治",
        choices: [
            {
                text: "A. 拼死抵抗，用拳头打破困境【鬼性路引】",
                consequence: () => {
                    updateStats({ dem: 5, str: 1 });
                    gotoScene('scene_i_2');
                }
            },
            {
                text: "B. 乖乖受罚，接受命运的惩罚【人性路引】",
                consequence: () => {
                    updateStats({ hum: 5 });
                    gotoScene('scene_i_2');
                }
            }
        ]
    },

    'scene_i_2': {
        text: "正当您几乎被打死时，<span class=\"key-plot-point\">庆藏</span>师傅出现，收留了您，将您带回道场，您的体术天赋被发掘。您结识了温柔的<span class=\"key-plot-point\">恋雪</span>。",
        image: "Placeholder: 庆藏师傅收留狛治",
        choices: [
            {
                text: "A. 努力修行，专心照顾庆藏和恋雪 (人性+，恋雪好感+)",
                consequence: () => {
                    updateStats({ hum: 10, str: 5, ko_h: 5 });
                    gotoScene('scene_i_3');
                }
            },
            {
                text: "B. 心存疑虑，偷偷离开道场，被庆藏找回 (鬼性+，战力+)",
                consequence: () => {
                    updateStats({ dem: 5, str: 3 });
                    gotoScene('scene_i_3');
                }
            }
        ]
    },

    'scene_i_3': {
        text: "<span class=\"key-plot-point\">恋雪</span>的病情加重，您急需珍贵的药材续命。您的<span class=\"key-plot-point\">破坏杀</span>体术基础已成雏形。",
        image: "Placeholder: 狛治和恋雪在道场",
        choices: [
            {
                text: "A. 循规蹈矩，努力工作攒钱购买药材 (人性++，恋雪好感++)",
                consequence: () => {
                    updateStats({ hum: 15, ko_h: 10 });
                    gotoScene('i_4_adjustment');
                }
            },
            {
                text: "B. 走捷径，用强大的体术抢夺珍贵药材 (鬼性++，战力++)",
                consequence: () => {
                    updateStats({ dem: 10, str: 5 });
                    gotoScene('i_4_adjustment');
                }
            }
        ]
    },
    
    // --- 调整阶段 I-4 ---
    'i_4_adjustment': createAdjustmentScene(
        "⛩️ 调整阶段：道场的宁静 (大正 1 年)",
        "Placeholder: 狛治在素流道场训练",
        "您现在有 ${state.tp} 点体力点。请利用TP来提升属性或触发支线。",
        'scene_ii_1',
        [
            { text: "集中修行 (3 TP)：战力值 +5 (破坏杀基础)", cost: 3, effect: () => { updateStats({ str: 5 }); } },
            { text: "情感回溯 (2 TP)：人性值 +5 (回忆恋雪的笑容)", cost: 2, effect: () => { updateStats({ hum: 5 }); } },
            {
                text: "社交互动 (3 TP)：触发【庆藏的拳头】趣味小故事",
                cost: 3,
                effect: () => {
                    updateStats({ ko_h: 5 });
                    setResult("庆藏师傅的教导方式总是出人意料地幽默。恋雪看到您开心，也露出了微笑。恋雪好感度小幅提升。");
                }
            },
        ]
    ),

    // --- II. 转折 ---
    'scene_ii_1': {
        text: "⚠️ <span class=\"key-plot-point\">命运的剧变</span>：庆藏师傅和恋雪被人用毒药害死了！愤怒、绝望、狂暴，您的拳头在颤抖。",
        image: "Placeholder: 道场惨案/狛治的悲鸣",
        choices: [
            {
                text: "A. 压抑狂暴，以人类身份复仇，寻求鬼杀队的帮助 【宿命的选择：人性路】",
                consequence: () => {
                    state.akaza_path = 'human';
                    gotoScene('scene_ii_2_human');
                }
            },
            {
                text: "B. 绝望爆发，用力量屠杀仇敌，让血海淹没世界 【宿命的选择：鬼性路】",
                consequence: () => {
                    state.akaza_path = 'demon';
                    updateStats({ dem: 50, hum: -50, str: 20 });
                    gotoScene('scene_ii_2_demon');
                }
            }
        ]
    },

    'scene_ii_2_human': {
        text: "无惨即将杀死您时，<span class=\"key-plot-point\">一位身着鬼杀队服饰的人影</span>赶到，救下了您！您被带到了产屋敷总部。",
        image: "Placeholder: 柱（富冈？）救下狛治",
        choices: [
            {
                text: "A. 寻求鬼杀队庇护，加入他们以体术复仇【体术柱路线】",
                consequence: () => {
                    updateStats({ hum: 50, str: 10 });
                    gotoScene('scene_iii_a1_human', 1);
                }
            },
            {
                text: "B. 不信任任何人，独自离开",
                consequence: () => {
                    showEnding('A3_failure'); 
                }
            }
        ]
    },

    'scene_ii_2_demon': {
        text: "在您屠杀仇敌的血泊中，<span class=\"key-plot-point\">鬼舞辻无惨</span>出现了。他向您伸出了手，承诺永恒的力量。",
        image: "Placeholder: 鬼舞辻无惨的诱惑",
        choices: [
            {
                text: "A. 接受无惨的血，成为鬼【上弦之参：猗窝座】",
                consequence: () => {
                    updateStats({ dem: 100, hum: -state.hum, ko_h: -state.ko_h });
                    setResult("您成为了上弦之参——猗窝座。记忆被封印。");
                    gotoScene('scene_iii_b1_akaza', 1);
                }
            },
            {
                text: "B. 拒绝无惨，试图用自杀来寻求解脱",
                consequence: () => {
                    updateStats({ dem: 80, hum: -state.hum + 10 });
                    setResult("您的反抗毫无意义。无惨强行将血灌入您体内，您仍然成为了鬼，但因强烈的抵抗保留了一丝人性。");
                    gotoScene('scene_iii_b1_akaza', 1);
                }
            }
        ]
    },

    // --- III. 人性路 ---
    'scene_iii_a1_human': {
        title: "🗡️ 大正 2 年：破坏杀-呼吸法的诞生",
        text: "您在鬼杀队总部，开始尝试将素流体术与呼吸法结合，领悟<span class=\"key-plot-point\">破坏杀-呼吸法</span>。与您一同修行的，还有<span class=\"key-plot-point\">富冈义勇</span>和<span class=\"key-plot-point\">蝴蝶忍</span>。",
        image: "Placeholder: 鬼杀队总部/富冈和蝴蝶",
        choices: [
            {
                text: "A. 专注于体术修行，目标晋升柱级 (战力+，富冈好感+)",
                consequence: () => {
                    updateStats({ str: 15, f_h: 5 });
                    gotoScene('iii_a2_adjustment');
                }
            },
            {
                text: "B. 秘密调查无惨与鬼的关联，寻求情报 (人性+，蝴蝶好感+)",
                consequence: () => {
                    updateStats({ hum: 10, k_h: 5 });
                    gotoScene('iii_a2_adjustment');
                }
            }
        ]
    },

    'iii_a2_adjustment': createAdjustmentScene(
        "🧘 调整阶段：柱们的日常 (大正 2 年)",
        "Placeholder: 柱合会议前夕",
        "您现在有 ${state.tp} 点体力点。这是您融入鬼杀队的关键时期。",
        'scene_iii_a3_column',
        [
            { text: "集中修行 (3 TP)：战力值 +5 (破坏杀-呼吸法掌握度提升)", cost: 3, effect: () => { updateStats({ str: 5 }); } },
            { text: "社交互动 (3 TP)：触发【与富冈义勇的默契】", cost: 3, effect: () => { updateStats({ f_h: 8 }); setResult("富冈义勇因您的体术非主流而遭到非议，您选择为他辩护。"); } },
        ]
    ),

    'scene_iii_a3_column': {
        title: "🛡️ 大正 3 年：晋升极地柱",
        text: "您成功晋升为鬼杀队的一员<span class=\"key-plot-point\">柱</span>（代号：极地柱）。您将与<span class=\"key-plot-point\">炼狱杏寿郎</span>一同执行重要任务。",
        image: "Placeholder: 狛治/极地柱制服",
        choices: [
            {
                text: "A. 主动拜访炼狱杏寿郎，切磋武艺 (战力+，炼狱好感+)",
                consequence: () => {
                    updateStats({ str: 10, r_h: 10 });
                    gotoScene('iii_a4_adjustment');
                }
            },
            {
                text: "B. 在柱合会议上与不死川实弥对峙，维护素流名誉 (鬼性微增)",
                consequence: () => {
                    updateStats({ dem: 5, str: 5 });
                    setResult("您用实力证明了自己。获得了尊重，但关系紧张。");
                    gotoScene('iii_a4_adjustment');
                }
            }
        ]
    },

    'iii_a4_adjustment': createAdjustmentScene(
        "🔥 调整阶段：无限列车前夕 (大正 3 年)",
        "Placeholder: 炼狱与极地柱交流",
        "您现在有 ${state.tp} 点体力点。您即将面临无限列车的巨大挑战。",
        'final_stage', // 简化演示，直接跳转至决战前，实际可跳转至列车篇
        [
            { text: "集中修行 (5 TP)：战力值 +10 (领悟破坏杀-呼吸法二之型)", cost: 5, effect: () => { updateStats({ str: 10 }); } },
            { text: "情报收集 (3 TP)：人性值 +5 (查阅无惨的古老卷宗)", cost: 3, effect: () => { updateStats({ hum: 5 }); } }
        ]
    ),

    // --- III. 鬼性路 ---
    'scene_iii_b1_akaza': {
        title: "🩸 大正 2 年：上弦会议",
        text: "您已是上弦之参——<span class=\"key-plot-point\">猗窝座</span>。您第一次进入无限城，见到了上弦之壹<span class=\"key-plot-point\">黑死牟</span>，和上弦之贰<span class=\"key-plot-point\">童磨</span>。",
        image: "Placeholder: 无限城上弦会议",
        choices: [
            {
                text: "A. 主动挑战黑死牟，试图超越他 (鬼性+，战力+)",
                consequence: () => {
                    updateStats({ dem: 10, str: 10 });
                    gotoScene('iii_b2_adjustment');
                }
            },
            {
                text: "B. 漠视童磨，避免冲突，专注执行无惨任务 (鬼性+)",
                consequence: () => {
                    updateStats({ dem: 5 });
                    gotoScene('iii_b2_adjustment');
                }
            }
        ]
    },

    'iii_b2_adjustment': createAdjustmentScene(
        "🌑 调整阶段：捕食与记忆 (大正 2 年)",
        "Placeholder: 猗窝座在夜晚捕食",
        "您现在有 ${state.tp} 点体力点。无惨对您的期望很高。",
        'scene_iii_b3_train',
        [
            { text: "集中修行 (3 TP)：战力值 +5 (强化术式展开)", cost: 3, effect: () => { updateStats({ str: 5 }); } },
            { text: "社交互动 (3 TP)：触发【童磨的邀约】", cost: 3, effect: () => { updateStats({ dem: 5 }); setResult("您勉强敷衍后离开了。您更加厌恶他的虚伪。"); } },
        ]
    ),

    'scene_iii_b3_train': {
        title: "🚂 大正 3 年：无限列车篇 (与炼狱杏寿郎)",
        text: "您在无限列车上遭遇了鬼杀队的<span class=\"key-plot-point\">炎柱 炼狱杏寿郎</span>！这是您恢复记忆的关键一战。",
        image: "Placeholder: 猗窝座与炼狱对峙",
        choices: [
            {
                text: "A. 竭尽全力杀死炼狱，完成无惨任务 (战力++，鬼性++)",
                consequence: () => {
                    updateStats({ str: 20, dem: 15 });
                    setResult("炼狱的死亡让您获得了巨大的力量，但您感到了一丝空虚。");
                    gotoScene('iii_b4_adjustment');
                }
            },
            {
                text: "B. 看到炼狱的拼搏，手下留情，不取性命 (人性++，无惨信任↓)",
                consequence: () => {
                    updateStats({ hum: 20, dem: -10 });
                    setResult("炼狱对信念的坚持让您想起了庆藏师傅，您选择放弃追击。");
                    gotoScene('iii_b4_adjustment');
                }
            }
        ]
    },

    'iii_b4_adjustment': createAdjustmentScene(
        "💔 调整阶段：记忆的碎片 (大正 3 年)",
        "Placeholder: 猗窝座抱着头盔",
        "您现在有 ${state.tp} 点体力点。杀意和记忆在您体内交战。",
        'final_stage',
        [
            { text: "集中捕食 (5 TP)：鬼性值 +10 (力量大幅增长)", cost: 5, effect: () => { updateStats({ dem: 10 }); } },
            { text: "情感回溯 (5 TP)：人性值 +15 (找回恋雪的记忆)", cost: 5, effect: () => { updateStats({ hum: 15 }); } }
        ]
    ),

    // --- 最终阶段 ---
    'final_stage': {
        title: "💥 决战前夕：大正 5 年",
        text: "时间已至大正 5 年，最终决战即将来临。\n\n您的<span class=\"key-plot-point\">战力值</span>（"+state.str+"）、<span class=\"key-plot-point\">人性值</span>（"+state.hum+"）和<span class=\"key-plot-point\">鬼性值</span>（"+state.dem+"）将决定您的最终命运！",
        image: "Placeholder: 无限城最终决战",
        choices: [
            {
                text: "进入最终决战 (结局判定)",
                consequence: () => {
                    if (state.akaza_path === 'human') {
                        if (state.str >= 50 && state.hum >= 40) showEnding('A2_pioneer');
                        else showEnding('A1_martyr');
                    } else if (state.akaza_path === 'demon') {
                        if (state.hum >= 30) showEnding('B1_redemption');
                        else showEnding('B2_slavery');
                    } else {
                        showEnding('A3_failure');
                    }
                }
            }
        ]
    }
};


// ------------------- 6. 核心引擎函数 -------------------

// 渲染数值面板
function renderStats() {
    document.getElementById('str').textContent = state.str;
    document.getElementById('hum').textContent = state.hum;
    document.getElementById('dem').textContent = state.dem;
    document.getElementById('tp').textContent = state.tp;
    document.getElementById('ko-h').textContent = state.ko_h;
    document.getElementById('f-h').textContent = state.f_h;
}

// 更新数值并显示动画
function updateStats(changes) {
    let message = "属性变化：";
    let changed = false;

    for (const key in changes) {
        const oldValue = state[key];
        const changeAmount = changes[key];
        state[key] += changeAmount;
        
        if (isNaN(state[key])) state[key] = oldValue;

        // 处理HTML ID中有连字符的情况 (如 ko_h -> ko-h)
        const elementId = key.replace('_', '-');
        const statElement = document.getElementById(elementId);
        
        if (statElement) {
            statElement.classList.remove('changed-positive', 'changed-negative');
            statElement.classList.add(changeAmount > 0 ? 'changed-positive' : 'changed-negative');
            
            const oldIndicator = statElement.parentElement.querySelector('.change-indicator');
            if (oldIndicator) oldIndicator.remove();

            const indicator = document.createElement('span');
            indicator.className = 'change-indicator';
            indicator.textContent = (changeAmount > 0 ? '+' : '') + changeAmount;
            indicator.style.color = changeAmount > 0 ? '#00ff00' : '#ff3333';
            
            statElement.parentElement.appendChild(indicator);
            
            void statElement.offsetWidth; // 强制回流
            
            setTimeout(() => {
                statElement.classList.remove('changed-positive', 'changed-negative');
                indicator.classList.add('show');
                setTimeout(() => indicator.remove(), 800);
            }, 10);

            message += `${statNames[key] || key}${changeAmount > 0 ? '↑' : '↓'} `;
            changed = true;
        }
    }
    
    renderStats();
    if (changed) {
         setResult(message);
    }
}

function setResult(message) {
    resultMessageEl.innerHTML = `【抉择回响】: <span class="key-plot-point">${message}</span>`;
}

function updateTimeline(increment = 0) {
    state.game_year += increment;
    if (state.game_year > state.max_game_year) state.game_year = state.max_game_year;

    currentYearEl.textContent = `大正 ${state.game_year} 年`;
    maxYearEl.textContent = `大正 ${state.max_game_year} 年`;

    const progressPercent = (state.game_year / state.max_game_year) * 100;
    timelineProgressEl.style.width = `${progressPercent}%`;
}

function gotoScene(sceneId, yearIncrement = 0) {
    state.scene = sceneId;
    updateTimeline(yearIncrement);
    renderScene();
}

function renderScene() {
    const scene = scenes[state.scene];
    
    endingScreenEl.style.display = 'none';
    gameContainerEl.style.display = 'block';

    if (!scene) {
        storyTextEl.innerHTML = "<h2>游戏结束</h2><p>未知场景。感谢游玩！</p>";
        choicesEl.innerHTML = '';
        return;
    }

    // 更新文本中的动态变量
    let displayText = scene.text;
    if (scene.getText) {
        displayText = scene.getText();
    }
    
    // 设置图片
    storyImageEl.alt = scene.image;
    // storyImageEl.src = 'images/' + scene.image + '.jpg'; // 取消注释以启用图片
    
    // 设置文字
    storyTextEl.innerHTML = (scene.title ? `<h3>${scene.title}</h3>` : '') + displayText;

    // 设置选项
    choicesEl.innerHTML = '';
    scene.choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.className = 'choice-button';
        button.textContent = choice.text;
        button.onclick = () => {
            resultMessageEl.textContent = '';
            choice.consequence();
        };
        choicesEl.appendChild(button);
    });
}

function showEnding(endingId) {
    const ending = endings[endingId];
    gameContainerEl.style.display = 'none';
    endingScreenEl.style.display = 'block';
    endingScreenEl.querySelector('h2').textContent = `【宿命的终结】 ${ending.title}`;
    endingTextEl.innerText = ending.text; // 使用innerText以保留换行符
}

// ------------------- 7. 启动游戏 -------------------

document.addEventListener('DOMContentLoaded', () => {
    console.log("Game Initializing...");
    updateTimeline(0); // 这会将年份更新为 1
    renderStats();
    renderScene();
    console.log("Game Started.");
});