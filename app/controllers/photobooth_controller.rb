class PhotoboothController < ApplicationController
  http_basic_authenticate_with :name => "admin", :password => "12mercer", :except => [:index, :create, :show]

=begin # this is what comes back from Image2Web when it sends a POST
{
  "test" => #<ActionDispatch::Http::UploadedFile:0x00000101339df0
    @original_filename="jpg-test.jpg",
    @content_type="image/jpeg",
    @headers="Content-Disposition: form-data; name=\"test\"; filename=\"jpg-test.jpg\"\r\nContent-Type: image/jpeg\r\nContent-Transfer-Encoding: binary\r\n",
    @tempfile=#<File:/var/folders/+n/+nO1Yaz4EhSpBA7s9ldDtk+++TI/-Tmp-/RackMultipart20111005-2643-rd41vh>>
}
=end

  # used by processing, returns url to image
  def create
    @photo = Photo.create(:photo => params[:test])
    # render :text => @photo.photo.url
    render :text => "http://localhost:3000/gallery/" + @photo.id.to_s
  end
  
  def destroy
    @photo = Photo.find(params[:id])
    @photo.destroy()
    render :text => "OK"
  end

  def admin
    @admin = true
    @photos = Photo.page(params[:page]).order('created_at DESC')
    render :template => "photobooth/index"
  end

  def index
    @photos = Photo.page(params[:page]).order('created_at DESC')
  end

  def show
    @photo = Photo.find(params[:id])
    @previous_photo = Photo.where("id < ?", @photo.id).order("id DESC").first()
    @next_photo = Photo.where("id > ?", @photo.id).order("id ASC").first()
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
end
