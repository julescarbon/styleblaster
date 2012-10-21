PhotoboothGallery::Application.routes.draw do
  match 'upload'        => 'photo#create', :via => :post
  get    '/random'      => "photo#random"
  post   '/plop'        => "photo#create"
  delete '/p/:id'       => "photo#destroy"
  put    '/p/:id/like'  => "photo#show"
  get    '/p/:id'       => "photo#show"
  get    '/refresh'     => "photo#index"
  root :to              => "photo#index"
end
