
var base_url = "http://s3.amazonaws.com/styleblast/photos/original/";

function Plop (data){
  var base = this;
  base.data = data || {};

  base.id = base.data.id;
  base.score = base.data.score;
  base.image_url = base_url + data.photo_file_name.replace(".JPG", ".jpg").replace(/.png$/, ".jpg");

  var d = derail_date(data.created_at);
	if (d.isStandardTime) {
		d.setHours(d.getHours()-1);
	}
  base.day = d.getDate();
  base.month = month(d.getMonth());
    //temp fix for time offset -1 -jk
  base.time = twelve(d.getHours()) + ":" + zero(d.getMinutes()) + " " + merid(d.getHours());

  base.preload = function(){
    var img = new Image();
    img.src = base.image_url;
  }

  base.destroy = function(){
    base.data = undefined;
    base = undefined;
  }
};
