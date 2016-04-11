/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function () {
    var initializing = false, fnTest = /xyz/.test(function () { xyz; }) ? /\b_super\b/ : /.*/;
    // The base Class implementation (does nothing)
    this.Class = function () { };

    // Create a new Class that inherits from this class
    Class.extend = function (prop) {
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] == "function" &&
              typeof _super[name] == "function" && fnTest.test(prop[name]) ?
              (function (name, fn) {
                  return function () {
                      var tmp = this._super;

                      // Add a new ._super() method that is the same method
                      // but on the super-class
                      this._super = _super[name];

                      // The method only need to be bound temporarily, so we
                      // remove it when we're done executing
                      var ret = fn.apply(this, arguments);
                      this._super = tmp;

                      return ret;
                  };
              })(name, prop[name]) :
              prop[name];
        }

        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if (!initializing && this.init)
                this.init.apply(this, arguments);
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this class extendable
        Class.extend = arguments.callee;

        return Class;
    };
})();

$.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

Array.prototype.remove = function () {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

Function.prototype.bind = function (scope) {
    var _function = this;

    return function () {
        return _function.apply(scope, arguments);
    }
}

String.prototype.startsWith = function (str) {
    return this.indexOf(str) == 0;
};

String.prototype.format = function () {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined'
      ? args[number]
      : match;
    });
};


$.extend($.easing,
{
    def: 'easeOutQuad',
    swing: function (x, t, b, c, d) {
        //alert($.easing.default);
        return $.easing[$.easing.def](x, t, b, c, d);
    },
    easeInQuad: function (x, t, b, c, d) {
        return c * (t /= d) * t + b;
    },
    easeOutQuad: function (x, t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    },
    easeInOutQuad: function (x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t + b;
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    },
    easeInCubic: function (x, t, b, c, d) {
        return c * (t /= d) * t * t + b;
    },
    easeOutCubic: function (x, t, b, c, d) {
        return c * ((t = t / d - 1) * t * t + 1) + b;
    },
    easeInOutCubic: function (x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t + 2) + b;
    },
    easeInQuart: function (x, t, b, c, d) {
        return c * (t /= d) * t * t * t + b;
    },
    easeOutQuart: function (x, t, b, c, d) {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    },
    easeInOutQuart: function (x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
    },
    easeInQuint: function (x, t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b;
    },
    easeOutQuint: function (x, t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    },
    easeInOutQuint: function (x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    },
    easeInSine: function (x, t, b, c, d) {
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
    },
    easeOutSine: function (x, t, b, c, d) {
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
    },
    easeInOutSine: function (x, t, b, c, d) {
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    },
    easeInExpo: function (x, t, b, c, d) {
        return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
    },
    easeOutExpo: function (x, t, b, c, d) {
        return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
    },
    easeInOutExpo: function (x, t, b, c, d) {
        if (t == 0) return b;
        if (t == d) return b + c;
        if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
        return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
    },
    easeInCirc: function (x, t, b, c, d) {
        return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
    },
    easeOutCirc: function (x, t, b, c, d) {
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    },
    easeInOutCirc: function (x, t, b, c, d) {
        if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    },
    easeInElastic: function (x, t, b, c, d) {
        var s = 1.70158; var p = 0; var a = c;
        if (t == 0) return b; if ((t /= d) == 1) return b + c; if (!p) p = d * .3;
        if (a < Math.abs(c)) { a = c; var s = p / 4; }
        else var s = p / (2 * Math.PI) * Math.asin(c / a);
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    },
    easeOutElastic: function (x, t, b, c, d) {
        var s = 1.70158; var p = 0; var a = c;
        if (t == 0) return b; if ((t /= d) == 1) return b + c; if (!p) p = d * .3;
        if (a < Math.abs(c)) { a = c; var s = p / 4; }
        else var s = p / (2 * Math.PI) * Math.asin(c / a);
        return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
    },
    easeInOutElastic: function (x, t, b, c, d) {
        var s = 1.70158; var p = 0; var a = c;
        if (t == 0) return b; if ((t /= d / 2) == 2) return b + c; if (!p) p = d * (.3 * 1.5);
        if (a < Math.abs(c)) { a = c; var s = p / 4; }
        else var s = p / (2 * Math.PI) * Math.asin(c / a);
        if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
    },
    easeInBack: function (x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },
    easeOutBack: function (x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
    easeInOutBack: function (x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
    },
    easeInBounce: function (x, t, b, c, d) {
        return c - $.easing.easeOutBounce(x, d - t, 0, c, d) + b;
    },
    easeOutBounce: function (x, t, b, c, d) {
        if ((t /= d) < (1 / 2.75)) {
            return c * (7.5625 * t * t) + b;
        } else if (t < (2 / 2.75)) {
            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
        } else if (t < (2.5 / 2.75)) {
            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
        } else {
            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
        }
    },
    easeInOutBounce: function (x, t, b, c, d) {
        if (t < d / 2) return $.easing.easeInBounce(x, t * 2, 0, c, d) * .5 + b;
        return $.easing.easeOutBounce(x, t * 2 - d, 0, c, d) * .5 + c * .5 + b;
    }
});


