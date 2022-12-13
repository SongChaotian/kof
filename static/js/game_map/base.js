import { AcGameObject } from '/static/js/ac_game_object/base.js';
import { Controller } from '/static/js/controller/base.js';

export class GameMap extends AcGameObject {  // 地图 继承 AcGameObject, export可以写在这里，也可以写在下面
    constructor(root) {
        super();  // 调用父类的构造函数
        this.root = root;

        // tabindex=0 使得canvas可以被聚焦，这样可以读取键盘输入
        this.$canvas = $('<canvas width="1280" height="720" tabindex=0></canvas>');  // 这竟然是个数组,下标为0是我们想要的东西
        this.ctx = this.$canvas[0].getContext('2d');  // 把canvas对象取出来
        this.root.$kof.append(this.$canvas);  // 将canvas加入到页面的div里
        this.$canvas.focus();  // 聚焦，让canvas能够获取输入

        this.controller = new Controller(this.$canvas);  // 键盘控制器

        this.root.$kof.append(
            $(`
                <div class="kof-head">
                    <div class="kof-head-hp-0"><div><div></div></div></div>
                    <div class="kof-head-timer">60</div>
                    <div class="kof-head-hp-1"><div><div></div></div></div>
                </div>
            `));

        this.time_left = 60000;  // 当前剩余时间，单位：ms
        this.$timer = this.root.$kof.find(`.kof-head-timer`);  // 找到倒计时器
    }

    start() {  // 初始的时候执行一次

    }

    update() {  // 每一帧执行一次
        this.time_left -= this.timedelta;  // time_left -= 当前一帧距离上一帧的时间间隔

        if (this.time_left < 0) {  // 如果倒计时结束，两名玩家还没分出胜负，两名玩家都死亡
            this.time_left = 0;

            let [a, b] = this.root.players;
            if (a.status !== 6 && b.status !== 6) {
                a.status = b.status = 6;  // 死亡
                a.vx = b.vx = 0;  // 清空水平速度
                a.frame_current_cnt = b.frame_current_cnt = 0;  // // 从第0帧开始渲染
            }

        }
        this.$timer.text(parseInt(this.time_left / 1000));  // 显示在前端

        this.render();
    }

    render() {
        // 每一帧需要清空一遍（把刚刚画的内容清空），否则就不是物体在移动了，而是物体在画线
        // clearRect(x,y,width,height)，清楚指定矩形区域，让清除部分完全透明；
        // x与y指定canvas画布的左上角，width和height设置矩形尺寸
        // 获取canvas的width和height可以通过：
        // 1.this.ctx.canvas.witdh、this.ctx.canvas.height; 2.this.$canvas.width()、this.$canvas().height()
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // 画个黑色的矩形瞧瞧，用来调试代码，不被背景影响
        // this.ctx.fillStyle = 'black';
        // this.ctx.fillRect(0, 0, this.$canvas.width(), this.$canvas.height());
    }
}