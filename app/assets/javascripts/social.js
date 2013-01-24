var socialTimeout = null;
var facebookTimeout = null;
var twitterTimeout = null;
function buildSocialButtons (url) {
	if (socialTimeout) clearTimeout(socialTimeout);
	socialTimeout = setTimeout(function(){
		if (facebookTimeout) clearTimeout(facebookTimeout);
		if (twitterTimeout) clearTimeout(twitterTimeout);
		buildSocialButtonHTML( url );
		buildFacebookButton();
		buildTwitterButton();
	}, 500);
}

// Build any new Facebook buttons, retrying if the API hasn't loaded yet.
function buildFacebookButton () {
  try {
    FB.XFBML.parse();
  } catch (ex) {
    facebookTimeout = setTimeout(buildFacebookButton, 66);
  }
}
// Build any new Twitter buttons, retrying if the API hasn't loaded yet.
function buildTwitterButton () {
  try {
    twttr.widgets.load();
  } catch (ex) {
    twitterTimeout = setTimeout(buildTwitterButton, 50);
  }
}

function buildSocialButtonHTML(url) {
	var facebookButton = '<div class="fb-like" data-href="' + url +
											'" data-layout="button_count" data-send="false" data-width="80" ' +
											'data-show-faces="false" width="80px"></div>';
	var twitterButton = '<a href="https://twitter.com/share" data-url="' + url +
											'" data-via="styleblaster" data-counturl="' + url +
											'" data-related="styleblaster" class="twitter-share-button" ' +
											'data-lang="en">Tweet</a>';
	$("#social").html( facebookButton + twitterButton );
	$("#social").css("opacity", 0.0).delay(200).animate({ opacity: 1.0 }, 500);
}

