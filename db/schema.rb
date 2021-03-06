# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20130325182619) do

  create_table "backgrounds", :force => true do |t|
    t.string   "name"
    t.boolean  "selected",        :default => false
    t.string   "bg_file_name"
    t.string   "bg_content_type"
    t.integer  "bg_file_size"
    t.datetime "created_at",                         :null => false
    t.datetime "updated_at",                         :null => false
  end

  create_table "photos", :force => true do |t|
    t.string    "photo_file_name"
    t.string    "photo_content_type"
    t.integer   "photo_file_size"
    t.timestamp "created_at"
    t.timestamp "updated_at"
    t.integer   "score",              :default => 0
    t.integer   "region_id"
  end

  create_table "regions", :force => true do |t|
    t.string    "name"
    t.string    "secret"
    t.timestamp "created_at",                       :null => false
    t.timestamp "updated_at",                       :null => false
    t.string    "title"
    t.string    "tagline"
    t.text      "css"
    t.text      "manifesto"
    t.boolean   "landscape",     :default => false
    t.boolean   "always_on",     :default => false
    t.boolean   "public",        :default => true
    t.boolean   "gallery_index", :default => false
    t.boolean   "top_index",     :default => false
  end

end
