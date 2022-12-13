export class Controller {
    constructor($canvas) {
        this.$canvas = $canvas;

        this.pressed_keys = new Set();  // Set()去重，存储当前键盘所按的键
        this.start();
    }

    start() {
        let outer = this;
        this.$canvas.keydown(function (e) {  // 键盘按住时（不松起）
            outer.pressed_keys.add(e.key);  // e.key是当前按的键
        });

        this.$canvas.keyup(function (e) {  // 键盘松开时
            outer.pressed_keys.delete(e.key);
        });
    }
}