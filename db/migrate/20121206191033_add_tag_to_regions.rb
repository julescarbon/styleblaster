class AddTagToRegions < ActiveRecord::Migration
  def change
    add_column :regions, :title, :string
    add_column :regions, :tagline, :string
    add_column :regions, :css, :text
    add_column :regions, :manifesto, :text
  end
end
