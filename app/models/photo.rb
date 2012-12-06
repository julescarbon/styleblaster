class Photo < ActiveRecord::Base

  belongs_to :region

  has_attached_file :photo,
    :styles => { :original => ["800x600>", :jpg] },
    :default_style => :original,
    :storage => :s3,
    :s3_storage_class => :reduced_redundancy,
    :bucket => 'styleblast',
    :path => ':attachment/:style/:basename.:extension',
    :s3_credentials => {
      :access_key_id => ENV['ASDF_S3_KEY'],
      :secret_access_key => ENV['ASDF_S3_SECRET']
    }

end
