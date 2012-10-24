require "base64"

class PhotoController < ApplicationController

  http_basic_authenticate_with :name => "style", :password => "blaster", :only => :delete

  before_filter :get_hour

  # Show the newest image
  def index
    @limit = params[:limit] || 10;

    @photos = Photo.order("id DESC").limit(@limit)

    respond_to do |format|
      format.html { render :template => "photo/index" }
      format.json { render json: @photos }
    end
  end

  # Show the top-rated image
  def popular
    @limit = params[:limit] || 50;

    @photos = Photo.where("score > 0").order("score DESC").limit(@limit)

    respond_to do |format|
      format.html { render :template => "photo/index" }
      format.json { render json: @photos }
    end
  end

  # Show the images by an ID
  def show
    @limit = params[:limit] || 10;

    @photos = Photo.where("id <= ?", params[:id]).order("id DESC").limit(@limit)

    respond_to do |format|
      format.html { render :template => "photo/index" }
      format.json { render json: @photos }
    end
  end

  # Show images by a random ID
  def random
    @limit = params[:limit] || 1;

    @photos = Photo.order(sql_rand).limit(@limit)

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

  # like an image 
  def like
    @photo = Photo.find(params[:id])
    @photo.score += 1
    @photo.save!
    render text: "OK"
  end

  # Destroy image
  def destroy
    @photo = Photo.find(params[:id])
    @photo.destroy!
    render text: "OK"
  end

  # Like image
  def like
    @photo = Photo.find(params[:id])
    @photo.score += 1
    @photo.save!
    render text: "OK"
  end

  private

  def sql_rand
    @sql_rand = Rails.env.production? ? "RANDOM()" : "RANDOM()"
  end

  def get_hour
    @hour = Time.now.in_time_zone("America/New_York").hour
  end

end

