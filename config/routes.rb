PhotoboothGallery::Application.routes.draw do
  get    '/r/new/'        => "region#new"
  delete '/r/:name'       => "region#destroy"
  get    '/r/:name/edit'  => "region#edit"
  put    '/r/:name'       => "region#update"
  post   '/r/'            => "region#create"
  get    '/r/'            => "region#index"

  get    '/popular'       => "photo#popular"
  get    '/latest'        => "photo#latest"
  get    '/top'           => "photo#top"
  get    '/random'        => "photo#random"
  post   '/upload/:name'  => "photo#create"
  delete '/p/:id'         => "photo#destroy"
  post   '/p/:id/like'    => "photo#like"
  get    '/p/:id'         => "photo#show"
  get    '/refresh'       => "photo#index"
  root :to                => "photo#index"
end
