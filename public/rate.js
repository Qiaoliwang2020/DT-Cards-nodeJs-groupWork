$(document).ready(function() {
    // get value from div
    let city = $('.rate-city').text().trim();

    // initialize rate
    let ratedFill ="#FFC107",
        normalFill = "#C4C4C4";
    const $rateYo = $("#rateYo").rateYo({
        rating: 0.0,
        ratedFill:ratedFill,
        normalFill: normalFill,
    }).on("rateyo.change", function (e, data) {
        let rating = data.rating;
        $('#rateScore').text(rating);
    });

    // get reviews belongs to current city
    getReviews({city:city});

    $('#postReview').on('click',function (){
        let userName = $('#userNameSpan').text().trim(),
            userIcon = $('#user-icon').attr('src'),
            rating = $rateYo.rateYo("rating"),
            review = $('#reviewContext').val().trim().toString();
        let reviewObj = {
            city:city,
            userName:userName,
            userIcon:userIcon,
            rating:rating,
            review:review
        }
        let rateObj ={
            rating:rating,
            city:city,
        }
        addReview(reviewObj);
        addRate(rateObj);
    })
})

addReview = (data)=>{
    $.post('/rateAndReview/addReview',data,(res)=>{
        if(res == 'success'){
            location.reload();
        }else{
            console.log(res);
        }
    })
}
getReviews = (city)=>{
    $('.review-list').empty();
    $.get('/rateAndReview/reviews',city,(res)=>{
        if(res.length > 0){
            res.forEach((item)=>{
                let reviewItem = `<div class="review-item">
                    <div class="review-top">
                        <img src="${item.userIcon}" width="32" height="32">
                        <span>${item.userName}</span>
                    </div>
                    <div class="basic-flex mt-10">
                        <div class="rating-item"></div>
                        <div class="rating-score">${item.rating}</div>
                        <div class="text-gray ml-10">${moment(item.createTime).fromNow()}</div>
                    </div>
                    <div class="review-content mt-10">
                        ${item.review}
                    </div>
                </div>`
                $('.review-list').append(reviewItem);
                $(".rating-item").rateYo({
                    ratedFill:"#FFC107",
                    normalFill: "#C4C4C4",
                    rating: item.rating,
                    starWidth: "15px"
                });
            })
        }else {
            $('.review-list').empty();
        }

        console.log(res,'res review');
    })
}
addRate = (data)=>{
    $.post('/rateAndReview/addRate',data,(res)=>{
        console.log(res,'resssss');
    })
}