(function () {
    Kinetic.Filters.Threshold = function (imageData, config) {
        var d = imageData.data;
        for (var i = 0; i < d.length; i += 4) {
            var v = (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2] >= config.val) ? 255 : 0;
            d[i] = d[i + 1] = d[i + 2] = v;
        }
    };
})();

(function () {
    Kinetic.Filters.Sepia = function (imageData, config) {
        var d = imageData.data;
        for (var i = 0; i < d.length; i += 4) {

            var or = d[i];
            var og = d[i + 1];
            var ob = d[i + 2];

            var r = (or * 0.393 + og * 0.769 + ob * 0.189);
            var g = (or * 0.349 + og * 0.686 + ob * 0.168);
            var b = (or * 0.272 + og * 0.534 + ob * 0.131);

            if (r < 0) r = 0; if (r > 255) r = 255;
            if (g < 0) g = 0; if (g > 255) g = 255;
            if (b < 0) b = 0; if (b > 255) b = 255;

            d[i] = r;
            d[i + 1] = g;
            d[i + 2] = b;
        }
    };
})();

(function () {
    Kinetic.Filters.ColorFill = function (imageData) {
        var fillColor = this.getFilterColorFill();
        var rgb = Kinetic.Util.getRGB(fillColor);
        var data = imageData.data;
        for (var i = 0; i < data.length; i += 4) {
            data[i] = rgb.r;
            data[i + 1] = rgb.g;
            data[i + 2] = rgb.b;
        }
    };

    Kinetic.Factory.addFilterGetterSetter(Kinetic.Image, 'filterColorFill', '#000000');
})();



/* This file is in the public domain. Peter O., 2012. http://upokecenter.dreamhosters.com 
    Public domain dedication: http://creativecommons.org/publicdomain/zero/1.0/legalcode  */

/* NOTE: Currently supports lines only */

function RectAccum() {
    this.left = 0;
    this.top = 0;
    this.right = 0;
    this.bottom = 0;
    this.startX = true;
    this.startY = true;
}
RectAccum.prototype = {
    width: function () {
        return this.right - this.left
    },
    height: function () {
        return this.bottom - this.top
    },
    addX: function (x) {
        this.left = (this.startX) ? x : Math.min(x, this.left);
        this.right = (this.startX) ? x : Math.max(x, this.right);
        this.startX = false;
    },
    addY: function (y) {
        this.top = (this.startY) ? y : Math.min(y, this.top);
        this.bottom = (this.startY) ? y : Math.max(y, this.bottom);
        this.startY = false;
    },
    addXY: function (x, y) {
        this.addX(x); this.addY(y);
    }
}


function getPathDimensions(path) {
    var data = path.dataArray;
    var ra = new RectAccum();
    for (var i = 0; i < data.length; i++) {
        //switch (data[i].command) {
        //    case "L":
        //        ra.addXY(data[i].start.x, data[i].start.y);
        //        ra.addXY(data[i].points[0], data[i].points[1]);
        //        break;
        //}
        if (data[i].pathLength > 0) {
            ra.addXY(data[i].start.x, data[i].start.y);
            ra.addXY(data[i].points[0], data[i].points[1]);
        }
    }
    return { left: ra.left, top: ra.top, width: ra.width(), height: ra.height() }
}

