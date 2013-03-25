class Region < ActiveRecord::Base
  attr_accessible :name, :title, :secret, :tagline, :css, :manifesto, :landscape, :always_on, :public, :gallery_index, :top_index
  has_many :photos

  def path
    "http://styleblaster.net/#{name}/"
  end
end
