import { AcGameObject } from '/static/js/ac_game_object/base.js';

export class Player extends AcGameObject {  // 玩家 继承 AcGameObject, export可以写在这里，也可以写在下面
    constructor(root, info) {  // root方便我们索引地图上的每一个元素
        super();
        this.root = root;

        this.id = info.id;  // 用于区分两名角色
        this.x = info.x;  // x, y是角色所处的坐标
        this.y = info.y;
        this.width = info.width;  // width,height是角色的矩形范围，宽、高
        this.height = info.height;
        this.color = info.color;

        this.direction = 1;  // 方向，正方向（朝右）为1，反方向为-1

        this.vx = 0;  // 水平方向的速度
        this.vy = 0;  // 竖直方向的速度

        this.speedx = 400;  // 水平速度
        this.speedy = -1000;  // 跳起的初始速度

        this.gravity = 50;  // 重力，用于跳起后的下落相关计算 

        this.ctx = this.root.game_map.ctx;  // 索引到地图上的canvas
        this.pressed_keys = this.root.game_map.controller.pressed_keys;  // 获取当前键盘按的键

        this.status = 3;  //状态机： 0: idle（静止）, 1：向前，2：向后，3：跳跃，4：攻击，5：被打，6：死亡
        this.animations = new Map();  // 存储每一个状态的动作
        this.frame_current_cnt = 0;  // 每过一帧记录一下，表示当前记录了多少帧

        this.hp = 100;  // 初始血量100
        this.$hp = this.root.$kof.find(`.kof-head-hp-${this.id}>div`);  // 做html中的血槽的拖影效果
        this.$hp_div = this.$hp.find(`div`);  // 找到html中的血槽
    }

    start() {

    }

    update_move() {
        // 跳起在空中的时候，给角色增加重力
        this.vy += this.gravity;  // 竖直方向上的速度 + 模拟重力速度

        this.x += this.vx * this.timedelta / 1000;  // 速度 * 时间(单位：ms) = 距离
        this.y += this.vy * this.timedelta / 1000;

        // 以下注释代码实现人物碰撞时，推着对方走
        // let [a, b] = this.root.players;
        // if (a !== this) [a, b] = [b, a];  // a是我，b是对方

        // let r1 = {
        //     x1: a.x,
        //     y1: a.y,
        //     x2: a.x + a.width,
        //     y2: a.y + a.height,
        // }
        // let r2 = {
        //     x1: b.x,
        //     y1: b.y,
        //     x2: b.x + b.width,
        //     y2: b.y + b.height,
        // }

        // if (this.is_collision(r1, r2)) {  // 如果两个人物碰撞，就推着对方走
        //     b.x += this.vx * this.timedelta / 1000 / 2;  // 速度减半
        //     b.y += this.vy * this.timedelta / 1000 / 2;
        //     a.x -= this.vx * this.timedelta / 1000 / 2;
        //     a.y -= this.vy * this.timedelta / 1000 / 2;

        //     if (this.status === 3) this.status = 0;  // 跳到地面后状态变为静止
        // }

        if (this.y > 450) {  // 跳到地面上
            this.y = 450;
            this.vy = 0;

            if (this.status === 3) this.status = 0;  // 跳到地面后状态变为静止
        }

        // 防止左右移动走出地图
        if (this.x < 0) {
            this.x = 0;
        } else if (this.x + this.width > this.root.game_map.$canvas.width()) {
            this.x = this.root.game_map.$canvas.width() - this.width;
        }
    }

    update_control() {
        let w, a, d, space;  // 上、左、右、攻击
        if (this.id === 0) {
            w = this.pressed_keys.has('w');
            a = this.pressed_keys.has('a');
            d = this.pressed_keys.has('d');
            space = this.pressed_keys.has(' ');
        } else {
            w = this.pressed_keys.has('ArrowUp');  // 注意大小写，↑
            a = this.pressed_keys.has('ArrowLeft');  // ←
            d = this.pressed_keys.has('ArrowRight');  // →
            space = this.pressed_keys.has('Enter');
        }

        if (this.status === 0 || this.status === 1) {  // 当前是静止或移动状态时
            if (space) {   // 如果是攻击状态
                this.status = 4;
                this.vx = 0;  // 水平速度清空
                this.frame_current_cnt = 0;  // 从第0帧开始渲染
            } else if (w) {  // 跳跃有三种形式：1.垂直，2.向前45°，3.向后45°
                if (d) {
                    this.vx = this.speedx;
                } else if (a) {
                    this.vx = -this.speedx;
                } else {
                    this.vx = 0;
                }
                this.vy = this.speedy;
                this.status = 3;  // 状态3表示跳起
                this.frame_current_cnt = 0;  // 从第0帧开始渲染
            } else if (d) {  // 如果没有跳跃
                this.vx = this.speedx;
                this.status = 1;  // 状态1表示移动
            } else if (a) {
                this.vx = -this.speedx;
                this.status = 1;  // 状态1表示移动
            } else {  // 如果啥也没按就是静止
                this.vx = 0;
                this.status = 0;  // 状态0表示静止
            }
        }
    }

    update_direction() {
        if (this.status === 6) return;  // 如果已经死亡，就不需要再调换方向了

        let players = this.root.players;  // 取出两名玩家
        if (players[0] && players[1]) {  // 当两名玩家都存在时
            let me = this, you = players[1 - this.id];
            if (me.x < you.x) me.direction = 1;  // 如果我在左，对手在右，就是正方向
            else me.direction = -1;
        }
    }

