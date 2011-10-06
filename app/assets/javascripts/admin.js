//= require jquery

$(function () {
  var rm = function () {
    console.log($(this).data())
    var id = $(this).data("id");
    $.ajax({
      "type": "DELETE",
      "url": "/gallery/" + id + "/delete",
      "success": function () {
        $("#photo_"+id).fadeOut("slow");
      },
    });
  };
  $("button.delete").bind("click", rm);
})