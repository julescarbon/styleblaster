$(function(){

  function showManifesto (){
    $("#manifesto").show();
    $("#curtain").fadeIn( 200 );
    _gaq.push(['_trackEvent', 'manifesto', 'open']);
  }
  function hideModal (e){
    e.stopPropagation();

    $("#manifesto").delay(100).hide();
    $("#curtain").fadeOut( 100 );
  }

  function cancel (e){
    e.stopPropagation();
  }

  $( "#about" ).click( showManifesto );
  $( "#manifesto" ).click( cancel );
  $( ".close" ).click( hideModal );
  $( "#curtain" ).click( hideModal );

});
