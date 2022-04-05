$(document).ready(function() {
  $.ajax({
    url: "http://localhost:8080/catalog"
  }).then(function(data, status, jqxhr) {
    for (let i = 0; i < data.length; i++) {
      $('.manufacturer'+[i]).append(data[i].manufacturer);
      $('.shop'+[i]).append(data[i].shop);
      $('.type'+[i]).append(data[i].type);
      $('.protection_class'+[i]).append(data[i].protection_class);
      $('.material'+[i]).append(data[i].material);
      $('.number_layer'+[i]).append(data[i].number_layer);
      $('.color'+[i]).append(data[i].color);
      $('.price'+[i]).append(data[i].price);
    }
    console.log(jqxhr);
  });
});

