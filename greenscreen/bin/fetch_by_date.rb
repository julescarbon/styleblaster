#!/usr/bin/env ruby

# Move all the files from one S3 bucket to another one.

require 'fileutils'
require 'rubygems'
require 'aws-sdk'

if ARGV.empty?
  puts "usage: ./fetch_by_date.rb YYYY-M-D- region"
  puts ".. matches like /.*YYYY-M-D-.*/"
end

source_match, region_match = ARGV

AWS.config(
  :access_key_id => ENV['OKFOCUS_S3_KEY'],
  :secret_access_key => ENV['OKFOCUS_S3_SECRET']
)

s3 = AWS::S3.new

bucket_key = 'styleblast'
tm_bucket = s3.buckets[ bucket_key ]

tm_bucket.objects.each do |source|

  if not source.key.include? "original" or not source.key.include? source_match
    next
  end

  if not region_match.nil? and not source.key.include? region_match
    next
  end

  # photos/original/2012-12-11-15-32-38.png.jpg
  dirs = source.key.split("/")
  fn = dirs.pop()

  file_ext = fn.split(".")
  datepartz = file_ext[0].split("-")
  datepartz.each_with_index do |e,i|
    if e.length == 1
      datepartz[i] = "0" + e
    end
  end

  dir_path = datepartz[0..2].join("-")
  filename = datepartz.join("-") + ".jpg"

  puts source.key + "\t" + dir_path + "\t" + filename
#  FileUtils.mkdir_p dir_path
#  download( source.key, dir_path + "/" + filename )
  
  #ol_obj = ol_bucket.objects[obj.key]
  #obj.copy_to(ol_obj, {
  #  :reduced_redundancy => true,
  #  :acl => :public_read
  #})
end

def download (source, dest)
  open(dest, 'w') do |file|
    S3Object.stream(source, bucket_key) do |chunk|
      file.write chunk
    end
  end
end
