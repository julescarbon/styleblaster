class AddAlwaysOnToRegions < ActiveRecord::Migration
  def change
		add_column :regions, :always_on, :boolean, :default => false
  end
end
