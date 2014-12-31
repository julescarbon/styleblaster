var nextTick = (function(){
  // postMessage behaves badly on IE8
  if (window.ActiveXObject || !window.postMessage) {
    var nextTick = function(fn) {
      setTimeout(fn, 0);
    }
  } else {
    // based on setZeroTimeout by David Baron
    // - http://dbaron.org/log/20100309-faster-timeouts
    var timeouts = []
      , name = 'next-tick-zero-timeout'

    window.addEventListener('message', function(e){
      if (e.source == window && e.data == name) {
        if (e.stopPropagation) e.stopPropagation();
        if (timeouts.length) timeouts.shift()();
      }
    }, true);

    var nextTick = function(fn){
      timeouts.push(fn);
      window.postMessage(name, '*');
    }
  }

  return nextTick;
})()

var Uid = (function(){
  var id = 0
  return function(){ return id++ + "" }
})()


var tokenize = (function(){
  var tokenize = function(str, splitOn){
    return str
             .trim()
             .split(splitOn || tokenize.default);
  };

  tokenize.default = /\s+/g;

  return tokenize;
})()

// globber("*".split(":"), "a:b:c".split(":")) => true
// globber("*:c".split(":"), "a:b:c".split(":")) => true
// globber("a:*".split(":"), "a:b:c".split(":")) => true
// globber("a:*:c".split(":"), "a:b:c".split(":")) => true

// based on codegolf.stackexchange.com/questions/467/implement-glob-matcher
var globber = function(patterns, strings) {
  // console.log("globber called with: " + patterns.join(":"), strings.join(":"))
  var first = patterns[0],
      rest = patterns.slice(1),
      len = strings.length,
      matchFound;

  if(first === '*') { 
    for(var i = 0; i <= len; ++i) {
      // console.log("* " + i + " trying " + rest.join(":") + " with " + strings.slice(i).join(":"))
      if(globber(rest, strings.slice(i))) return true;
    }
    return false;
  } else { 
    matchFound = (first === strings[0]);
    // console.log ("literal matching " + first + " " + strings[0] + " " + !!matched)
  }

  return matchFound && ((!rest.length && !len) || globber(rest, strings.slice(1)));
};

var setproto = function(obj, proto){
  if (obj.__proto__)
    obj.__proto__ = proto;
  else
    for (var key in proto)
      obj[key] = proto[key];
};


