var eCardCanvas = {};

var BaseObject = Class.extend({
    init: function (config) {
        for (var c in config) this[c] = config[c];
        this.eventListeners = {};
    },
    on: function (event, handler) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }

        this.eventListeners[event].push(handler);
    },
    fire: function (eventType, obj) {
        var events = this.eventListeners[eventType];
        if (events) {
            var len = events.length;
            for (var i = 0; i < len; i++) {
                events[i].apply(this, [obj || {}]);
            }
        }
    }
});

var BaseElement = BaseObject.extend({
    init: function (config) {
        this._super(config);
        this.propertyQueue = [];
    },
    loadImages: function (files, loadcomplete) {
        this.fire('progress-start', 'Loading Photo', this);
        var completed = 0;
        var loaded = new Object();
        $.each(files, function (index, file) {
            var img = new Image();
            img.onload = function () {
                loaded[file] = img;
                completed++;
                if (completed == files.length) {
                    loadcomplete(loaded);
                    this.fire('progress-complete', this);
                }
            }.bind(this);
            img.onerror = function () {
				this.fire('progress-complete', this);
				this.fire('error', 'The image could not be loaded', this);
            }.bind(this);
            
            img.src = (file.toLowerCase().startsWith("http") || file.toLowerCase().startsWith("data")) ? file : environment.assetsPath + file;
        }.bind(this));
    },
    draw: function () {
    },
    select: function () {
        this.fire('select', this);
    },
    deselect: function () {
    },
    drawStage: function () {
        this.layer.getStage().draw();
    },
    setProperty: function (type, value, callback) {
        if (this.propertyQueue.length > 0 || this.propertyInProgress) {
            var found = false;
            for (var i = 0; i < this.propertyQueue.length; ++i) {
                if (this.propertyQueue[i].type === type) {
                    this.propertyQueue[i].value = value;
                    this.propertyQueue[i].callback = callback;
                    found = true;
                }
            }
            if (!found)
                this.propertyQueue.push({ type: type, value: value, callback: callback });
            return;
        }
        this.propertyInProgress = true;
        var f = eval('this.set' + type);
        if (this._isAsyncProperty(type)) {
            f.call(this, value, function () {
                if (callback) { callback.call(this); }
                this.propertyInProgress = false;
                if (this.propertyQueue.length > 0) {
                    var prop = this.propertyQueue.pop();
                    this.setProperty(prop.type, prop.value, prop.callback);
                }
            }.bind(this));
        } else {
            f.call(this, value);
            if (callback) { callback.call(this); }
            this.propertyInProgress = false;
            if (this.propertyQueue.length > 0) {
                var prop = this.propertyQueue.pop();
                this.setProperty(prop.type, prop.value, prop.callback);
            }
        }
    },
    getProperty: function (type) {
        var f = eval('this.get' + type);
        if (f)
            return f.call(this);
        else
            return null;
    },
    applyProperties: function (callback) {
        if (this.properties) {
            var prop = null;
            var updateNext = function (index) {
                if (index === this.properties.length) {
                    callback.call(this);
                    return;
                }

                prop = this.properties[index];
                index++;

                this.setProperty(prop.type, prop.value, function () {
                    updateNext(index);
                }.bind(this));

            }.bind(this);

            updateNext(0);
        } else {
            callback.call(this);
        }
    },
    _isAsyncProperty: function (type) {
        return (type === 'FontFamily' || type === 'Frame' || type === 'Filter' || type == 'Contrast' || type == 'Brightness');
    },
    getProperties: function() {
    },
    _getPropertyConfig: function (type) {
        if (type instanceof Array) {
            var cfg = [];
            for (var i = 0; i < type.length; ++i) {
                cfg[cfg.length] = this._getPropertyConfig(type[i]);
            }
            return cfg;
        } else {
            return { type: type, value: this.getProperty(type) };
        }
    },
    getConfig: function () {
        return { type: this.type, properties: this.getProperties() };
    }
});