var Clipart = BaseShape.extend({
    init: function (config) {
        this._super(config);
    },
    draw: function () {
        this.loadImages([this.src], function (images) {
            this.imgObj = images[this.src];

            this.img = new Kinetic.Image({
                image: this.imgObj
                //scaleX: -1,
                //x: this.width
                //scaleY: -1,
                //y: this.height
            });
            
            //this.img.createImageHitRegion();

            this.applyProperties(function () {
                this.group.add(this.img);
                this.redraw();

                this.ready = true;
                this.fire('ready', this);
            });
        }.bind(this));
    },
    redraw: function () {
        this.drawStage();
    },
    setFillColor: function (color) {
        this.img.clearFilter();
        if (color == 'transparent') {
            this.fillColor = null;
        } else {
            this.fillColor = color;
            this.img.setFilterColorFill(color);
            this.img.setFilter(Kinetic.Filters.ColorFill);            
        }
    },
    getFillColor: function () {
        return this.fillColor;
    },
    setFilter: function (config, callback) {
        this.img.setImage(this.imgObj);
        this.applyFilter(this.imgObj, config, function (filteredImage) {
            this.img.setImage(filteredImage);
            callback(this);
        }.bind(this));
    },
    getFilter: function () {
        return this.filterConfig;
    },
    setOpacity: function(opacity) {
        this.img.setOpacity(opacity);
        this.redraw();
    },
    getOpacity: function() {
        return this.img.getOpacity();
    },
    setFlipHorizontal: function () {
        if (this.flipHorizontal) {
            this.flipHorizontal = null;
            this.img.setScaleX(1);
            this.img.setX(0);
        } else {
            this.flipHorizontal = true;
            this.img.setScaleX(-1);
            this.img.setX(this.width);
        }
    },
    getFlipHorizontal: function () {
        return this.flipHorizontal;
    },
    getProperties: function () {
        var cfg = this.getShadowConfig();
        if (this.filterConfig) {
            cfg = cfg.concat(this._getPropertyConfig('Filter'));
        }
        if (this.fillColor) {
            cfg = cfg.concat(this._getPropertyConfig('FillColor'));
        }
        if (this.flipHorizontal) {
            cfg = cfg.concat(this._getPropertyConfig('FlipHorizontal'));
        }
        return cfg;
    },
    getConfig: function () {
        return jQuery.extend({ src: this.src }, this._super());
    },
    _getShadowedShape: function () {
        return this.img;
    }
});