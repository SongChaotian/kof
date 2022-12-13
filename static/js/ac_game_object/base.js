let AC_GAME_OBJECTS = [];  // 把对象的所有元素存下来，用来每一帧刷新一遍

class AcGameObject {
    constructor() {
        AC_GAME_OBJECTS.push(this);

        this.timedelta = 0;  // 当前一帧距离上一帧的时间间隔
        this.has_call_start = false;  // 表示当前对象有没有执行过start()函数，且每个对象只执行一遍
    }

    start() {  // 初始执行一次

    }

    update() {  // 每一帧执行一次（除了第一帧以外）

    }

    destroy() {  // 删除当前对象
        for (let i in AC_GAME_OBJECTS) {  // for in 枚举下标
            if (AC_GAME_OBJECTS[i] === this) {  // 找到当前元素
                AC_GAME_OBJECTS.splice(i, 1);   // splice(i, 1)删除数组中的从下表为i开始，1个元素
                break;
            }
        }
    }
}

let last_timestamp;  // 上一帧的执行的时刻
let AC_GAME_OBJECTS_FRAME = (timedelta) => {  // timedelta表示当前函数执行的时刻
    for (let obj of AC_GAME_OBJECTS) {  // for of 枚举值
        if (!obj.has_call_start) {  // 如果当前元素没有执行过start()函数，就先执行一次start()函数
            obj.start();
            obj.has_call_start = true;
        } else {  // 如果当前元素执行过start()函数，则每一帧都执行一次update()函数
            obj.timedelta = timedelta - last_timestamp;  // 更新tiemdelta = 当前执行时刻 - 上一帧执行时刻
            obj.update();
        }
    }

    last_timestamp = timedelta;  // 更新一下last_timestamp
    requestAnimationFrame(AC_GAME_OBJECTS_FRAME);  // 通过递归的方式实现每一帧执行一次
}

requestAnimationFrame(AC_GAME_OBJECTS_FRAME);  // 启动入口

export {
    AcGameObject
}


