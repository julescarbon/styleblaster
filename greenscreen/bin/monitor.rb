#!/usr/bin/env ruby

require 'open-uri'
require 'json'

def most_recent_file(dir)
  Dir.glob("#{dir}/*").max { |a,b|
    (File.mtime(File.join(dir,a)) <=> File.mtime(File.join(dir,b)))
  }
end

def current_key
  open('http://styleblaster.net/bgz/current') { |f|
    return f.read
  }
end

puts most_recent_file("incoming")

loop {
  jpg = most_recent_file("incoming")
  key = current_key()
  puts "current key: #{current_key} ... #{jpg}"
  sleep(1)
}

