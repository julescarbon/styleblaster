class BackgroundsController < ApplicationController

	def index
		@bgs = Background.all
	end
	
	def admin
		@bgs = Background.all
	end
	
	def pick
		Background.where(:selected => true).each do |bg|
			bg.selected = false
			bg.save
		end
		bg = Background.find(params:id)
		bg.selected = true
		bg.save
		render :text => "OK"
	end
		
	def create
    @bg = Background.new(params[:background])
    if @bg.save
      redirect_to "/bgz/admin"
    end
  end
  
  def destroy
    @bg = Background.find(params[:id])
    @bg.destroy!
    redirect_to "/bgz/admin"
  end

end
