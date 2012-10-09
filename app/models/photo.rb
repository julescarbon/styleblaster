class Photo < ActiveRecord::Base
  # paperclip
  has_attached_file :photo,
    :styles => { :original => ["800x600>", :jpg], :thumb => ["150x100>", :jpg] },
    :default_style => :original,
    :storage => :s3,
    :bucket => 'styleblaster',
    :path => 'styleblaster/:attachment/:style/:basename.:extension',
    :s3_credentials => {
      :access_key_id => ENV['ASDF_S3_KEY'],
      :secret_access_key => ENV['ASDF_S3_SECRET']
    }
  self.per_page = 30
end