    is_attack() {
        if (this.status === 6) return;  // 如果已经死亡，就不能再被攻击了

        this.status = 5;  // 5为被攻击状态
        this.frame_current_cnt = 0;  // 从第0帧开始渲染

        this.hp = Math.max(this.hp - 20, 0);  // 被攻击后减50点血

        // 当前血槽的宽度 = 其父元素div的宽度 * 百分之this.hp
        this.$hp_div.animate({  // jquery的渐变效果animate
            width: this.$hp.parent().width() * this.hp / 100
        }, 300);  // 渐变效果，单位ms

        // 拖影效果，红色渐变的稍微慢点
        this.$hp.animate({  // jquery的渐变效果animate
            width: this.$hp.parent().width() * this.hp / 100
        }, 600);  // 渐变效果，单位ms


        if (this.hp <= 0) {
            this.status = 6;  // 状态6为死亡
            this.vx = 0;  // 清空水平速度
            this.frame_current_cnt = 0;  // 从第0帧开始渲染
        }
    }

    is_collision(r1, r2) {  // 碰撞检测
        if (Math.max(r1.x1, r2.x1) > Math.min(r1.x2, r2.x2))  // 水平方向上的交集比较
            return false;
        if (Math.max(r1.y1, r2.y1) > Math.min(r1.y2, r2.y2))  // 竖直方向上的交集比较
            return false;
        return true;
    }

    update_attack() {
        if (this.status === 4 && this.frame_current_cnt === 18) {  // 4为攻击状态,第18帧时拳头申的最远
            let me = this, you = this.root.players[1 - this.id];  // 区分自己和敌人
            let r1;  // 拳头矩形坐标
            if (this.direction > 0) {  // 正方向时，拳头的左上角坐标和左下角坐标
                r1 = {
                    x1: me.x + 120,
                    y1: me.y + 40,
                    x2: me.x + 120 + 100,
                    y2: me.y + 40 + 20,
                }
            } else {  // 反方向时，拳头的左上角坐标和左下角坐标
                r1 = {
                    x1: me.x + me.width - 120 - 100,
                    y1: me.y + 40,
                    x2: me.x + me.width - 120 - 100 + 100,
                    y2: me.y + 40 + 20,
                }
            }

            let r2;  // 敌人矩形坐标
            r2 = {
                x1: you.x,
                y1: you.y,
                x2: you.x + you.width,
                y2: you.y + you.height,
            }

            if (this.is_collision(r1, r2)) {  // 两个矩形是有交集的，即如果打中对方
                you.is_attack();
            }
        }
    }

    update() {
        this.update_control();  // 每一帧判断一下 键盘按的是什么
        this.update_move();  // 每一帧角色需要移动一下
        this.update_direction();  // 每一帧更新角色的方向
        this.update_attack();  // 判断是否攻击到对方

        this.render();  // 把角色当前帧的状态渲染出来
    }

    render() {
        // 以下注释代码在写碰撞检测是提供便利
        // // 人物方块
        // this.ctx.fillStyle = 'blue';
        // this.ctx.fillRect(this.x, this.y, this.width, this.height);

        // // 拳头方块
        // if (this.direction > 0) {
        //     this.ctx.fillStyle = 'red';
        //     this.ctx.fillRect(this.x + 120, this.y + 40, 100, 20);
        // } else {  // 把拳头镜像翻转
        //     this.ctx.fillStyle = 'red';
        //     this.ctx.fillRect(this.x + this.width - 120 - 100, this.y + 40, 100, 20);
        // }

        let status = this.status;  // 根据当前的status进行渲染

        if (this.status === 1 && this.direction * this.vx < 0) {  // 如果在移动的时候人物方向和速度方向相反
            status = 2;  // 就说明人物在后退
        }

        let obj = this.animations.get(status);  // 将当前状态的gif取出来
        if (obj && obj.loaded) {  // 如果gif存在并且已经加载完成

            if (this.direction > 0) {
                let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;  // k表示当前渲染到第几帧，用第几帧动画
                let image = obj.gif.frames[k].image;  // 第k帧的图片
                this.ctx.drawImage(image, this.x, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale);
            } else {  // 如果反方向，通过调整坐标系实现水平翻转图片的效果
                this.ctx.save();  // 保存画布(canvas)的所有状态

                this.ctx.scale(-1, 1);  // 第一步：实现以y轴水平翻转，x乘上-1， y不变（此时画布在x轴负方向）
                this.ctx.translate(-this.root.game_map.$canvas.width(), 0)  // 第二步：朝x轴负方向平移整个画布

                let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;  // k表示当前渲染到第几帧，用第几帧动画
                let image = obj.gif.frames[k].image;  // 第k帧的图片
                // 第三步：对人物进行画布canvas中心对称翻转，用canvas宽度减去x的坐标再减去小人宽度，就ok
                this.ctx.drawImage(image, this.root.game_map.$canvas.width() - this.x - this.width, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale);

                this.ctx.restore();  // 恢复canvas的状态
            }
        }

        if (status === 4 || status === 5 || status === 6) {  // 攻击状态和被打状态在播放完最后一帧时回归静止状态
            if (this.frame_current_cnt == obj.frame_rate * (obj.frame_cnt - 1)) {
                if (status === 6) {
                    this.frame_current_cnt--;  // -- 和下面的 ++ 抵消， 使得一直处于死亡的最后一帧（即倒地不起）
                } else {
                    this.status = 0;
                }
            }
        }

        this.frame_current_cnt++;  // 帧数 ++
    }
}