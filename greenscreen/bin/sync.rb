#!/usr/bin/env ruby

require 'open-uri'
require 'json'

system("mkdir backgrounds")

puts "Fetching backgrounds"
open('http://styleblaster.net/bgz.json') { |f|
  raw = f.read
  puts raw
  data = JSON.parse(raw)
  data.each do |h|
    puts h['key']
    puts h['url']
    if not File.exist?("backgrounds/#{h['key']}.jpg")
      puts "fetching.."
      system("wget #{h['url']}")
      system("mv #{h['key']}.jpg backgrounds")
    end
    ##{@SOURCE_DIR}/#{my_file} #{@DEST_DIR}/#{file})
    puts
  end
}

