var Text = BaseShape.extend({
    init: function (config) {
        this.localFonts = ['Arial', 'Georgia'];
        this.cornerOffset = true;

        // if width is no provided we calculate it based on the number of words
        if (!config.width) {
            config.width = 400;
        }

        this._super(config);
    },
    draw: function () {
        this.txt = new Kinetic.Text({
            width: this.width,
            text: this.title,
            fill: 'black',
            fontSize: 24,
            lineHeight: 1.2,
            fontFamily: 'Arial',
            lineJoin: 'round'
        });

        this.group.add(this.txt);

        this.applyProperties(function () {
            this._updateHeight();
            this.redraw();

            this.ready = true;
            this.fire('ready', this);
        });
    },
    redraw: function () {
        this.drawStage();
    },
    update: function () {
        this._super();
        
        this.setSize(this.scale * this.group.getWidth(), this.scale * this.group.getHeight());

        this.scale = 1;
        this.group.setScale(1, 1);        

        this.txt.setWidth(this.width);
        if (this.stroke) { this.stroke.setWidth(this.width); }

        this.setHeight(this.txt.getHeight());
    },
    setText: function (txt) {
        if (this.selected) { this.title = txt; this.txt.setText(txt); }
        if (this.stroke) { this.stroke.setText(txt); }
        this._updateHeight();
        this.redraw();
    },
    getText: function () {
        return this.txt.getText();
    },
    setFontSize: function (size) {
        this.txt.setFontSize(size);
        if (this.stroke) { this.stroke.setFontSize(size); }
        this._updateHeight();
    },
    getFontSize: function () {
        return this.txt.getFontSize();
    },
    setLineHeight: function (height) {
        this.txt.setLineHeight(height);
        if (this.stroke) { this.stroke.setLineHeight(height); }
        this._updateHeight();
    },
    getLineHeight: function () {
        return this.txt.getLineHeight();
    },
    setFontFamily: function (family, callback) {
        if (jQuery.inArray(family, this.localFonts) !== -1) {
            this._setFontFamily(family);
            callback(this);
        } else {
            this._loadFont(family, function () {
                this._setFontFamily(family);
                callback(this);
            }.bind(this));
        }
    },
    getFontFamily: function () {
        return this.txt.getFontFamily();
    },
    setTextAlign: function (align) {
        this.txt.setAlign(align);
        if (this.stroke) { this.stroke.setAlign(align); }
    },
    getTextAlign: function () {
        return this.txt.getAlign();
    },
    setTextFill: function (color) {
        this.txt.setFill(color);
        if (this.stroke) { this.stroke.setFill(color); }
    },
    getTextFill: function () {
        return this.txt.getFill();
    },
    setStrokeColor: function (color) {
        this._createStroke();
        this.stroke.setStroke(color);
    },
    getStrokeColor: function () {
        if (this.stroke)
            return this.stroke.getStroke();
    },
    setStrokeWidth: function (width) {
        if (width === 0) {
            this._removeStroke();
        } else {
            this._createStroke();
            this.stroke.setStrokeWidth(width);
        }
    },
    getStrokeWidth: function () {
        if (this.stroke)
            return this.stroke.getStrokeWidth();
    },
    setOpacity: function (opacity) {
        this.txt.setOpacity(opacity);
        if (this.stroke) { this.stroke.setOpacity(opacity); }
    },
    getOpacity: function () {
        return this.txt.getOpacity();
    },
    getProperties: function () {
        var cfg = this.getShadowConfig();        
        cfg = cfg.concat(this._getPropertyConfig(['TextFill', 'FontSize', 'FontFamily', 'LineHeight', 'TextAlign']));
        if (this.stroke) {
            cfg = cfg.concat(this._getPropertyConfig(['StrokeColor', 'StrokeWidth']));
        }
        return cfg;
    },
    getConfig: function () {
        return jQuery.extend({ title: this.title }, this._super());
    },
    _updateHeight: function () {
        this.setHeight(this.txt.getHeight());
    },
    _setFontFamily: function (family) {
        this.txt.setFontFamily(family);
        if (this.stroke) { this.stroke.setFontFamily(family); }
        this._updateHeight();
    },
    _loadFont: function (family, complete) {
        this.fire('progress-start', 'Loading Font', this);
        this.ready = false;
		
        var scope = this;
		var loadComplete = function() {
            complete();
            scope.ready = true;
            scope.fire('progress-complete', scope);		
		};
		
        WebFont.load({
            google: {
                families: [family]
            },
            active: function () {
				loadComplete();
            },
            inactive: function () {
                loadComplete();
				scope.fire('error', 'The font could not be loaded', this);
            }
        });
    },
    _createStroke: function () {
        if (!this.stroke) {
            this.stroke = this.txt.clone();
            this.stroke.disableFill(); // this causes the shadow to be applied to the stroke
            this.stroke.setOpacity(this.txt.getOpacity())
            this.group.add(this.stroke);
            this.stroke.moveToBottom();

            this._transferShadow(this.txt, this.stroke);
        }
    },
    _removeStroke: function () {
        if (this.stroke) {

            this._transferShadow(this.stroke, this.txt);

            this.stroke.remove();
            this.stroke = null;
        }
    },
    _getShadowedShape: function () {
        return this.stroke || this.txt;
    },
    _transferShadow: function (src, dest) {
        if (src.hasShadow()) {
            dest.setShadowColor(src.getShadowColor());
            dest.setShadowBlur(src.getShadowBlur());
            dest.setShadowOffset(src.getShadowOffset());
            dest.setShadowOpacity(src.getShadowOpacity());
            src.disableShadow();
            dest.enableShadow();
        }
    },
});
