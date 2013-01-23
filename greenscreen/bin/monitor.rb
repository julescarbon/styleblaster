#!/usr/bin/env ruby

require 'open-uri'
require 'json'

BUCKET = "artstech"

system("mkdir output")
system("mkdir incoming")

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

def convert(jpg, key)
  output = Time.now.strftime("#{BUCKET}-%Y-%m-%d-%H-%M-%S.jpg")
  cmd  = "convert \\( backgrounds/#{key}.jpg -resize x600 \\) \\( #{jpg}"
  cmd += " -fuzz 8% -transparent \\#34643b"
  cmd += " -fuzz 4% -transparent \\#19351e"
  cmd += " -fuzz 4% -transparent \\#294f2e"
  cmd += " -normalize -resize 600x -rotate 270 \\)"
  cmd += " -compose Over -composite -normalize output/#{output}"
  system(cmd)
  return output
end

def upload(jpg)
  if File.exists?("output/#{jpg}")
    cmd = "curl -i -F test=@output/#{jpg} http://styleblaster.net/upload/artstech"
    system(cmd)
  end
end

old_jpg = nil
loop {
  jpg = most_recent_file("incoming")
  key = current_key()
  puts "current key: #{key} ... #{jpg}"

  if jpg != old_jpg
    out = convert(jpg, key)
    upload(out)
  end

  sleep(1)
  old_jpg = jpg
}

