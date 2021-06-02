$(document).ready(function () {
  // initialization modal and datepicker
  $("#modal-new-card").modal();
  $(".datepicker").datepicker();

  getUserInfo();
  getCities();

  // submit to add a new card
  $("#submit").click(function () {
    let data = {
      userId: $("#userNameSpan").data("userid"),
      country: $("#country").val() ? $("#country").val() : null,
      city: $("#city").val() ? $("#city").val() : $("#state").val(),
      resident: $("input[name='resident']:checked").val(),
      cardHolderName: $("#cardHolderName").val(),
      gender: $("input[name='gender']:checked").val(),
      birthday: $("#birthday").val(),
      address: $("#address").val(),
      email: $("#email").val(),
      phone: $("#phone").val(),
    };
    let invalid = invalidValues(data);

    if (!invalid) {
      $.post("/cards/createCard", data, (result) => {
        $("#modal-new-card").modal("close");
        if (result.message == "success") {
          location.reload();
        }
      });
    }
  });
});

// value invalid
invalidValues = (data) => {
  $(".invalid-text").remove();
  let errs = Object.keys(data).filter(function (key, index) {
    return data[key] == "" || data[key] == undefined;
  });
  if (errs.length > 0) {
    errs.forEach((item) => {
      $(`#${item}`).addClass("invalid");
      $(`#${item}`).after(
        `<div class="invalid-text" style="color: red">${item} is required</div>`
      );
    });
  } else {
    let labelName = Object.keys(data)[0];
    $(`#${labelName}`).removeClass("invalid");
    $(`#${labelName}`).siblings(".invalid-text").remove();
    errs = null;
  }
  return errs;
};
getCards = (userId) => {
  $.get(`/cards?userId=${userId}`, (result) => {
    $(".cards-list").empty();
    if (result.length > 0) {
      result.forEach((item) => {
        let cards = `<a href="/card?id=${
          item._id
        }" class="card-item" style="background: ${item.cardBackground};">
                            <div class="card-left">
                                <div class="card-label">Balance</div>
                                <div class="card-amount">${item.balance.toFixed(
                                  2
                                )}</div>
                            </div>
                            <div class="card-right text-right">
                           <span class="card-icon">
                                <img src="/assets/icon/public-transport.png" width="35" height="35">
                            </span>
                                <div class="card-location">${
                                  item.city
                                }<i class="small material-icons">chevron_right</i></div>
                            </div>
                        </a>`;
        $(".cards-list").append(cards);
      });
    } else {
      $(".cards-list").append(
        '<div class="no-data">No cards here. <a class="modal-trigger" href="#modal-new-card">Get one</a></div>'
      );
    }
  });
};
getCards = (userId) => {
  $.get(`/cards?userId=${userId}`, (result) => {
    $(".cards-list").empty();
    if (result.length > 0) {
      result.forEach((item) => {
        let cards = `<a href="/card?id=${
            item._id
        }" class="card-item" style="background: ${item.cardBackground};">
                            <div class="card-left">
                                <div class="card-label">Balance</div>
                                <div class="card-amount">${item.balance.toFixed(
            2
        )}</div>
                            </div>
                            <div class="card-right text-right">
                           <span class="card-icon">
                                <img src="/assets/icon/public-transport.png" width="35" height="35">
                            </span>
                                <div class="card-location">${
            item.city
        }<i class="small material-icons">chevron_right</i></div>
                            </div>
                        </a>`;
        $(".cards-list").append(cards);
      });
    } else {
      $(".cards-list").append(
          '<div class="no-data">No cards here. <a class="modal-trigger" href="#modal-new-card">Get one</a></div>'
      );
    }
  });
};
getTravelHistories = (userId)=>{
  $.get(`/travelData/travels/?userId=${userId}`, (result) => {
     console.log(result,'ress');
     $('.history-list-content').empty();
    if (result.length > 0) {
      result.forEach((item) => {
        let dateFormatter = moment.unix(item.created / 1000).format('DD-MM-YYYY');
        let travelItem = `<div class="history-item">
                    <div class="history-item-top">
                        <div class="top-left">
                            <div class="top-text">${item.city}</div>
                            <div class="star"></div>
                            <div class="star"></div>
                            <div class="star"></div>
                            <div class="star"></div>
                            <div class="star gray"></div>
                            <div class="rate-score text-light-black">4.0</div>
                        </div>
                        <a href="/rateAndReview" class="top-right">
                            Reviews
                        </a>
                    </div>
                    <div class="history-content">
                        <div class="h-item-left">
                            <img src="/assets/icon/public-transport.png" width="30" height="30">
                        </div>
                        <div class="h-item-right">
                            <div class="h-item-title">${item.title}</div>
                            <div class="h-item-info">
                                <span class="date"> ${dateFormatter}</span>
                                <span class="price">-$ ${(item.amount/1000).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>`
        $('.history-list-content').append(travelItem);
      })
    }else {
      $(".history-list-content").append(
          '<div class="no-data">No travel history here. </div>'
      );
    }
  })
}
getCities = () => {
  let token = "";
  $.ajax({
    type: "GET",
    url: "https://www.universal-tutorial.com/api/getaccesstoken",
    headers: {
      Accept: "application/json",
      "api-token":
        "cCH-SC8Fyg0uhdhomktrI0aIarIEtvc2hUaqrVmgiU8sUzBfNUplqafVXjnaPQEQ4Ig",
      "user-email": "414217795zoe@gmail.com",
    },
    success: function (msg) {
      token = msg.auth_token;
      $.ajax({
        type: "GET",
        url: "https://www.universal-tutorial.com/api/countries/",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        success: function (res) {
          $("#country").empty();
          let country = res.map((item) => {
            return item.country_name;
          });
          $("#country").append(
            `<option value="" disabled selected>Select a country</option>`
          );
          country.forEach((item) => {
            //console.log(item);
            $("#country").append(`<option value='${item}'>${item}</option>`);
          });
        },
      });
    },
  });

  $("#country").on("change", function () {
    $.ajax({
      type: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      url: `https://www.universal-tutorial.com/api/states/${this.value}`,
      success: function (res) {
        $("#state").empty();
        let states = res.map((item) => {
          return item.state_name;
        });
        $("#state").append(
          `<option value="" disabled selected>Select a state</option>`
        );
        states.forEach((item) => {
          // console.log(item);
          $("#state").append(`<option value='${item}'>${item}</option>`);
        });
        //console.log(states);
      },
    });
  });
  $("#state").on("change", function () {
    $.ajax({
      type: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      url: `https://www.universal-tutorial.com/api/cities/${this.value}`,
      success: function (res) {
        $("#city").empty();
        let cities = res.map((item) => {
          return item.city_name;
        });
        $("#city").append(
          `<option value="" disabled selected>Select a city</option>`
        );
        cities.forEach((item) => {
          //console.log(item);
          $("#city").append(`<option value='${item}'>${item}</option>`);
        });
      },
    });
  });
};
getUserInfo = () => {
  // user info from app id
  $.getJSON("/home/api/idPayload", function (id_token) {
    $("#userNameSpan").html(id_token.name);
    $("#userNameSpan").attr("data-userid", id_token.sub);
    $("#user-icon").attr("src", id_token.picture);
    $("#cardHolderName").val(id_token.name);
    $("#email").val(id_token.email);

    getCards(id_token.sub);
    getTravelHistories(id_token.sub);
    /**
     * add by Joel
     */
    $(".transactions").on("click", function () {
      window.location.href = `/transacData?userId=${id_token.sub}`;
    });
  });
};
