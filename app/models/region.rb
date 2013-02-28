class Region < ActiveRecord::Base
  attr_accessible :name, :title, :secret, :tagline, :css, :manifesto, :landscape
  has_many :photos

  def path
    "http://#{name}.styleblaster.net/"
  end
end
