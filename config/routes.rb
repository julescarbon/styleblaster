PhotoboothGallery::Application.routes.draw do
  match 'upload'        => 'photo#create', :via => :post
  get    '/random'      => "photo#random"
  post   '/plop'        => "photo#create"
  delete '/p/:id'       => "photo#destroy"
  get    '/p/:id'       => "photo#show"
  get    '/browser/'    => "photo#index"
  root :to              => "photo#index"
end
