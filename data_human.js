// data_human.js - 极地柱传说 (Year 4-10)

(function() {
    const G = window.Game;

    // --- Year 4: 加入鬼杀队 ---
    G.addScene('year4_human_start', {
        title: "大正 4 年：不拿刀的剑士",
        text: "你被路过的产屋敷耀哉救下。你决定加入鬼杀队，但你拒绝用刀，而是带上了日轮手甲。你被称为'异端'。",
        choices: [
            { text: "独自苦修，开发'破坏杀-呼吸法' (战力+)", action: () => { G.updateStats({str:15}); G.gotoScene('year5_first_mission'); } },
            { text: "向富冈义勇请教水之呼吸 (义勇好感+)", action: () => { G.updateStats({gi_h:10, str:5}); G.gotoScene('year5_first_mission'); } }
        ]
    });

    // --- Year 5: 初露锋芒 ---
    G.addScene('year5_first_mission', {
        title: "大正 5 年：下弦的终结",
        text: "你遭遇了下弦之贰。对方嘲笑你没有刀。你一拳贯穿了他的头颅。",
        choices: [
            { text: "汇报主公，谦虚行事 (人性+)", action: () => { G.updateStats({hum:10}); G.gotoScene('year6_pillar_meeting'); } },
            { text: "觉得自己还需要更强 (战力+)", action: () => { G.updateStats({str:10}); G.gotoScene('year6_pillar_meeting'); } }
        ]
    });

    // --- Year 6: 柱合会议与风柱冲突 ---
    G.addScene('year6_pillar_meeting', {
        title: "大正 6 年：晋升“极地柱”",
        text: "你晋升为柱。但在会议上，<span class='key-plot-point'>不死川实弥</span>挑衅你：“没刀的废物，也能杀鬼？”他向你挥拳。",
        choices: [
            { text: "正面接下一拳，纹丝不动 (战力+, 实弥好感↑)", action: () => { G.updateStats({str:5, sa_h:10}); G.setResult("实弥笑了：'身板挺硬啊。'"); G.gotoScene('year7_training'); } },
            { text: "反击，将他摔倒在地 (战力++, 实弥好感↓)", action: () => { G.updateStats({str:15, sa_h:-5}); G.setResult("主公出面制止了骚乱。"); G.gotoScene('year7_training'); } }
        ]
    });

    // --- Year 7: 岩柱的教导 (调整年) ---
    G.addScene('year7_training', G.createAdjustment(
        "大正 7 年：柱的特训",
        "为了应对更强的鬼，你向最强的岩柱·悲鸣屿行冥请教。",
        'year8_entertainment', 1,
        [
            { label: "与岩柱瀑布修行 (战力+20, 岩柱好感+)", cost: 5, effect: () => G.updateStats({str:20, gy_h:10}) },
            { label: "与炼狱杏寿郎切磋 (战力+10, 炼狱好感+)", cost: 3, effect: () => G.updateStats({str:10, re_h:15}) },
            { label: "回道场祭拜恋雪 (人性+20)", cost: 4, effect: () => G.updateStats({hum:20}) }
        ]
    ));

    // --- Year 8: 游郭篇援助 ---
    G.addScene('year8_entertainment', {
        title: "大正 8 年：花街之战",
        text: "音柱宇髓天元陷入苦战。你赶到战场，面对上弦之陆兄妹。",
        choices: [
            { text: "保护平民，让音柱主攻 (人性+)", action: () => { G.updateStats({hum:15}); G.gotoScene('year9_calm'); } },
            { text: "开启斑纹，独自瞬杀堕姬 (战力+, 寿命折损)", action: () => { G.updateStats({str:30, tp:-5}); G.gotoScene('year9_calm'); } }
        ]
    });

    // --- Year 9: 暴风雨前的宁静 ---
    G.addScene('year9_calm', G.createAdjustment(
        "大正 9 年：决战准备",
        "无惨的动作越来越频繁。你需要为无限城决战做最后的准备。",
        'year10_final_battle', 1,
        [
            { label: "领悟'通透世界' (消耗全部体力，战力MAX)", cost: 10, effect: () => G.updateStats({str:50}) },
            { label: "与义勇喝茶谈心 (义勇好感MAX)", cost: 3, effect: () => G.updateStats({gi_h:20, hum:10}) },
            { label: "指导新人炭治郎 (人性+)", cost: 3, effect: () => G.updateStats({hum:15}) }
        ]
    ));

    // --- Year 10: 最终决战 ---
    G.addScene('year10_final_battle', {
        title: "大正 10 年：无限城决战",
        text: "最终决战。你面前的是<span class='key-plot-point'>鬼王·鬼舞辻无惨</span>。你的拳头，是为了守护而挥动！",
        choices: [
            { text: "【结局判定】燃烧生命，使出破坏杀·终式", action: () => checkHumanEnding() }
        ]
    });

    function checkHumanEnding() {
        const s = G.state;
        if (s.str > 150 && s.hum > 100) G.showEnding('h_true'); // 完美结局
        else if (s.str > 100) G.showEnding('h_hero'); // 牺牲结局
        else G.showEnding('h_bad'); // 失败结局
    }
})();