// data_intro.js - 序章与转折 (Year 1-3)

(function() {
    const G = window.Game;

    // --- Year 1: 起源 ---
    G.addScene('intro', {
        title: "大正 1 年：黑暗中的野兽",
        text: "你是<span class='key-plot-point'>狛治</span>。为了重病的父亲，你被迫偷窃，被人称为'鬼之子'。现在，一群暴徒正围着你。",
        image: "Placeholder: 街头斗殴",
        choices: [
            { text: "A. 拼死抵抗，打断他们的骨头 (鬼性+)", action: () => { G.updateStats({dem:5, str:2}); G.gotoScene('year1_meet_keizo'); } },
            { text: "B. 默默忍受，为了父亲赎罪 (人性+)", action: () => { G.updateStats({hum:5}); G.gotoScene('year1_meet_keizo'); } }
        ]
    });

    G.addScene('year1_meet_keizo', {
        text: "在你即将暴走时，素流道场主<span class='key-plot-point'>庆藏</span>收留了你。你见到了他病弱的女儿<span class='key-plot-point'>恋雪</span>。",
        choices: [
            { text: "努力修行，照顾恋雪 (人性+, 恋雪好感+)", action: () => { G.updateStats({hum:10, ko_h:10, str:5}); G.gotoScene('year2_adjustment'); } },
            { text: "只追求力量，报复社会 (鬼性+, 战力+)", action: () => { G.updateStats({dem:5, str:10}); G.gotoScene('year2_adjustment'); } }
        ]
    });

    // --- Year 2: 调整 ---
    G.addScene('year2_adjustment', G.createAdjustment(
        "大正 2 年：道场的羁绊",
        "在道场的日子平淡而幸福。你的拳法日益精进。",
        'year3_tragedy', 1, // 下一场景，年份+1
        [
            { label: "苦练素流拳法 (战力+5)", cost: 3, effect: () => G.updateStats({str:5}) },
            { label: "带恋雪去看烟火 (恋雪好感+10)", cost: 4, effect: () => G.updateStats({ko_h:10, hum:5}) },
            { label: "挑战邻近道场 (战力+8, 鬼性+2)", cost: 5, effect: () => G.updateStats({str:8, dem:2}) }
        ]
    ));

    // --- Year 3: 转折点 ---
    G.addScene('year3_tragedy', {
        title: "大正 3 年：血染的井水",
        text: "噩耗传来。隔壁剑道场的人在井里投毒。庆藏师父和恋雪...<span class='key-plot-point'>死了</span>。你的世界崩塌了。",
        choices: [
            { 
                text: "A. 【鬼性路】血债血偿！徒手杀光所有人！", 
                action: () => { 
                    G.state.akaza_path = 'demon';
                    G.updateStats({dem:50, hum:-50, str:30});
                    G.gotoScene('year4_demon_start', 1);
                } 
            },
            { 
                text: "B. 【人性路】压抑杀意，安葬他们，寻求正义。", 
                action: () => { 
                    G.state.akaza_path = 'human';
                    G.updateStats({hum:50, str:10}); 
                    G.gotoScene('year4_human_start', 1);
                } 
            }
        ]
    });

})();