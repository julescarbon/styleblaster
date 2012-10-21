require "base64"

class PhotoController < ApplicationController

  http_basic_authenticate_with :name => "style", :password => "blaster", :only => :delete

  # Show the newest image
  def index
    @limit = params[:limit] || 20;
    @photos = Photo.order("id DESC").limit(@limit)

    respond_to do |format|
      format.html { render :template => "photo/index" }
      format.json { render json: @photos }
    end
  end

  # Show the images by an ID
  def show
    @limit = params[:limit] || 20;
    @photos = Photo.where("id <= ?", params[:id]).order("id DESC").limit(@limit)

    respond_to do |format|
      format.html { render :template => "photo/index" }
      format.json { render json: @photos }
    end
  end

  # Show images by a random ID
  def random
    @limit = params[:limit] || 1;
    @offset = (Photo.count - 2000) + 2 + rand(2000 - 1)
    @photos = Photo.where("id < ?", @offset).order("id DESC").limit(@limit)

    respond_to do |format|
      format.html { render :template => "photo/index" }
      format.json { render json: @photos }
    end
  end

  # /upload API used by processing, returns url to image
  def create
    @photo = Photo.create(:photo => params[:test])
    render :text => @photo.photo.url
    # render :text => "http://localhost:3000/gallery/" + @photo.id.to_s
  end

  # Destroy image
  def destroy
    @photo = Photo.find(params[:id])
    @photo.destroy!
    render text: "OK"
  end

end

