source 'http://rubygems.org'

gem 'rails', '3.1.0'

gem 'thin'

gem 'paperclip', '>= 2.3.15'
gem 'aws-s3', :require => 'aws/s3'
gem 'will_paginate', '~> 3.0'

group :production do
  gem 'pg'
end

group :development do 
  gem 'sqlite3'
end

# Gems used only for assets and not required
# in production environments by default.
group :assets do
  gem 'sass-rails', "  ~> 3.1.0"
  gem 'coffee-rails', "~> 3.1.0"
  gem 'uglifier'
end

gem 'jquery-rails'

# Use unicorn as the web server
# gem 'unicorn'

# Deploy with Capistrano
# gem 'capistrano'

# To use debugger
# gem 'ruby-debug19', :require => 'ruby-debug'

group :test do
  # Pretty printed test output
  gem 'turn', :require => false
end
