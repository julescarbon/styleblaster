source 'http://rubygems.org'

# ruby '1.9.3'

gem 'rails', '3.2.7'

gem 'thin'

gem 'quiet_assets'

# cocaine 0.4.0 breaks paperclip
gem 'cocaine', '0.3.2'

gem 'paperclip'
gem 'aws-sdk', '~> 1.3.4'

group :production do
  gem 'pg'
end

group :development do 
  gem 'pg'
  #gem 'sqlite3'
end

# Gems used only for assets and not required
# in production environments by default.
group :assets do
  gem 'sass-rails'
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
