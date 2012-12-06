class RegionController < ApplicationController

  http_basic_authenticate_with :name => "style", :password => "blaster"

  def index
    @regions = Region.all
  end

  def new
    @region = Region.new
  end
  
  def edit
    @region = Region.find_by_name(params[:name])
  end
  
  def create
    @region = Region.new(params[:region])
    if @region.save
      redirect_to "/r/"
    end
  end
  
  def update
    @region = Region.find_by_name(params[:name])
    @region.update_attributes(params[:region])
    if @region.save
      redirect_to "/r/"
    end
  end
  
  def destroy
    @region = Region.find_by_name(params[:name])
    @region.destroy!    
    redirect_to "/r/"
  end

end