require "base64"

class PhotoController < ApplicationController

  http_basic_authenticate_with :name => "style", :password => "blaster", :only => :delete

  before_filter :get_hour, :fetch_region

  # Show something appropriate
  def index
    @limit = params[:limit] || 10;

    if @nighttime
      @photos = Photo.where("created_at > ? AND score > 0", now - 24 * 3600).order("score DESC").limit(@limit)
    else
      @photos = Photo.order("id DESC").limit(@limit)
    end

    if not @photos.any?
      @photos = Photo.order(sql_rand).limit(@limit)
    end

    respond_to do |format|
      format.html { render :template => "photo/index" }
      format.json { render json: @photos }
    end
  end

  # Show the most recent images
  def latest
    @photos = Photo.order("id DESC").limit(10)

    respond_to do |format|
      format.html { render :template => "photo/index" }
      format.json { render json: @photos }
    end
  end
    
    # Show the top-rated images from the past 48 hours
  def popular
    @limit = params[:limit] || 50;
    @photos = Photo.where("created_at > ? AND score > 0", now - 48 * 3600).order("score DESC").limit(@limit)
      
      respond_to do |format|
          format.html { render :template => "photo/index" }
          format.json { render json: @photos }
      end
  end
    
  # Show the best images
  def top
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
    if params[:secret] == @region.secret
      @photo = Photo.create( :photo => params[:test], :score => 1, :region => @region )
    end

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

  private

  def fetch_region
    @region = Region.find_by_name(params[:name])
  end

  def sql_rand
    @sql_rand = Rails.env.production? ? "RANDOM()" : "RANDOM()"
  end

  def now
    Time.now.in_time_zone("America/New_York")
  end

  def get_hour
    @hour = now.hour
    @nighttime = (@hour < 7 or @hour >= 16)
  end

end

