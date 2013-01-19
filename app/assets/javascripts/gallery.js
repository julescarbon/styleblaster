function Gallery ( master, queue ) {

	this.queue = queue;
	this.perPage = 20;
	this.page = 0;
	this.index = 0;
	this.building = false;
	
	this.$el = $( "#gallery" );
	this.$loader = this.$el.find( ".loader" );
	this.$nextPage = this.$el.find( ".nextPage" );
	this.$prevPage = this.$el.find( ".prevPage" );
	this.$nextPage.bind( "click", Gallery.prototype.next() );
	this.$prevPage.bind( "click", Gallery.prototype.prev() );
	
	$("#openGallery").click(this.show)
}
Gallery.prototype.show = function(){
	this.index = queue.index;
	this.page = Math.floor(this.index / this.perPage);
	this.$el.addClass( "active" );
	this.build();
}
Gallery.prototype.hide = function(){
	this.$el.removeClass( "active" );
}
Gallery.prototype.build = function(){
	this.building = true;
	var items =	this.getItems( this.page );
	this.buildItems(items);
	if (items.length < this.perPage) {
		master.fetch( items[items.length-1].data.id, function(){
			this.building = false;
		});
	} else {
		this.building = false;
	}
}
Gallery.prototype.getItems = function( page ){
	var from = this.page * this.perPage;
	var to = ( this.page + 1 ) * this.perPage;
	return this.queue.queue.slice( from, to );
}
Gallery.prototype.buildItems = function( items ){
	var divs = [];
	for ( var i = 0; i < items.length; i++ ) {
		divs.push( "<a href='/p/" + plop.data.id + "'><img src='" + plop.image_url + "'></a>" );
	}
	$( "#gallery .items" ).html( divs.join("") );
}
Gallery.prototype.next = function(){
	if (this.building) return;
	this.page += 1;
	this.build();
}
Gallery.prototype.prev = function(){
	if (this.building) return;
	this.page = Math.min(0, this.page - 1);
	this.build();
}
