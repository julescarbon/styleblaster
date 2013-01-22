
function month(m) {
  return MONTHS[m];
}
function merid(h) {
  return h < 12 ? "<small>AM</small>" : "<small>PM</small>";
}
function twelve(h) {
  return (h < 0 || h == 0) ? "12" : h > 12 ? h - 12 : h;
}
function zero(m) {
  return m < 10 ? "0" + m : m;
}

function derail_date (date_string) {
  var e = new Date((date_string || "").replace(/[\-\+]\d\d:\d\d$/,"").replace(/-/g,"/").replace(/[TZ]/g," "));
  var d = new Date(e.getTime() - 4 * 3600000);
  return d;
}

var MONTHS = "January February March April May June July August September October November December".split(" ");
var MONTH_LOOKUP = {};
for (i in MONTHS) {
  MONTH_LOOKUP[MONTHS[i]] = i;
}
