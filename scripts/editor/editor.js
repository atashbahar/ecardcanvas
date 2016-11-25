$(function () {

    if (!Modernizr.canvas || !Modernizr.canvastext || !Modernizr.fontface) {
        $('.editor-not-supported').show();
        $('.editor').hide();
        return;
    }

    var card = new Card({
        container: "editor-canvas-container",
        width: 600,
        height: 450,
        scale: 0.75,
        progress: ".editor-progress"
    });
	
	var wm = new WinManager({
	    container: '.editor',
		shapes: shapes,
		card: card
	});
	
	var pm = new PanManager({
	    container: ".editor-pans",
		propertySettings: propertySettings,
		card: card,
        winManager: wm
	});

	var tb = new Toolbar({
	    container: '.editor-toolbar',
	    panManager: pm,
        card: card
	});

    card.on('deselect-all', function () {
        pm.close();
        tb.update();
    });

    card.on('item-selected', function (item) {
        tb.update(item.type);
    });
    
    $('.editor-navbar li').click(function () {
        var type = $(this).attr('data-ecc-id');
        var title = $(this).text();
        wm.shapeSelector(type, title);
    });

    $('.card-save-form button.save').click(function () {
		alert('Please update the save form post url');
        var btn = $(this);
        btn.attr('disabled', 'disabled');
        $('.save-progress').show();
        $('.status-error').hide();
        card.toDataUrl(function (d) {
            $("#photo").val(d);
            $("#definition").val(card.getCardConfig());
            $("#Description").val(card.getDescription());
            $.ajax({
                type: 'POST',
                url: environment.saveUrl,
                dataType: 'json',
                cache: false,
                data: $('.card-save-form form').serialize()
            }).done(function (msg) {
                if (msg.success) {
                    window.location = msg.redirect;
                } else {
                    showSaveError(msg.message);
                }
            }).fail(function (jqXHR, textStatus) {
                showSaveError("Request failed: " + textStatus);
            });
        });

        return false;
    });

    $('.card-save-form-download a').click(function (e) {
        e.preventDefault();
        card.toDataUrl(function (d) {
			window.open(d);
        });        
    });

    function speedTest(callback) {
        var img = new Image();        
        img.onload = function () {
            var cv = document.createElement('canvas');
            var start = new Date();
            Caman(cv, img.src, function () {
                this.sinCity();
                this.render(function () {
                    callback(new Date() - start);
                    cv = null;
                    img = null;
                });
            });
        };
        img.src = environment.contentPath + "misc/speed_test.jpg";
    }

    function initilize() {
        var cardConfig = environment.cardConfig;
        // If this is a reload try to load card config from local storage
        var hash = window.location.hash;
        var restore = (hash == "#edit" || hash == "#save");
        if (restore && localStorage['card'] != null) {
            var localConfig = JSON.parse(localStorage['card']);
            if (localConfig.length > 0) {
                cardConfig = localConfig;
            }
        }

        // we add this to the end of url so if user reloads it we load it from local storage
        //window.location.hash = restore ? "" : "#edit";

        card.on('ready', function () {
            // show save dialog
            if (hash == "#save") {
                wm.saveCard();                
            }
            window.location.hash = "#edit";
        });

        speedTest(function (speed) {
            environment.slow = (speed > 500);
            environment.verySlow = (speed > 1000);
            card.loadCardConfig(cardConfig);
            card.setWidth($(window).width());

            $('#joyRideTipContent').joyride({
                autoStart: true,
                cookieMonster: true
            });
        });
    }

    function showSaveError(msg) {
        $('.card-save-form button').removeAttr('disabled');
        $('.save-progress').hide();
        $('.status-error').html(msg).show();
    }

    $(window).unload(function () {
        // save to local storage for later use
        localStorage['card'] = card.getCardConfig();
    });

    $(window).resize(function () {
        card.setWidth($(this).width());
    });

    initilize();
});