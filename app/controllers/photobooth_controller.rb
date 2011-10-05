class PhotoboothController < ApplicationController
  # http_basic_authenticate_with :name => "admin", :password => "12mercer", :except => [:index, :create]

=begin # this is what comes back from Image2Web when it sends a POST
{
  "test" => #<ActionDispatch::Http::UploadedFile:0x00000101339df0
    @original_filename="jpg-test.jpg",
    @content_type="image/jpeg",
    @headers="Content-Disposition: form-data; name=\"test\"; filename=\"jpg-test.jpg\"\r\nContent-Type: image/jpeg\r\nContent-Transfer-Encoding: binary\r\n",
    @tempfile=#<File:/var/folders/+n/+nO1Yaz4EhSpBA7s9ldDtk+++TI/-Tmp-/RackMultipart20111005-2643-rd41vh>>
}
=end

  def upload
    # return url to image
    render :text => "http://okfoc.us/assets/images/ok_icon.png"
  end
  
  def gallery
    @photos = Photo.all(:limit => 64)
  end

end
