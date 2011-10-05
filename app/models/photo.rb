class Photo < ActiveRecord::Base
  # paperclip
  has_attached_file :photo,
    :styles => { :original => "640x480>", :thumb => "150x100>" },
    :convert_options => { :thumb => "-quality 92" },
    :default_style => :original,
    :storage => :s3,
    :bucket => 'photobooth',
    :path => 'photobooth/:attachment/:style/:basename.:extension',
    :s3_credentials => {
      :access_key_id => ENV['S3_KEY'],
      :secret_access_key => ENV['S3_SECRET']
    }
end
