class AddGalleryIndexToRegions < ActiveRecord::Migration
  def change
		add_column :regions, :gallery_index, :boolean, :default => false
  end
end
