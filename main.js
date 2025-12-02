// main.js - V11 游戏入口与结局配置

(function() {
    const G = window.Game;

    // --- V11 游戏状态定义 ---
    // (从 core.js 移到这里，以便于集中管理)
    G.state = {
        // 核心数值
        scene: 'intro',
        str: 0,     // 战力 (10 = 1型)
        hum: 0,     // 人性 (影响回血, 解锁选项)
        dem: 0,     // 鬼性 (鬼线回血)
        hp: 100,    // 当前生命
        maxHp: 100, // 最大生命
        ap: 0,      // 行动点 (用于桥接阶段)
        
        // 游戏进程
        game_year: 1,
        max_game_year: 12, // V11 缩短至 12 年
        akaza_path: null, // 'human' or 'demon'
        
        // 状态标记 (V11)
        trait: null,        // 'guardian', 'avenger', 'void', 'destroyer', 'defiant_demon'
        weapon: 'none',     // 'none', 'short_sword', 'gauntlets'
        morale_boost: false, // 最终战·士气
        tongue_killed: false, // 是否击杀童磨 (鬼线)
        memory_lost: false,  // 是否丢失记忆 (鬼线)
        
        // 关键IF线
        sabito_saved: false,    // 锖兔是否存活
        giyuu_trauma: true,     // 义勇是否有创伤
        rengoku_saved: false,   // 炼狱是否存活
        
        // 最终战
        player_target: null, // 'UM1', 'UM2', 'UM3'
        final_difficulty_mod: 0, // 最终战难度修正
        
        // 好感度
        gi_h: 0,  // 义勇
        sa_h: 0,  // 锖兔 / 实弥 (V11中，sa_h复用)
        re_h: 0,  // 炼狱
        k_h: 0,   // 蝴蝶忍
        gy_h: 0,  // 岩柱
        uz_h: 0,  // 宇髓
        
        // 鬼线好感度 (暂未使用，但可扩展)
        kkb_h: 0, // 黑死牟
        dom_h: 0  // 童磨
    };

    // --- V11 结局注册 ---

    // --- 通用结局 ---
    G.addEnding('h_bad_dead', {
        title: "【力竭而死】",
        text: "你的伤势过重，意识逐渐模糊。还没能达成心愿，身体就停止了机能..."
    });
    G.addEnding('e_wanderer', {
        title: "【流浪者】",
        text: "你拒绝了帮助。你独自一人在世间流浪，最终在饥寒交迫中死去，或被路过的鬼杀死。你什么也没能改变。"
    });
    G.addEnding('e_early_death', {
        title: "【徒劳的抗争】",
        text: "你对鬼王挥出了拳头。无惨甚至没有躲闪。你被瞬间杀死，连名字都未被记下。"
    });

    // --- 人性路结局 (V1g) ---
    G.addEnding('h_true_god', {
        title: "【结局：孤高的武神】 (STR >= 140)",
        text: "你达到了人类武学的顶峰。在无限城之战中，你独自一人击溃了所有上弦，并亲手将无惨轰杀至黎明。\n\n你活了下来，但你失去了太多。战后，你拒绝了所有的荣誉，独自在山中隐居。人们再也没有见过你，只留下了“史上最强极地柱”的传说。"
    });
    G.addEnding('h_true_bonds', {
        title: "【结局：柱之绊】 (高STR + 高好感度)",
        text: "在无限城中，你和幸存的柱们（义勇、实弥、锖兔、炼狱...）并肩作战，以完美的配合击败了上弦。在无惨面前，你们发动了最后的合击。\n\n你活了下来。鬼杀队解散后，你和义勇、锖兔一起在鳞泷老师的墓前祭拜。你终于守护了想要守护的世界。"
    });
    G.addEnding('h_hero', {
        title: "【结局：守护之魂】 (标准胜利)",
        text: "你和盟友们拼尽全力，终于将无惨拖到了黎明。你身负重伤，但在阳光下露出了微笑。\n\n在生命的最后一刻，你似乎看到了恋雪在河对岸向你招手。'欢迎回来...' 你没有遗憾，因为你以人类的身份战斗到了最后。"
    });
    G.addEnding('h_bad', {
        title: "【结局：长夜难明】 (失败)",
        text: "尽管你拼尽全力，但你们的力量不足以对抗上弦和无惨。柱们相继战死，太阳升起时，只有无惨站立在废墟之上。\n\n鬼杀队覆灭了。你在悔恨中倒下，世界陷入了长夜。"
    });
    
    // --- 鬼性路结局 (V11) ---
    G.addEnding('d_king_true', {
        title: "【极密结局：唯一的鬼王】 (STR >= 140 + 击杀童磨 + 反抗)",
        text: "你反抗了无惨，并在黎明到来时幸存了下来。你凭借吸收童磨的力量和超越极限的武道意志，克服了阳光！\n\n你成为了新的鬼王，一个追求武道极致的、永恒的生物。你站在阳光下，这个世界再无敌手，只剩无尽的空虚。"
    });
    G.addEnding('d_redemption', {
        title: "【结局：归途】 (HUM >= 40)",
        text: "在看到炭治郎和义勇的拼死守护时，记忆的洪水冲垮了无惨的封印。你记起了恋雪。'...够了。'\n\n你反手向自己挥拳，发动了灭式，在黎明前终结了自己。'欢迎回来，亲爱的。'她在那里等你。"
    });
    G.addEnding('d_slave', {
        title: "【结局：永恒傀儡】 (服从无惨)",
        text: "你服从了命令，选择成为无惨的一部分。在最后关头，你被他吸收，成为了他的一部分，永远失去了自我。你只是一个战斗机器，再无悲喜。"
    });
    G.addEnding('d_bad_sun', {
        title: "【结局：灰飞烟灭】 (反抗但力量不足)",
        text: "你反抗了无惨，并成功将他拖到了黎明。无惨死了。但你没能克服阳光。\n\n你虽然战胜了鬼王，但作为鬼的你也一同灰飞烟灭。你的灵魂...是否得到了解脱？"
    });


    // --- 游戏启动 ---
    document.addEventListener('DOMContentLoaded', () => {
        console.log("RPG V11 Initializing...");
        // 初始化界面
        G.renderStats();
        // 进入第一个场景
        G.gotoScene('intro');
        console.log("Game Started.");
    });

})();