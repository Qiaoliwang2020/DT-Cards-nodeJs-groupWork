$(document).ready(function() {
    // initialize rate
    $("#rateYo").rateYo({
        rating: 0.0,
        ratedFill:"#FFC107",
        normalFill: "#C4C4C4",
    }).on("rateyo.change", function (e, data) {
        let rating = data.rating;
        $('#rateScore').text(rating);
    });;
})
