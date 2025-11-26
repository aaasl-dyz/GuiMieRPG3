// core.js - 游戏核心引擎 (更新：增加 HP 属性，并修改 UI 弹窗逻辑)

// 1. 初始化全局游戏对象
window.Game = {
    scenes: {}, // 存储所有场景
    endings: {}, // 存储所有结局
    state: {
        scene: 'intro',
        str: 0, 
        hum: 0, 
        dem: 0, 
        hp: 100, // 新增：健康值 (Health Points)
        tp: 10,
        ko_h: 0, // 恋雪
        kz_h: 0, // 庆藏
        gi_h: 0, // 富冈义勇 (Giyu)
        re_h: 0, // 炼狱杏寿郎 (Rengoku)
        sa_h: 0, // 不死川实弥 (Sanemi)
        gy_h: 0, // 悲鸣屿行冥 (Gyomei)
        akaza_path: null, 
        game_year: 1, 
        max_game_year: 10,
        // 新增：影响最终决战难度的全局变量
        tongue_killed: false, // 童磨是否被重伤/击败
        tongue_alive: true, // 童磨是否存活
        final_difficulty_mod: 0 // 最终难度修正 (-5 表示难度降低 5)
    }
};

// 2. 核心 DOM 引用 (新增 HP 引用)
const ui = {
    storyText: document.getElementById('story-text'),
    choices: document.getElementById('choices'),
    result: document.getElementById('result-message'),
    image: document.getElementById('story-image'),
    endingScreen: document.getElementById('ending-screen'),
    endingText: document.getElementById('ending-text'),
    container: document.getElementById('game-container'),
    year: document.getElementById('current-year'),
    maxYear: document.getElementById('max-year'),
    progress: document.getElementById('timeline-progress'),
    stats: {
        str: document.getElementById('str'),
        hum: document.getElementById('hum'),
        dem: document.getElementById('dem'),
        hp: document.getElementById('hp'), // 新增
        tp: document.getElementById('tp'),
        ko_h: document.getElementById('ko-h'),
        gi_h: document.getElementById('gi-h'),
        re_h: document.getElementById('re-h')
    }
};

// 3. 核心功能函数

// 动效函数：触发屏幕震动
window.Game.triggerShake = function() {
    ui.container.classList.add('shake');
    setTimeout(() => {
        ui.container.classList.remove('shake');
    }, 500); // 震动持续 0.5 秒
};

// 动效函数：触发好感度爱心效果
window.Game.triggerHeartEffect = function(key) {
    const statElement = document.getElementById(key.replace('_', '-'));
    if (!statElement) return;

    // 1. 动态创建粒子容器（如果不存在，并附加到 body）
    let particleContainer = document.getElementById('global-particle-container');
    if (!particleContainer) {
        particleContainer = document.createElement('div');
        particleContainer.id = 'global-particle-container';
        document.body.appendChild(particleContainer);
    }
    
    // 2. 计算 statElement 相对于视口的位置
    const rect = statElement.getBoundingClientRect();
    
    // 3. 在 statElement 位置生成多个粒子
    for (let i = 0; i < 5; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart';
        
        // 粒子容器定位到 statElement 的中心上方
        heart.style.left = `${rect.left + rect.width / 2 + (Math.random() * 20 - 10)}px`;
        heart.style.top = `${rect.top}px`;
        
        particleContainer.appendChild(heart);

        // 动画结束后移除粒子
        heart.addEventListener('animationend', () => {
            heart.remove();
        });
    }
};


// 注册场景的辅助函数 (供 data_*.js 使用)
window.Game.addScene = function(id, sceneData) {
    window.Game.scenes[id] = sceneData;
};

// 注册结局的辅助函数
window.Game.addEnding = function(id, endingData) {
    window.Game.endings[id] = endingData;
};

