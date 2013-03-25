require "base64"

class PhotoController < ApplicationController

  http_basic_authenticate_with :name => "style", :password => "blaster", :only => :delete

  before_filter :get_hour
  before_filter :fetch_region, :except => [:create]

  # Show something appropriate
  def index
    @limit = params[:limit] || 24;

    if @region.gallery_index?
    	redirect_to "/#{@region.name}/gallery/"
    	return
      # @photos = @region.photos.order("id DESC").limit(@limit)
      # @nighttime = false
    elsif @nighttime and not @region.always_on
      @photos = @region.photos.where("created_at > ? AND score > 0", now - 24 * 3600).order("score DESC").limit(@limit)
    else
      @photos = @region.photos.order("id DESC").limit(@limit)
    end

    if not @photos.any?
      @photos = @region.photos.order(sql_rand).limit(@limit)
    end

    respond_to do |format|
      format.html { render :template => @template }
      format.json { render json: @photos }
    end
  end

  # Show the most recent images
  def latest
    @photos = @region.photos.order("id DESC").limit(18)

    respond_to do |format|
      format.html { render :template => @template }
      format.json { render json: @photos }
    end
  end
    
    # Show the top-rated images from the past 48 hours
  def popular
    @limit = params[:limit] || 50;
    @photos = @region.photos.where("created_at > ? AND score > 0", now - 48 * 3600).order("score DESC").limit(@limit)
    
    if not @photos.any?
      @photos = @region.photos.where("score < 100 AND score > 20").order("score DESC").limit(@limit)
    end

    respond_to do |format|
      format.html { render :template => @template }
        format.json { render json: @photos }
    end
  end
  
  # Show the best images
  def top
    @limit = params[:limit] || 50;

    @photos = @region.photos.where("score > 0").order("score DESC").limit(@limit)

    respond_to do |format|
      format.html { render :template => @template }
      format.json { render json: @photos }
    end
  end

  # Show the images by an ID
  def show
    @limit = params[:limit] || 24;

    @photos = @region.photos.where("id <= ?", params[:id]).order("id DESC").limit(@limit)

		if @region.name == "artstech"
			@og_title = "Styleblaster @ Arts/Tech NYC"
		else
			@og_title = "Styleblaster"
		end
		
		if @photos.any?
			@og_image = @photos.first.photo.url
			@og_url = "http://styleblaster.net/#{@region.name}/p/#{@photos.first.id}/"
		end

    respond_to do |format|
      format.html { render :template => @template }
      format.json { render json: @photos }
    end
  end
  
  def gallery
    @limit = 41

    if @region.name == "artstech"
      @photos = @region.photos.order("id DESC").all
    elsif not params[:id].nil?
      @photos = @region.photos.where("id <= ?", params[:id]).order("id DESC").limit(@limit).all
      @next_id = @photos.pop.id
    else
      @photos = @region.photos.order("id DESC").limit(@limit)
      @next_id = @photos.pop.id
    end

		if @region.name == "artstech"
			@og_title = "Styleblaster @ Arts/Tech NYC"
		else
			@og_title = "Styleblaster"
		end

    respond_to do |format|
      format.html { render :template => "photo/gallery" }
      format.json { render json: @photos }
    end
  end    

  # Show images by a random ID
  def random
    @limit = params[:limit] || 1;

    @photos = @region.photos.order(sql_rand).limit(@limit)

    respond_to do |format|
      format.html { render :template => @template }
      format.json { render json: @photos }
    end
  end

  # /upload API used by processing, returns url to image
  def create
    @region = Region.find_by_name(params[:name])
    @photo = Photo.create( :photo => params[:test], :score => 1, :region => @region )
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
    if params[:region]
      @region = Region.find_by_name(params[:region])
      if @region.landscape
      	@landscape = true
      	@template = "photo/landscape"
      else
      	@landscape = false
      	@template = "photo/index"
			end
    else
      @region = Region.find_by_name("nyc")
      @landscape = false
			@template = "photo/index"
    end
    
		@og_title = "Styleblaster"
		if @region.name != "nyc"
			@og_url = "http://styleblaster.net/#{@region.name}/"
		else
			@og_url = "http://styleblaster.net/"
		end
		@og_image = "http://styleblaster.net/assets/big-top-hat.png"
		@og_description = "Williamsburg's premier live fashion blog, documenting the style of today."
	end

  def sql_rand
    @sql_rand = Rails.env.production? ? "RANDOM()" : "RANDOM()"
  end

  def now
    Time.now.in_time_zone("America/New_York")
  end

  def midnight
    Time.now.in_time_zone("America/New_York").midnight
  end

  def get_hour
    @hour = now.hour
    @nighttime = (@hour < 7 or @hour >= 16)
  end

end

