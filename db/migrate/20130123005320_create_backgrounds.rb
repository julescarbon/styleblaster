class CreateBackgrounds < ActiveRecord::Migration
  def change
    create_table :backgrounds do |t|
      t.string :name
      t.boolean :selected, :default => false
      t.string :bg_file_name
      t.string :bg_content_type
      t.integer :bg_file_size

      t.timestamps
    end
  end
end