var Tube = (function(){
  var globcache = {};
  var Tube = function(opts){
    opts = opts || {};
    if (opts.queue){
      var c = function(){
        var args = arguments;
        // queueOrNextTick (function(){ c.send.apply(c, args) });
        nextTick (function(){ c.send.apply(c, args) });
        return c;
      };
    } else {
      var c = function(){
        c.send.apply(c, arguments);
        return c;
      };
    }

    setproto(c, Tube.proto);
    c.listeners = {};
    c.globListeners = {};

    return c;
  };

  Tube.total = {};
  Tube.proto = {};

  /*
  adds fns as listeners to a channel

  on("msg", fn, {opts})
  on("msg", [fn, fn2], {opts})
  on("msg msg2 msg3", fn, {opts})
  on({"msg": fn, "msg2": fn2}, {opts})
  */

  Tube.proto.on = function(){
    var chan = this;
    if (typeof arguments[0] === "string") { 
    //if (arguments.length > 1) {           // on("msg", f)
      var msgMap = {};
      msgMap[arguments[0]] = arguments[1];
      var opts = arguments[2] || {};
    } else {                              // on({"msg": f, ...})
      var msgMap = arguments[0];
      var opts = arguments[1] || {};
    }

    for (var string in msgMap){
      var msgs = string.split(" ");
      var fs = msgMap[string];
      if (!Array.isArray(fs)) fs = [fs];

      for(var i=0, f; f=fs[i]; i++){
        if (!f.uid) f.uid = Uid();
      }

      for(var i=0, msg; msg=msgs[i]; i++){
        var listeners = (msg.indexOf("*") === -1) ?
                          chan.listeners :
                          chan.globListeners;

        // todo: this probably wastes a lot of memory?
        // make a copy of the listener, add to it, and replace the listener
        // why not just push directly?
        // send might be iterating over it... and that will fuck up the iteration

        listeners[msg] = (msg in listeners) ?
                           listeners[msg].concat(fs) :
                           fs.concat();
      }
    }

    return chan;
  };

  /*
  off()
  off("a:b:c")
  off(f)
  off("a:b:c", f)
  off("a:b:c d:e:f")
  off([f, f2])
  off({"a": f, "b": f2})
  */

  Tube.proto.off = function(){ var chan = this;

    var listeners, i, msgs, msg;

    // off() : delete all listeners. but replace, instead of delete
    if (arguments.length === 0) { 
      chan.listeners = {};
      chan.globListeners = {};
      return chan;
    }

    // off("a:b:c d:e:f")
    // remove all matching listeners
    if (arguments.length === 1 && typeof arguments[0] === "string"){
      // question... will this fuck up send if we delete in the middle of it dispatching?
      msgs = arguments[0].split(" ");

      for (i=0; msg=msgs[i]; i++){
        delete chan.listeners[msg];
        delete chan.globListeners[msg];
      }
      return chan;
    }

    // off(f) or off([f, f2])
    // remove all matching functions
    if (typeof arguments[0] === "function" || Array.isArray(arguments[0])) {
      var fs = (typeof arguments[0] === "function") ? 
                 [arguments[0]] :
                 arguments[0];
      // TODO
      return chan;
    }

    // off("a:b:c", f) or off({"a": f, "b": f2})
    if (arguments.length > 1) {           // off("msg", f)
      var msgMap = {};
      msgMap[arguments[0]] = arguments[1];
    } else {                              // off({"msg": f, ...})
      var msgMap = arguments[0];
    }

    for (var string in msgMap){
      msgs = string.split(" ");

      var fs = msgMap[string];
      if (typeof fs === "function") fs = [fs];

      for(var i=0; msg=msgs[i]; i++){
        if (msg in chan.listeners)
          listeners = chan.listeners;
        else if (msg in chan.globListeners)
          listeners = chan.globListeners;
        else
          continue;

        // gotta do this carefully in case we are still iterating through the listener in send
        // build a new array and assign it to the property, instead of mutating it.

        // console.log(" length of listeners[" + msg + "]: " + listeners[msg].length)
        // console.log(listeners[msg].join(","));
        // console.log(fs.join(","));

        listeners[msg] = listeners[msg].filter(
                           function(f){ return fs.indexOf(f) === -1 }
                         );

        // console.log(" length of listeners[" + msg + "]: " + listeners[msg].length)

      }
    }

    return chan;

  };

  /*
  c = Tube()
  c.on("foo", fn)
  c("foo", "bar", [])

  will call fn("bar", [], "foo")
  */

  Tube.proto.send = function(msgString /*, data... */){
    // todo: don't do this?
    if (!Tube.total[msgString]) Tube.total[msgString] = 0
    Tube.total[msgString]+=1;

    var listener,
        listeners = this.listeners,
        globListeners = this.globListeners,
        //args = Array.prototype.splice.call(arguments, 1),
        msgs = tokenize(msgString),
        msg, f;

    if (arguments.length) {
      var args = Array.prototype.splice.call(arguments, 1);
      args.push(msgString);

    } else {
      var args = [];
    }

    for (var m=0; msg=msgs[m]; m++){

      var fsToRun = [];
      var uidKeyFnValue = {};
      var uidKeyMsgStringValue = {};

      // note this will die on errors
      // todo: implement http://dean.edwards.name/weblog/2009/03/callbacks-vs-events/
      // exact matches
      if (listener = listeners[msg]) {
        for (var i=0; f=listener[i]; i++){
            // fsToRun.push([f, msg]);
          uidKeyFnValue[f.uid] = f;
          uidKeyMsgStringValue[f.uid] = msg;
        }
      }

      // glob matches
      var msgSplit = msg.split(":");

      for (var pattern in globListeners){

        if (pattern !== "*") { // * always matches
          var patternSplit = globcache[pattern] || (globcache[pattern] = pattern.split(":"));
          if (!globber(patternSplit, msgSplit)) continue;
        }

        listener = globListeners[pattern];

        for (var i=0; f=listener[i]; i++){
          //f.apply(window, args); // hm possibly pass the actual message to the func
          // fsToRun.push([f, msg]);
          uidKeyFnValue[f.uid] = f;
          uidKeyMsgStringValue[f.uid] = msg;
        }
      }

      var fns = [];
      for (var f in uidKeyFnValue) fns.push(uidKeyFnValue[f]);

      for (var i=0, f; f=fns[i]; i++)
        f.apply(f, args);

    }
    return this;
  };

  return Tube;
})()

