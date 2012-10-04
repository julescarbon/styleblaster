PhotoboothGallery::Application.routes.draw do

  match 'upload'              => 'photobooth#create', :via => :post
  match 'gallery/page/:page'  => 'photobooth#index'
  match 'gallery/admin/:page' => 'photobooth#admin'
  match 'gallery/admin'       => 'photobooth#admin'
  match 'gallery/:id/delete'  => 'photobooth#destroy', :via => :delete
  match 'gallery/:id'         => 'photobooth#show'
  match 'gallery'             => 'photobooth#index'
  match 'browser/page/:page'  => 'photobooth#browser'
  match 'browser'             => 'photobooth#browser'

  root :to                    => 'photobooth#comingsoon'
end
