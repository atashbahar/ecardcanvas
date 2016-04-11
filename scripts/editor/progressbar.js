var ProgressBar = Class.extend({
    init: function (config) {
        this.elem = $(config.elem);
        this.counter = 0;
    },
    show: function (msg) {
        this.counter++;
        this.elem.html('<span>' + msg + '</span>').show();
    },
    hide: function () {
        this.counter--;
        if (this.counter === 0) {
            this.elem.hide();
        }
    }
});