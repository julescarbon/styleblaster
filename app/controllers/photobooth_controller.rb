class PhotoboothController < ApplicationController

  def upload
    # return url to image
    render :text => "http://okfoc.us/assets/images/ok_icon.png"
  end
  
  def gallery
    @photos = Photo.all(:limit => 64)
  end

end
