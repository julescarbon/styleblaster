/*
    This function is necessary for all JQuery-related functions performed via the Rails app.
    It extracts the CSRF parameter name and token from rails-supplied meta tags.

    In the head tag of your erb layout, have:
        <%= csrf_meta_tags %>
    
    Note: If you're making a non-AJAX <form> without the Rails form helper, include:
        <%= hidden_field_tag :authenticity_token, form_authenticity_token -%>

    Call this function when you do an AJAX function, e.g.
        var params = { "foo": "21", "bar": "baz" }
        $.ajax({
            url: '/route/something',
            type: 'post',
            data: csrf(params),
            success: function (data) {
                // ...
            }
        });

    Call it even if your route takes no parameters:
        $.post('/route/2/some/action', csrf(), success_callback, "json");

    arguments:
        params : (optional) hash of key/value parameters

    returns:
        the same hash, with CSRF key/value set
*/

function csrf (params) {
    if (!params) params = {};
    var csrf_key = "authenticity_token",
    csrf_value = "",
    metas = document.getElementsByTagName("meta");

    for (var i = 0, len = metas.length; i < len; i++) {
        if (metas[i].getAttribute("name") === "csrf-param")
            csrf_key = metas[i].getAttribute("content");
        if (metas[i].getAttribute("name") === "csrf-token")
            csrf_value = metas[i].getAttribute("content");
    }
    params[csrf_key] = csrf_value;
    return params;
}
