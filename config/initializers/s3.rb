AWS::S3::Base.establish_connection!(
  :access_key_id     => ENV['ASDF_S3_KEY'],
  :secret_access_key => ENV['ASDF_S3_SECRET']
)