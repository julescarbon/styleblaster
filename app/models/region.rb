class Region < ActiveRecord::Base
  attr_accessible :name, :secret
  has_many :photos
end
