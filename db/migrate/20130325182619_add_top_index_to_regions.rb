class AddTopIndexToRegions < ActiveRecord::Migration
  def change
		add_column :regions, :top_index, :boolean, :default => false
  end
end
