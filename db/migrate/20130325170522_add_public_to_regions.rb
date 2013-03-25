class AddPublicToRegions < ActiveRecord::Migration
  def change
		add_column :regions, :public, :boolean, :default => true
  end
end
