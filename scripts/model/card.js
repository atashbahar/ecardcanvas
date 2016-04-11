var Card = BaseObject.extend({
    init: function (config) {
        
        this._super(config);

        this.stage = new Kinetic.Stage({
            container: this.container,
            width: this.width,
            height: this.height,
            scale: {
                x: this.scale,
                y: this.scale
            }
        });

        this.layer = new Kinetic.Layer();
        this.stage.add(this.layer);

        this.progressbar = new ProgressBar({
            elem: this.progress
        });

        this.items = [];
    },
    setWidth: function (width) {
        if (width > 600) { width = 600; }
        this.scale = width / 800;
        this.width = width;
        this.height = (width * 600) / 800;
        this.stage.setSize(this.width, this.height);
        this.stage.setScale(this.scale);
        this.stage.getContainer().style.height = this.height + 'px';
    },
    drawItemById: function(id) {
        var cfg = this.getItemConfig(id);
        return this.drawItem(cfg);
    },
    drawItem: function (cfg) {
        cfg['layer'] = this.layer;
        cfg['stageWidth'] = this.width / this.scale;
        cfg['stageHeight'] = this.height / this.scale;

        // change the id to a unique id so no two objects would have  the same id
        do {
            cfg.id = Math.floor(Math.random() * 10000);
        }
        while (this.getItemById(cfg.id) !== null);

        var item = null;
        switch (cfg.type) {
            case 'clipart':
                item = new Clipart(cfg);
                break;
            case 'photo':
                item = new Photo(cfg);
                break;
            case 'text':
                item = new Text(cfg);
                break;
            case 'background':
                item = new Background(cfg);
                break;
        }

        this.addItemToCard(item);

        return item;
    },
    getItemById: function (id) {
        for (var i = 0; i < this.items.length; ++i) {
            if (id === this.items[i].id)
                return this.items[i];
        }
        return null;
    },
    addItemToCard: function(item) {
        this.items[this.items.length] = item;
        item.on('select', function () {
            this.deselctAll(item.id);
            //updateToolbar(shape.type);
            this.fire('item-selected', item);
        }.bind(this));

        item.on('progress-start', function (msg) {
            this.progressbar.show(msg);
        }.bind(this));

        item.on('progress-complete', function () {
            this.progressbar.hide();
        }.bind(this));

        // we bind to this event only to figure out when all the items on
        // the card are ready so we can fire the ready event for the card
        item.on('ready', function () {
            for (var i = 0; i < this.items.length; ++i) {
                if (!this.items[i].ready) {
                    return false;
                }
            }
            this.fire('ready', this);
        }.bind(this));
		
        item.on('error', function (msg) {
            alert(msg);
        }.bind(this));		

        if (item.type !== 'background')
            this.updateBackgroundOrder();

        item.draw();
    },
    getItemConfig: function (id) {
        for (var i = 0; i < shapes.length; ++i) {
            if (shapes[i].id == id) {
                return jQuery.extend(true, {}, shapes[i]); // deep copy the object
            }
        }
    },
    deleteItem: function(item) {
        item.dispose();
        this.items.remove(item);
        this.getBackground().select();
    },
    deleteItemType: function (type) {
        for (var i = 0; i < this.items.length; ++i) {
            if (this.items[i].type == type) {
                this.deleteItem(this.items[i]);
            }
        }
    },
    deselctAll: function (id) {
        $.each(this.items, function (index, item) {
            if(item.id !== id) item.deselect();
        });

        this.fire('deselect-all', this);

        this.stage.draw();
    },
    getSelected: function () {
        var sel = null;
        $.each(this.items, function (index, item) {
            if (item.selected) {
                sel = item;
            }
        });
        return sel;
    },
    moveTop: function (item) {
        item.moveToTop();
        this.updateBackgroundOrder();
        this.stage.draw();
    },
    moveToBottom: function (item) {
        item.moveToBottom();
        this.updateBackgroundOrder();
        this.stage.draw();
    },
    updateBackgroundOrder: function () {
        this.getBackground().updateOrder();
    },
    getBackground: function () {
        for (var i = 0; i < this.items.length; ++i) {
            if (this.items[i].type == 'background')
                return this.items[i];
        }
    },
    toDataUrl: function (callback) {
        // resize the satage to maximum size before saving it
        // we also have to resize the canvas and #cotainer width and height
        // so user won't see the change
        this.stage.setSize(800, 600);
        this.stage.setScale(1, 1);
        this.stage.draw();

        this.deselctAll();

        this.stage.toDataURL({
            mimeType: 'image/jpeg',
            quality: 0.9,
            callback: function (dataUrl) {

                // restore stage size to original
                this.stage.setSize(this.width, this.height);
                this.stage.setScale(this.scale, this.scale);
                this.stage.draw();

                callback(dataUrl);
            }.bind(this)
        });
    },
    getCardConfig: function () {
        var cardConfig = [];
        for (var i = 0; i < this.items.length; ++i) {
            cardConfig[cardConfig.length] = this.items[i].getConfig();
        }
        return JSON.stringify(cardConfig);
    },
    getDescription: function () {
        var desc = "";
        for (var i = 0; i < this.items.length; ++i) {
            if (this.items[i].type == 'text') {
                desc += this.items[i].getText();
                if (i + 1 < this.items.length)
                    desc += '\n';
            }
        }
        return desc.substring(0, 400);
    },
    loadCardConfig: function (cardConfig) {
        cardConfig.sort(function (a, b) {
            return a.zindex - b.zindex;
        });

        for (var i = 0; i < cardConfig.length; ++i) {
            var item = this.drawItem(cardConfig[i]);
            if (item.type == 'background')
                item.select();
        }
    }
});