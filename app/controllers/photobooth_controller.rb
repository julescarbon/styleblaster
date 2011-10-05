class PhotoboothController < ApplicationController

  def upload
  end
  
  def gallery
    @photos = Photo.all(:limit => 64)
  end

end
