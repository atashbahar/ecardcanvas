var BaseShape = BaseElement.extend({
    init: function (config, layer) {
        this._super(config, layer);
        this.properties = this.properties || [];

        this.width = this.width || 100;
        this.height = this.height || 100;
        this.scale = this.scale || 1;
        this.deg = this.deg || 0;

        if (!this.x) {
            var canvasWidth = this.layer.getCanvas().getWidth();
            this.x = this.cornerOffset ? this.getStageWidth() / 2 - (this.width * this.scale) / 2 : this.getStageWidth() / 2;
        }
        if (!this.y) {
            var canvasHeight = this.layer.getCanvas().getHeight();
            this.y = this.cornerOffset ? this.getStageHeight() / 2 - (this.height * this.scale) / 2 : this.getStageHeight() / 2;
        }      

        this.group = new Kinetic.Group({
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            draggable: true,
            dragOnTop: false,
            scale: {
                x: this.scale,
                y: this.scale
            },
            rotationDeg: this.deg
        });


        if (this.cornerOffset === undefined)
            this.group.setOffset(this.width / 2, this.height / 2);

        // changed from click to mousedown because in 4.3.1 after 
        // the drag background was selected for some reason
        this.group.on('mousedown tap dragstart', function (evt) {
            if (this.ready) {
                //this.selectThis();
                //this.onSelect(this);
                //this.fire('select', this);
                this.select();
            }
        }.bind(this));

        this.group.on("dragmove", function (evt) {
            var pos = this.group.getPosition();
            this.setPosition(pos.x, pos.y);
            this.updateAnchorPosition();
        }.bind(this));

        this.layer.add(this.group);

        if (!this.zindex) { this.group.moveToTop(); }
    },
    getStageWidth: function () {
        return this.layer.getStage().getWidth() / this.layer.getStage().getScale().x;
    },
    getStageHeight: function () {
        return this.layer.getStage().getHeight() / this.layer.getStage().getScale().y;
    },
    dispose: function () {
        this.group.remove();
        this.anchor.remove();
        this.drawStage();
    },
    moveToTop: function () {
        this.group.moveToTop();
        this.anchor.moveToTop();        
    },
    moveToBottom: function () {
        this.anchor.moveToBottom();
        this.group.moveToBottom();        
    },
    setPosition: function (x, y) {
        this.x = x;
        this.y = y;
    },
    select: function () {
        this.selected = true;

        if (!this.boundingBox) {
            this.boundingBox = new Kinetic.Rect({
                width: this.width,
                height: this.height,
                stroke: '#00A8FF',
                strokeWidth: 1.5 / this.scale
            });

            this.group.add(this.boundingBox);
            this.addAnchor();
        }

        this.boundingBox.show();
        this.anchor.show();

        this._super();
    },
    deselect: function () {
        this.selected = false;

        if (this.boundingBox) {
            this.boundingBox.hide();
            this.anchor.hide();
        }
    },
    updateAnchorPosition: function () {
        var pos = this.group.getPosition();
        var len = 0;
        if (this.cornerOffset) {
            len = this._distance({ x: 0, y: 0 }, { x: (this.width * this.scale), y: 0 });
            this.startAngle = this._angle({ x: pos.x, y: pos.y }, { x: pos.x + this.width, y: pos.y });
        } else {
            this.startAngle = this._angle({ x: pos.x, y: pos.y }, { x: pos.x + this.width / 2, y: pos.y - this.height / 2 });
            len = this._distance({ x: 0, y: 0 }, { x: (this.width * this.scale) / 2, y: -1 * (this.height * this.scale) / 2 });
        }

        var newPoint = this._getPointAt(this.group.getPosition(), len, this.group.getRotationDeg() + this.startAngle);

        this.anchor.setPosition(newPoint.x, newPoint.y);
    },
    update: function () {
        var pos = this.group.getPosition();
        var apos = this.anchor.getPosition();
        var aofs = this.anchor.getOffset();

        // anchor absolute position
        var abs = { x: apos.x - aofs.x, y: apos.y - aofs.y };
        var angle = this._angle(pos, abs);
        this.deg = angle - this.startAngle - this.anchor.getRotationDeg();
        this.group.setRotationDeg(this.deg);

        var origLen = 0;
        if (this.cornerOffset)
            origLen = this._distance(pos, { x: pos.x + (this.width * this.scale), y: pos.y });
        else
            origLen = this._distance(pos, { x: pos.x + (this.width * this.scale) / 2, y: pos.y - (this.height * this.scale) / 2 });

        var newLen = this._distance(pos, abs);

        this.scale = (this.scale * newLen) / origLen;
        this.group.setScale(this.scale, this.scale);

        this.boundingBox.setStrokeWidth(1.5 / this.scale);
    },
    _angle: function (center, p1) {
        var p0 = {
            x: center.x, y: center.y - Math.sqrt(Math.abs(p1.x - center.x) * Math.abs(p1.x - center.x)
                    + Math.abs(p1.y - center.y) * Math.abs(p1.y - center.y))
        };
        return (2 * Math.atan2(p1.y - p0.y, p1.x - p0.x)) * 180 / Math.PI;
    },
    _getPointAt: function (center, radius, angle) {
        angle *= Math.PI / 180;
        return {
            x: center.x + Math.sin(Math.PI - angle) * radius,
            y: center.y + Math.cos(Math.PI - angle) * radius
        };
    },
    _distance: function (point1, point2) {
        var xs = point2.x - point1.x;
        xs = xs * xs;

        var ys = point2.y - point1.y;
        ys = ys * ys;

        return Math.sqrt(xs + ys);
    },
    addAnchor: function () {
        this.anchor = new Kinetic.Circle({
            stroke: "#666",
            fill: "#ddd",
            strokeWidth: 2,
            radius: environment.hasTouch ? 24 : 16,
            dragOnTop: false,
            draggable: true
        });

        this.anchor.on("dragmove", function () {
            this.update(this);
        }.bind(this));
        this.anchor.on("mousedown touchstart", function () {
            //this.group.setDraggable(false);
            //this.moveToTop();
        }.bind(this));
        this.anchor.on("dragend", function (e) {
            //this.group.setDraggable(true);
        }.bind(this));
        this.anchor.on("mouseover", function () {
            document.body.style.cursor = "pointer";
            this.anchor.setStrokeWidth(4);
            this.drawStage();
        }.bind(this));
        this.anchor.on("mouseout", function () {
            document.body.style.cursor = "default";
            this.anchor.setStrokeWidth(2);
            this.drawStage();
        }.bind(this));

        this.updateAnchorPosition();

        this.layer.add(this.anchor);
    },
    setSize: function (width, height) {
        this.width = width;
        this.height = height;
        this.group.setSize(width, height);

        if (this.cornerOffset === undefined)
            this.group.setOffset(this.width / 2, this.height / 2);

        if (this.boundingBox) {
            this.boundingBox.setSize(width, height);
            this.updateAnchorPosition();
        }
    },
    setHeight: function (height) {
        this.height = height;
        this.group.setHeight(height);

        if (this.cornerOffset === undefined)
            this.group.setOffset(this.width / 2, this.height / 2);

        if (this.boundingBox) {
            this.boundingBox.setHeight(height);
            this.updateAnchorPosition();
        }
    },
    setScale: function (scale) {
        this.scale = scale;
        this.group.setScale(scale);
    },
    applyFilter: function (image, config, callback) {

        //if (config.name === 'None')
        //    this.filterConfig = null;
        //else
        //    this.filterConfig = config;

        ////var filter = Kinetic.Filters[config.title];
        //var filter = eval(config.name);
        //if (!filter) {
        //    callback(image);
        //    return;
        //}

        if (config.name === 'none' || environment.filtersDisabled) {
            this.filterConfig = null;
            callback(image);
            return;
        }

        this.filterConfig = config;

        var canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        var scope = this;
        this.fire('download-start', this);
        Caman(canvas, image.src, function () {
            this[config.name]();
            this.render(function (a) {
                var dataUrl = canvas.toDataURL('image/jpeg', 0.84);
                var imageObj = new Image();
                imageObj.onload = function () {
                    canvas = null;
                    callback(imageObj);
                    scope.fire('download-complete', this);
                };
                imageObj.src = dataUrl;
            });
        });

        //var context = canvas.getContext('2d');
        //context.drawImage(image, 0, 0);
        //var imageData = context.getImageData(0, 0, image.width, image.height);
        ////filter(imageData, config);

        //var f = new filter();
        //f.filter(imageData, config);


        //context.putImageData(imageData, 0, 0);
        //var dataUrl = canvas.toDataURL();
        //var imageObj = new Image();
        //imageObj.onload = function () {
        //    callback(imageObj);
        //}
        //imageObj.src = dataUrl;
    },
    setShadowColor: function (color) {
        this._getShadowedShape().setShadowColor(color);
    },
    getShadowColor: function () {
        return this._getShadowedShape().getShadowColor();
    },
    setShadowBlur: function (value) {
        console.log(value);
        this._getShadowedShape().setShadowBlur(value);
    },
    getShadowBlur: function () {
        return this._getShadowedShape().getShadowBlur();
    },
    setShadowOffset: function (offset) {
        this._getShadowedShape().setShadowOffset(offset);
    },
    getShadowOffset: function () {
        return this._getShadowedShape().getShadowOffset();
    },
    setShadowOpacity: function (value) {
        this._getShadowedShape().setShadowOpacity(value);
    },
    getShadowOpacity: function () {
        return this._getShadowedShape().getShadowOpacity();
    },

    getShadowConfig: function () {        
        return this._getShadowedShape().hasShadow() ? this._getPropertyConfig(['ShadowColor', 'ShadowOffset', 'ShadowBlur', 'ShadowOpacity']) : [];
    },
    getConfig: function () {
        return jQuery.extend(true, { x: Math.round(this.x), y: Math.round(this.y), width: this.width, height: this.height, scale: this.scale, deg: this.deg, zindex: this.group.getZIndex() }, this._super());
    }
});