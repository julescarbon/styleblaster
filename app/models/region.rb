class Region < ActiveRecord::Base
  attr_accessible :name, :title, :secret, :tagline, :css, :manifesto
  has_many :photos
end
