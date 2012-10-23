PhotoboothGallery::Application.routes.draw do
  get    '/popular'     => "photo#popular"
  get    '/random'      => "photo#random"
  post   '/upload'      => "photo#create"
  delete '/p/:id'       => "photo#destroy"
  post   '/p/:id/like'  => "photo#like"
  get    '/p/:id'       => "photo#show"
  get    '/refresh'     => "photo#index"
  root :to              => "photo#index"
end
