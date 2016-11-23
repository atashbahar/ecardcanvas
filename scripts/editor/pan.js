var PanManager = BaseObject.extend({
    init: function (config) {
        this._super(config);

        var that = this;

        $(document).on('click', '.editor-prop-pan .cancel', function () { that.close() });

        $(document).on('click', '.editor-pan-nav a', function (e) {
            e.preventDefault();
            var pan = $(this).parents('.editor-pan');
            var content = pan.find('.editor-pan-content').removeClass('active').filter($(this).attr('href')).addClass('active');
            pan.find('.editor-pan-nav li').removeClass('active')
            $(this).parents('li').addClass('active');            
            that._refreshScroller(content);
        });
    },
    show: function (item, type) {
        var pan = $('.editor-prop-pan-' + type);
        
        if (pan.length === 0) {
            for (var i = 0; i < this.propertySettings.length; ++i) {
                if (this.propertySettings[i].type == type) {
                    pan = this.drawPropertyPan(propertySettings[i]);
                    break;
                }
            }
        }

        // handle .selected and active tab stuff
        var contents = pan.find('.editor-pan-content').removeClass('active');
        contents.each(function (index) {
            var c = $(this);
            var val = item.getProperty(c.data('type'));
            if (c.hasClass('user-photo-selector')) {
                c.find('input').val('');
            } else if (c.hasClass('color')) {
                c.find('input').spectrum("set", val || '#000');
            } else if (c.hasClass('range')) {
                c.find('.range-slider').val(val || 0);
            } else if (c.hasClass('double-range')) {
                c.find('.range-slider-one').val(val[0] || 0);
                c.find('.range-slider-two').val(val[1] || 0);
            } else {
                c.find('li').removeClass('selected');
                if (val) {
                    c.find('li').each(function (index, elem) {                        
                        if (JSON.stringify($(elem).data('val')) === JSON.stringify(val)) {
                            $(elem).addClass('selected');
                        }
                    });
                }
            }
        });

        pan.find('.editor-pan-nav li').removeClass('active').first().addClass('active');
        var content = contents.first().addClass('active');
        pan.hide().fadeIn('fast');
        this._refreshScroller(content);
    },
    close: function () {
        $('.editor-pan').fadeOut('fast');
        $('.editor-toolbar li').removeClass('active');
        return false;
    },
    drawPropertyPan: function (propSetting) {
        
        var pan = $('<div class="editor-pan editor-prop-pan editor-prop-pan-' + propSetting.type + '"></div>').appendTo(this.container);
        var body = $('<div class="editor-pan-body"></div>').appendTo(pan);

        var tabs = [];
        if (propSetting.items) {
            for (var i = 0; i < propSetting.items.length; ++i) {
                var id = 'editor_pan_content_' + propSetting.items[i].type + '_' + i;
                tabs[tabs.length] = { id: id, title: propSetting.items[i].title };
                this.drawPropertyContent(id, propSetting.items[i], body);
            }
        } else {
            this.drawPropertyContent('editor_pan_content_' + propSetting.type, propSetting, body);
        }

        var nav = $('<div class="editor-pan-nav border-box"></div>').appendTo(pan);

        if (tabs.length > 1) {
            var nav = $('<ul></ul>').appendTo(nav);
            $.each(tabs, function (index, item) {
                $('<li class="border-box"><a href="#' + item.id + '">' + item.title + '</a></li>').appendTo(nav);
            });
        }

        return pan;
    },
    drawPropertyContent: function (id, propSetting, parent) {
        var content = $('<div class="editor-pan-content editor-pan-content-{0}" id="{1}"></div>'.format(propSetting.type.toLowerCase(), id)).data('type', propSetting.type).appendTo(parent);
        if (propSetting.data instanceof Array) {
            this.drawPropertyListSelector(propSetting, content);
        } else if (propSetting.data instanceof Object) {
            content.addClass(propSetting.data.type);
            switch (propSetting.data.type) {
                case 'color':
                    this.drawPropertyColorSelector(propSetting.type, propSetting.data, content);
                    break;
                case 'range':
                    this.drawPropertyRangeSelector(propSetting.type, propSetting.data, content, false);
                    break;
                case 'double-range':
                    this.drawPropertyRangeSelector(propSetting.type, propSetting.data, content, true);
                    break;
                case 'user-photo':
                    this.drawPropertyUserPhotoSelector(propSetting.type, propSetting.data, content);
                    break;
            }
        }

        content.hide();
    },

    drawPropertyListSelector: function (propSetting, parent) {
        var ul = $('<ul></ul>').appendTo(parent);
        for (var i = 0; i < propSetting.data.length; ++i) {
            var data = propSetting.data[i];
            var elem = $('<li class="property-item border-box"><div class="thumb thumb-{1}-{2}">&nbsp;</div><div class="label border-box"><span>{0}</span></div></li>'.format(data.title, propSetting.type.toLowerCase(), data.title.toLowerCase().replace(" ", "-"))).data('val', data.value).appendTo(ul);

            if (propSetting.thumb)
                elem.addClass('property-item-image').find('.thumb').html('').append('<img class="lazy" data-original="' + environment.assetThumbPath.format(data.value) + '" src="' + environment.contentPath + 'misc/grey.gif" alt="' + data.title + '" />');
        }

        this.drawPropertyCarousel(ul, parent, data.length);
        
        var $this = this;
        ul.find('li').on('tap', function (elem) {
            if (parent.data('scroller').moved) { return false; }
            $(this).parents('.editor-prop-pan').find('.editor-pan-content-' + propSetting.type.toLowerCase() + ' li').removeClass('selected');
            $(this).addClass('selected');
            $this.applyProperty(propSetting.type, $(this).data('val'));
        });
    },

    _loadThumbs: function () {
        $("img.lazy").lazyload();
    },
    _refreshScroller: function (scrollerContainer) {
        var scroller = scrollerContainer.data('scroller');
        if (scroller) {
            scroller.refresh()
            this._loadThumbs();
        }
    },
    drawPropertyColorSelector: function (type, data, parent) {
        var colorList = ['#000000', '#ffffff', '#f6311d', '#f7663c', '#f89a3c', '#f9ce3c', '#fcff3d', '#41ff34', '#249b33', '#2b61cb', '#3e00cb', '#380098', '#650098', '#9700cb', '#f8639b', '#f81ecd', '#f7289b', '#f62e6a', '#000000', '#444444', '#777777', '#878787', '#aaaaaa', '#bababa', '#dddddd', '#ffffff'];

        var ul = $('<ul></ul>').appendTo(parent);
        if (data.transparent) {
            ul.append('<li class="property-item color-item color-transparent border-box" data-val="transparent"><div class="thumb">&nbsp;</div><div class="label border-box"><span>Transparent</span></div></li>');
        }

        var li = $('<li class="property-item color-item color-item-selector border-box"></li>').appendTo(ul)
        var colorInput = $('<input type="text" />').appendTo(li);
        $('<div class="label border-box"><span>Select Color</span></div>').appendTo(li);

        var $this = this;

        colorInput.spectrum({
            color: "#000",
            showButtons: false,
            move: function (color) {
                $this.applyProperty(type, color.toHexString());
            }.bind(this)
        });

        for (var i = 0; i < colorList.length; ++i) {
            ul.append('<li class="property-item color-item border-box" data-val="{0}"><div class="thumb" style="background-color:{0}">&nbsp;</div><div class="label border-box"><span>{0}</span></div></li>'.format(colorList[i]));
        }

        this.drawPropertyCarousel(ul, parent, colorList.length);

        parent.find('.color-item').on('tap', function () {
            if (parent.data('scroller').moved) { return false; }
            $this.applyProperty(type, $(this).attr('data-val'));
        });
    },
    drawPropertyCarousel: function (ul, parent, length) {

        var scroller = new IScroll(parent.get(0), { scrollX: true, scrollY: false, tap: true, mouseWheel: true, mouseWheelSpeed: 40, scrollbars: 'custom', interactiveScrollbars: true });

        var width = 0;
        ul.find('li').each(function () {
            width += $(this).outerWidth();
        });
        ul.width(width + 30);

        parent.data('scroller', scroller);
        
        scroller.on('scrollEnd', function () {
            this._loadThumbs();
        }.bind(this));
    },
    drawPropertyRangeSelector: function (type, data, parent, double) {
        var wrap = $('<div class="editor-pan-slider"></div>').appendTo(parent);
        wrap.append('<p>' + data.tip + '</p>');
        var slider1 = $('<div class="noUiSlider range-slider range-slider-one"></div>').appendTo(wrap);
        $('<span class="min">Min</span>').insertBefore(slider1);
        $('<span class="max">Max</span>').insertAfter(slider1);
        var sliderVal = null;
        if (data.serialize)
            sliderVal = $('<input type="text" readonly="readonly" />').appendTo(wrap);
        var slider2 = null;
        if (double) {
            wrap.addClass('editor-pan-slider-double');
            slider2 = $('<div class="noUiSlider range-slider range-slider-two"></div>').appendTo(wrap);
            $('<span class="min">Min</span>').insertBefore(slider2);
            $('<span class="max">Max</span>').insertAfter(slider2);
        }
        parent.find('.range-slider').noUiSlider({
            range: [data.min, data.max],
            step: data.step,
            start: data.start,
            handles: 1,
            slide: function (e) {
                this.applyProperty(type, double ? [slider1.val(), slider2.val()] : slider1.val());
            }.bind(this),
            serialization: {
                to: data.serialize ? sliderVal : false,
                resolution: data.step
            }
        });
    },
    drawPropertyUserPhotoSelector: function (type, data, parent) {
        var wrap = $('<div class="user-photo-selector"></div>').appendTo(parent);
        if (window.File && window.FileReader && window.FileList && window.Blob && isFileInputSupported) {
            wrap.append('<p>Select your photo:</p>');

            var fileInput = $('<input type="file" size="30" id="photo_custom_input" />').appendTo(wrap);

            var that = this;
            var processLocalFiles = function (files) {
                for (var i = 0, f; f = files[i]; i++) {

                    if (!f.type.match('image.*')) { continue; }

                    var reader = new FileReader();
                    reader.onload = (function (theFile) {
                        return function (e) {
                            // the only way to reset the value of the file input in ie
                            // is to replace it with a new control
                            fileInput.replaceWith(fileInput = fileInput.clone(true));
                            that.close();
                            that.winManager.cropPhoto(e.target.result);
                        };
                    })(f);
                    reader.readAsDataURL(f);
                }
            };

            fileInput.appendTo(wrap).on('change', function (evt) {
                processLocalFiles(evt.target.files);
            });
        } else {
            wrap.append('<div>The <a href="http://en.wikipedia.org/wiki/HTML5_File_API">HTML5 File API</a> is not supported in this browser. Please upgrade your browser to a more recent one!</div>');
        }
    },
    applyProperty: function (type, value) {
        var sel = this.card.getSelected();
        sel.setProperty(type, value, function () {
            sel.redraw();
        });
    },
    editText: function (item) {
        var pan = $('.editor-pan-edit-text');

        if (pan.length === 0) {
            pan = $('<div class="editor-pan editor-prop-pan editor-pan-edit-text"></div>').appendTo(this.container).hide();
            var b = $('<div class="editor-pan-body"></div>').appendTo(pan);
            var content = $('<div class="editor-pan-content border-box active"><textarea rows="4" cols="50"></textarea></div>').appendTo(b);
        }

        $('.editor-pan-edit-text textarea').val(item.title);

        $('.editor-pan-edit-text textarea').bind("input paste", function () {
            item.setText($(this).val())
        });

        pan.show();
    }
});