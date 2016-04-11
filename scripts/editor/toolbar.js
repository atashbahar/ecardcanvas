var Toolbar = BaseObject.extend({
    init: function (config) {
        this._super(config);
        this.scroller = new IScroll(this.container, { scrollX: true, scrollY: false, tap: true, mouseWheel: true, mouseWheelSpeed: 40 });

        var that = this;

        $(this.container + ' li').on('tap', function () {
            that._clicked($(this));
        });
    },
    _clicked: function (item) {        
        if (this.scroller.moved) { return false; }

        if (item.hasClass('disabled'))
            return false;

        if (item.hasClass('active')) {
            this.panManager.close();
            item.removeClass('active');
            return;
        }

        var method = item.attr('data-ecc-method')
        , id = item.attr('data-ecc-id')
        , selected = this.card.getSelected();
        

        this.panManager.close();
        $('.editor-tools li').removeClass('active');
        if (id) { $('.editor-tools li[data-ecc-id=' + id + ']').addClass('active'); }

        switch (method) {
            case "deleteShape":
                this.card.deleteItem(selected);
                break;

            case "moveToTop":
                this.card.moveTop(selected);
                break;

            case "moveToBottom":
                this.card.moveToBottom(selected);
                break;

            case "showProperty":
                this.panManager.show(selected, id);
                break;

            case "editText":
                this.panManager.editText(selected);
                break;

            case "flipHorizontal":
                selected.setProperty("FlipHorizontal", null, function () {
                    selected.redraw();
                });
                break;
        }
    },
    update: function (type) {
        //$(this.container).css('left', '0px');
        $(this.container + ' li').each(function (index) {
            var att = $(this).attr('data-ecc-type');

            if (!att) return;
            
            if (att.indexOf(type) != -1) {
                $(this).removeClass('disabled');
                $(this).show();
            } else if (att.indexOf('all') != -1) {
                $(this).addClass('disabled');
                $(this).show();
            } else {
                $(this).hide();
            }
        });
        if (environment.verySlow) {            
            $('.editor-toolbar li[data-ecc-id="Brightness"]').hide();
            $('.editor-toolbar li[data-ecc-id="Contrast"]').hide();
        }
        if (environment.slow) {
            $('.editor-toolbar li[data-ecc-id="Filter"]').hide();
        }
        this._updateScroller();
    },
    _updateScroller: function () {
        var tb = $(this.container);
        var items = tb.find('li').filter(':visible');
        tb.find('ul').width(items.length * items.first().width());
        this.scroller.refresh();
    }
});