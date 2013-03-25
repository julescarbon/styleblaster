class Region < ActiveRecord::Base
  attr_accessible :name, :title, :secret, :tagline, :css, :manifesto, :landscape, :always_on, :public
  has_many :photos

  def path
    "http://styleblaster.net/#{name}/"
  end
end
