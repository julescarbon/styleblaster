class PhotoBelongsToRegion < ActiveRecord::Migration
  def change
    add_column :photos, :region_id, :integer
  end
end