function getImageSize(img) {
    var theImage = new Image();
    theImage.src = img.src;
    return { width: theImage.width, height: theImage.height };
}

function resizeImage(imageData, width, height, callback) {
    var image = new Image();
    image.onload = function () {
        
        var w = width;
        var h = Math.floor((image.height * width) / image.width);
        if (h > height) {
            var w = Math.floor((image.width * height) / image.height);
            var h = height;
        }

        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;

        
        var context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, w, h);
        var dataUrl = canvas.toDataURL('image/jpeg', 0.84);
        callback(dataUrl);
    }
    image.src = imageData;
}

function rotateImage(image, deg) {

    var radians = deg * Math.PI / 180;
    var size = getImageSize(image);
    var nw = Math.ceil(Math.abs(size.width * Math.cos(radians) + size.height * Math.sin(radians)));
    var nh = Math.ceil(Math.abs(size.width * Math.sin(radians) + size.height * Math.cos(radians)));
    var canvas = document.createElement('canvas');
    canvas.width = nw;
    canvas.height = nh;

    var context = canvas.getContext('2d');

    context.translate(nw / 2, nh / 2);
    context.rotate(deg * Math.PI / 180);
    context.translate(-1 * size.width / 2, -1 * size.height / 2);
    context.drawImage(image, 0, 0);

    return canvas.toDataURL();
}


function flipHorizontal(image) {
    var size = getImageSize(image);
    canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    var ctx = canvas.getContext('2d');

    ctx.translate(size.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(image, 0, 0);

    return canvas.toDataURL();
}

function flipVertical(image) {
    var size = getImageSize(image);
    canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    var ctx = canvas.getContext('2d');

    ctx.translate(0, size.height);
    ctx.scale(1, -1);
    ctx.drawImage(image, 0, 0);

    var dataUrl = canvas.toDataURL();
    return dataUrl;
}

// needed by Camanjs to operate on some browsers
(function () {
    try {
        var a = new Uint8Array(1);
        return; //no need
    } catch (e) { }

    function subarray(start, end) {
        return this.slice(start, end);
    }

    function set_(array, offset) {
        if (arguments.length < 2) offset = 0;
        for (var i = 0, n = array.length; i < n; ++i, ++offset)
            this[offset] = array[i] & 0xFF;
    }

    // we need typed arrays
    function TypedArray(arg1) {
        var result;
        if (typeof arg1 === "number") {
            result = new Array(arg1);
            for (var i = 0; i < arg1; ++i)
                result[i] = 0;
        } else
            result = arg1.slice(0);
        result.subarray = subarray;
        result.buffer = result;
        result.byteLength = result.length;
        result.set = set_;
        if (typeof arg1 === "object" && arg1.buffer)
            result.buffer = arg1.buffer;

        return result;
    }

    window.Uint8Array = TypedArray;
    window.Uint32Array = TypedArray;
    window.Int32Array = TypedArray;
})();


/**
 * jQuery.browser.mobile (http://detectmobilebrowser.com/)
 *
 * jQuery.browser.mobile will be true if the browser is a mobile device
 *
 **/
(function (a) { (jQuery.browser = jQuery.browser || {}).mobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)) })(navigator.userAgent || navigator.vendor || window.opera);

// Detect file input support
var isFileInputSupported = (function () {
    // Handle devices which falsely report support
    if (navigator.userAgent.match(/(Android (1.0|1.1|1.5|1.6|2.0|2.1))|(Windows Phone (OS 7|8.0))|(XBLWP)|(ZuneWP)|(w(eb)?OSBrowser)|(webOS)|(Kindle\/(1.0|2.0|2.5|3.0))/)) {
        return false;
    }
    // Create test element
    var el = document.createElement("input");
    el.type = "file";
    return !el.disabled;
})();

var hasTouch = window.navigator.msMaxTouchPoints || Modernizr.touch;