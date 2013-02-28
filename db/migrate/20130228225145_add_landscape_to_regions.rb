class AddLandscapeToRegions < ActiveRecord::Migration
  def change
		add_column :regions, :landscape, :boolean, :default => false
  end
end
