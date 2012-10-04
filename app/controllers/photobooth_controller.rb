class PhotoboothController < ApplicationController
  http_basic_authenticate_with :name => "style", :password => "style", :except => [:comingsoon, :index, :create, :show, :browser]

  def comingsoon
  end

  # /upload API used by processing, returns url to image
  def create
    @photo = Photo.create(:photo => params[:test])
    render :text => @photo.photo.url
    # render :text => "http://localhost:3000/gallery/" + @photo.id.to_s
  end
  
  # delete a photo
  def destroy
    @photo = Photo.find(params[:id])
    @photo.destroy()
    render :text => "OK"
  end

  # static page browser with admin interface
  def admin
    @admin = true
    @photos = Photo.page(params[:page]).order('created_at DESC')
    render :template => "photobooth/index"
  end

  # static photo browser (pages)
  def index
    @photos = Photo.page(params[:page]).order('created_at DESC')
  end

  # static photo browser (photos)
  def show
    @photo = Photo.find(params[:id])
    @previous_photo = Photo.where("id > ?", @photo.id).order("id ASC").first()
    @next_photo = Photo.where("id < ?", @photo.id).order("id DESC").first()
    if @previous_photo
      @previous_photo_link = "/gallery/" + @previous_photo.id.to_s
    else
      @previous_photo_link = "/gallery"
    end
    if @next_photo
      @next_photo_link = "/gallery/" + @next_photo.id.to_s
    else
      @next_photo_link = "/gallery"
    end
  end

  # AJAX photo browser
  def browser
    @photos = Photo.page(params[:page]).order('created_at DESC')
    list = []
    page = params[:page] || 1
    @photos.each do |p|
      list << {
        :id => p.id,
        :thumb => p.photo.url(:thumb),
        :original => p.photo.url(:original),
        :date => p.created_at
      }
    end
    
    # will_paginate is a helper function in WillPaginate::ViewHelpers that generates pagination links
    # i can only get at it from the view so i will have to manipulate it with JS
    # instead of passing it in here with the json, which would be preferable..
    @structure = { :photos => list, :page => page }

    respond_to do |format|
      format.html
      format.json { render :json => @structure }
    end
  end
end
