class Background < ActiveRecord::Base
  attr_accessible :name, :bg, :selected

	default_scope order(:name)
	
	validates :name, :presence => true
	validates :bg, :presence => true

  has_attached_file :bg,
    :styles => { :original => ["800x600>", :jpg], :thumb => ["300x300>", :jpg] },
    :default_style => :original,
    :storage => :s3,
    :s3_storage_class => :reduced_redundancy,
    :bucket => 'styleblast',
    :path => ':attachment/:style/:basename.:extension',
    :s3_credentials => {
      :access_key_id => ENV['OKFOCUS_S3_KEY'],
      :secret_access_key => ENV['OKFOCUS_S3_SECRET']
    }

	def key
		self.name.downcase.gsub(" ","")
	end

end
