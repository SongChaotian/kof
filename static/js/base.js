import { GameMap } from '/static/js/game_map/base.js';
import { Kyo } from '/static/js/player/kyo.js';

class KOF {
    constructor(id) {  // id主要是用来索引html中的div
        this.$kof = $('#' + id);  // jquery中的id选择器

        this.game_map = new GameMap(this);
        this.players = [
            new Kyo(this, {  // 传入root和info，info是一个对象
                id: 0,
                x: 200,
                y: 0,
                width: 120,
                height: 200,
                color: 'blue',
            }),
            new Kyo(this, {  // 传入root和info，info是一个对象
                id: 1,
                x: 900,
                y: 0,
                width: 120,
                height: 200,
                color: 'red',
            })
        ];

    }
}

export {
    KOF
}