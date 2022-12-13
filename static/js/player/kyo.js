import { Player } from '/static/js/player/base.js';
import { GIF } from '/static/js/utils/gif.js';

export class Kyo extends Player {
    constructor(root, info) {
        super(root, info);

        this.init_animations();
    }

    init_animations() {  // 初始化动画
        let outer = this;
        let offsets = [0, -22, -22, -140, 0, 0, 0];  // 竖直方向上的偏移量
        for (let i = 0; i < 7; i++) {  // 一共有7个动画
            let gif = GIF();
            gif.load(`/static/images/player/kyo/${i}.gif`);

            // 将gif加到animations里（Map）
            this.animations.set(i, {
                gif: gif,
                frame_cnt: 0,  // 图片帧数，初始化为0，加载完后重新定义
                frame_rate: 5,  // 每多少帧过渡一次
                offset_y: offsets[i],  // 竖直方向偏移量
                loaded: false,  // 是否加载完成 
                scale: 2,  // 放大多少倍
            });

            gif.onload = function () {  // 当图片加载完成之后
                let obj = outer.animations.get(i);
                obj.frame_cnt = gif.frames.length;  // gif的图片帧数 = 加载完后gif的长度
                obj.loaded = true;  // gif加载完成

                if (i === 3) {
                    obj.frame_rate = 4;  // 如果是跳跃的话，可以每4帧过渡一次
                }
            }
        }
    }
}
