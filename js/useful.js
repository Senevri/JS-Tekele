/* vim: set ts=4 sw=4 expandtab: */
$(document).ready(function () {
    "use strict";

    //IE7-8 fixes
    if("undefined" === typeof(console)) {
        console = { log: function() {} };
    }

    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (elt /*, from*/ ) {
            var len = this.length >>> 0;

            var from = Number(arguments[1]) || 0;
            from = (from < 0) ? Math.ceil(from) : Math.floor(from);
            if (from < 0) from += len;

            for (; from < len; from++) {
                if (from in this && this[from] === elt) return from;
            }
            return -1;
        };
    }
    if (undefined == String.prototype.splice) {
        String.prototype.splice = function (idx, rem, s) {
            return (this.slice(0, idx) + s + this.slice(idx + Math.abs(rem)));
        };
    }
    if (typeof String.prototype.trim !== 'function') {
        String.prototype.trim = function () {
            return this.replace(/^\s+|\s+$/g, '');
        }
    }

    // end fixes 
    
    // source: http://aymanh.com/9-javascript-tips-you-may-not-know
    function AssertException(message) { this.message = message; }
    AssertException.prototype.toString = function () {
        return 'AssertException: ' + this.message;
    }

    function assert(exp, message) {
        if (!exp) {
            throw new AssertException(message);
        }
    }

    var include = function (arr, obj) {
            return (arr.indexOf(obj) != -1);
    }
    // shim layer with setTimeout fallback
    window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
    })();
 
 
    // usage: 
    // instead of setInterval(render, 16) ....
 
    //(function animloop(){
    //  requestAnimFrame(animloop);
    //  render();
    //})();
    // place the rAF *before* the render() to assure as close to 
    // 60fps with the setTimeout fallback.
});