// 更新数值 (已修改：HP为关键状态，需检查是否归零)
window.Game.updateStats = function(changes) {
    let message = "";
    let changed = false;
    const s = window.Game.state;

    for (const key in changes) {
        if (s.hasOwnProperty(key)) {
            const val = changes[key];
            const oldValue = s[key];
            s[key] += val;
            
            // 检查好感度变化并触发爱心效果
            if (key.endsWith('_h') && val > 0) {
                 window.Game.triggerHeartEffect(key);
            }

            // 特殊处理：HP 不能低于 0
            if (key === 'hp' && s.hp <= 0) {
                s.hp = 0;
                window.Game.gotoScene('death_by_damage'); // 触发死亡场景
            }

            // UI 动画逻辑
            const elId = key.replace('_', '-'); 
            const el = document.getElementById(elId);
            if (el) {
                el.innerText = s[key];
                el.classList.add(val > 0 ? 'changed-positive' : 'changed-negative');
                setTimeout(() => el.classList.remove('changed-positive', 'changed-negative'), 500);
            }
            if (key !== 'tp') message += `${key} ${val > 0 ? '+' : ''}${val}  `;
            changed = true;
        }
    }
    if (changed) window.Game.setResult(message);
    window.Game.renderStats(); // 强制刷新
};

window.Game.setResult = function(msg) {
    ui.result.innerHTML = `【回响】: <span class="key-plot-point">${msg}</span>`;
};

window.Game.renderStats = function() {
    for (let key in ui.stats) {
        if(ui.stats[key]) ui.stats[key].textContent = window.Game.state[key];
    }
};

window.Game.updateTimeline = function(increment = 0) {
    const s = window.Game.state;
    s.game_year += increment;
    if (s.game_year > s.max_game_year) s.game_year = s.max_game_year;
    
    ui.year.innerText = `大正 ${s.game_year} 年`;
    ui.maxYear.innerText = `大正 ${s.max_game_year} 年`;
    ui.progress.style.width = `${(s.game_year / s.max_game_year) * 100}%`;
};

window.Game.gotoScene = function(id, yearInc = 0) {
    window.Game.state.scene = id;
    window.Game.updateTimeline(yearInc);
    window.Game.renderScene();
};

window.Game.renderScene = function() {
    const id = window.Game.state.scene;
    const scene = window.Game.scenes[id];
    
    ui.endingScreen.style.display = 'none';
    ui.container.style.display = 'block';

    if (!scene) {
        // 新增：通用死亡场景处理
        if (id === 'death_by_damage') {
             window.Game.showEnding('h_died_early');
             return;
        }
        ui.storyText.innerHTML = `<h2>错误</h2><p>找不到场景: ${id}</p>`;
        return;
    }

    // 图片渐进效果：移除旧类，添加新类
    ui.image.classList.remove('image-transition-in');
    setTimeout(() => {
        ui.image.src = scene.image || "";
        ui.image.alt = scene.image || "场景图片";
        ui.image.classList.add('image-transition-in'); 
    }, 10); 

    // 文本处理
    let text = typeof scene.text === 'function' ? scene.text(window.Game.state) : scene.text;
    ui.storyText.innerHTML = (scene.title ? `<h3>${scene.title}</h3>` : '') + text;

    // 选项处理
    ui.choices.innerHTML = '';
    scene.choices.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'choice-button';
        btn.innerHTML = opt.text;
        btn.onclick = () => {
            ui.result.textContent = '';
            opt.action();
        };
        ui.choices.appendChild(btn);
    });
};

window.Game.showEnding = function(id) {
    const end = window.Game.endings[id];
    ui.container.style.display = 'none';
    ui.endingScreen.style.display = 'block';
    ui.endingScreen.querySelector('h2').innerText = end.title;
    ui.endingText.innerText = end.text;
};

// 辅助：生成通用调整阶段 (休息/修行)
window.Game.createAdjustment = function(title, desc, nextScene, yearInc, options) {
    return {
        title: title,
        text: (s) => `${desc}<br><br>当前体力: <span class="key-plot-point">${s.tp}</span>`,
        choices: [
            ...options.map(o => ({
                text: `${o.label} (消耗 ${o.cost} TP)`,
                action: () => {
                    if (window.Game.state.tp >= o.cost) {
                        window.Game.updateStats({ tp: -o.cost });
                        o.effect();
                        window.Game.renderScene(); 
                    } else {
                        window.Game.setResult("体力不足！");
                    }
                }
            })),
            {
                text: "➡️ 结束本年行程，进入下一阶段",
                action: () => {
                    window.Game.updateStats({ tp: 10, hp: 100 - window.Game.state.hp }); // 每年恢复体力，HP恢复满
                    window.Game.setResult("新的一年开始了，体力恢复，伤势痊愈。");
                    window.Game.gotoScene(nextScene, yearInc);
                }
            }
        ]
    };
};