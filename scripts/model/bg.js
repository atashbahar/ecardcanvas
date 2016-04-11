var Background = BaseElement.extend({
    init: function (config) {
        this._super(config);
    },
    draw: function () {

        // other objects might want to access this item before the related image has been loaded
        this.bg = new Kinetic.Image({
            width: this.stageWidth,
            height: this.stageHeight
        });

        this.layer.add(this.bg);

        this.loadImages([this.src], function (images) {

            this.photoImage = this.photoImageOrig = images[this.src];

            this.bg.on('mousedown tap', function (e) {
                this.select();
            }.bind(this));

            this.updateOrder();

            this.applyProperties(function () {
                this._setFill();                         
                this.redraw();

                this.ready = true;
                this.fire('ready', this);
            });

        }.bind(this));
    },
    redraw: function () {
        this.drawStage();
    },
    select: function () {
        this.selected = true;
        this._super();
    },
    dispose: function () {
        this.bg.remove();
        this.drawStage();
    },
    getPhoto: function () {
        return this.src;
    },
    setPhoto: function (imgSrc) {
       
        this.loadImages([imgSrc], function (images) {
            //this.photoX = this.photoY = this.photoW = this.photoH = null;

            this.src = imgSrc;
            this.photoImage = this.photoImageOrig = images[imgSrc];
                    
            this.setFilter(this.filter, function () {
                this.redraw();
            }.bind(this));

        }.bind(this));
    },
    setFilter: function (config, callback) {
        // don't apply any filters when the device is slow
        if (environment.slow) {
            this.filter = null;
            this._setFill();
            callback(this);
            return;
        }

        var filters = [];
        if (config == null || config.name === 'none') {
            this.filter = null;
        } else {
            this.filter = config;
            filters[filters.length] = config;
        }
        
        this._applyFilters(this.photoImageOrig, filters, function (image) {
            this.photoImage = this.renderedImage = image;
            this._applyAdjustments(function () {
                this._setFill();
                callback(this);
            }.bind(this));
        }.bind(this));
    },
    getFilter: function () {
        return this.filter;
    },
    _applyAdjustments: function (callback) {
        var adjustments = [];
        if (this.contrast && this.contrast !== 0) {
            adjustments[adjustments.length] = { name: 'contrast', params: this.contrast };
        }
        if (this.brightness && this.brightness !== 0) {
            adjustments[adjustments.length] = { name: 'brightness', params: this.brightness };
        }
        this._applyFilters(this.renderedImage || this.photoImageOrig, adjustments, function (image) {
            this.photoImage = image;
            this._setFill();
            callback(this);
        }.bind(this));
    },
    setContrast: function (adjust, callback) {
        // don't apply contrast when the device is very slow
        if (environment.verySlow) {
            this.contrast = 0;
            callback(this);
            return;
        }

		this.contrast = adjust;
		this._applyAdjustments(callback);
	},
	getContrast: function() {
		return this.contrast || 0;
	},
	setBrightness: function (adjust, callback) {
	    // don't apply brightness when the device is very slow
	    if (environment.verySlow) {
	        this.brightness = 0;
	        callback(this);
	        return;
	    }

		this.brightness = adjust;
		this._applyAdjustments(callback);
	},
	getBrightness: function(callback) {
		return this.brightness || 0;
	},	
	setFrame: function (frameSrc, callback) {
	    
	    if (frameSrc == null) {
	        if (this.frame) {
	            this.frame.remove();
	            this.frame = null;
	            if (this.frameFillColor) { this.frameFillColor = null; }
	            this.redraw();
	        }
            callback(this);
            return;
        }

	    this.loadImages([frameSrc], function (images) {
	        this.frameSrc = frameSrc;
            if (!this.frame) {
                this.frame = new Kinetic.Image({
                    width: this.stageWidth,
                    height: this.stageHeight
                });                
                this.layer.add(this.frame);
                this.updateOrder();
            }

            this.frame.setImage(images[frameSrc]);
            this.frame.createImageHitRegion(function () {
                if (this.frameFillColor) {
                    this.setFrameFillColor(this.frameFillColor);
                }
                callback(this);
            }.bind(this));
        }.bind(this));
    },
    getFrame: function () {
        return (this.frame != null) ? this.frameSrc : null;
    },
    setFrameFillColor: function (color) {
        if (this.frame) {            
            this.frame.clearFilter();
            if (color == 'transparent') {
                this.frameFillColor = null;                
            } else {
                this.frameFillColor = color;
                this.frame.setFilterColorFill(color);
                this.frame.setFilter(Kinetic.Filters.ColorFill);
            }
        }
    },
    getFrameFillColor: function () {
        return this.frameFillColor;
    },
    updateOrder: function () {
        this.bg.moveToBottom();
        if (this.frame)
            this.frame.moveToTop();
    },
    //updateCrop: function (x, y, w, h) {
    //    this.photoX = x;
    //    this.photoY = y;
    //    this.photoW = w;
    //    this.photoH = h;

    //    this._setFill();
    //    this.drawStage();
    //},
    //getAspectRatio: function () {
    //    return (this.stageWidth / this.stageHeight);
    //},
    getProperties: function () {
        var cfg = [];
        if (this.filter) {
            cfg = cfg.concat(this._getPropertyConfig('Filter'));
        }

        if (this.frame) {
            cfg = cfg.concat(this._getPropertyConfig('Frame'));
        }

        if (this.frameFillColor) {
            cfg = cfg.concat(this._getPropertyConfig('FrameFillColor'));
        }
		
        if (this.contrast && this.contrast != 0) {
            cfg = cfg.concat(this._getPropertyConfig('Contrast'));
        }
		
        if (this.brightness && this.brightness != 0) {
            cfg = cfg.concat(this._getPropertyConfig('Brightness'));
        }

        return cfg;
    },
    getConfig: function () {
        return jQuery.extend({ src: this.src, zindex: 0 }, this._super());
    },
    _setFill: function () {
        //this.photoX = this.photoX || 0;
        //this.photoY = this.photoY || 0;
        //this.photoW = this.photoW || this.bg.getWidth();

        //if (this.photoW - this.photoX > this.photoImage.width)
        //    this.photoW = this.photoImage.width - this.photoX;

        //this.photoH = (this.bg.getHeight() * this.photoW) / this.bg.getWidth();

        //if (this.photoH - this.photoY > this.photoImage.height) {
        //    this.photoH = this.photoImage.height - this.photoY;
        //    this.photoW = (this.bg.getWidth() * this.photoH) / this.bg.getHeight();
        //}

        this.bg.setImage(this.photoImage);

        //this.bg.setCrop({
        //    x: this.photoX,
        //    y: this.photoY,
        //    width: this.photoW,
        //    height: this.photoH
        //});
    },
    _applyFilters: function (image, filters, callback) {

        if(filters == null || filters.length == 0){
            callback(image);
            return;
        }

        var canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        var scope = this;
        this.fire('progress-start', 'Applying Filters', this);
        Caman(canvas, image.src, function () {
            for(var i = 0; i <filters.length; ++i) { 
                this[filters[i].name](filters[i].params);
            }
            this.render(function (a) {
                var dataUrl = canvas.toDataURL();
                var imageObj = new Image();
                imageObj.onload = function () {
                    canvas = null;
                    callback(imageObj);
                    scope.fire('progress-complete', this);
                };
                imageObj.src = dataUrl;
            });
        });
    }
});