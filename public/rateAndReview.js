$(document).ready(function () {
  // get value from div
  let city = $(".rate-city").text().trim();

  // initialize rate
  let ratedFill = "#FFC107",
    normalFill = "#C4C4C4";
  $("#rateScore").text((0.0).toFixed(1));

  const $rateYo = $("#rateYo")
    .rateYo({
      rating: 0.0,
      ratedFill: ratedFill,
      normalFill: normalFill,
    })
    .on("rateyo.change", function (e, data) {
      let rating = parseFloat(data.rating).toFixed(1);
      $("#rateScore").text(rating);
    });

  // get reviews by current city
  getReviews({ city: city });
  // get average rate by current city
  getAverageRate({ city: city });

  // post a review
  $("#postReview").on("click", function () {
    try {
      let userName = $("#userNameSpan").text().trim(),
        userId = $("#userNameSpan").data("userid"),
        userIcon = $("#user-icon").attr("src"),
        rating = $rateYo.rateYo("rating"),
        review = $("#reviewContext").val().trim().toString();

      let reviewObj = {
        city: city,
        userName: userName,
        userId: userId,
        userIcon: userIcon,
        rating: rating,
        review: review,
      };
      let rateObj = {
        rating: rating,
        city: city,
      };
      // if not user name or city return to login
      if (!userName || !userId || !city) {
        location.href = "/home/home.html";
      } else {
        addReview(reviewObj);
        addRate(rateObj);
      }
    } catch (err) {
      console.log(err);
    }
  });
  // initialize reply modal
  $(".modal").modal();

  // search a review
  $(".search-btn").on("click", function () {
    try {
      let text = $(".search-input").val();
      let search = {
        city: city,
        text: text,
      };
      searchReviews(search);
    } catch (err) {
      console.log(err);
    }
  });
  // sorting
  $(".sorting-item").each(function (index) {
    let category = "";
    try {
      $(this).on("click", function () {
        // change class
        $(this).addClass("active").siblings().removeClass("active");
        // get sort category
        category = $(this).data("text");

        if (category == "newest") {
          // get reviews by current city (sort by date)
          getReviews({ city: city });
        } else if (category == "highest") {
          // show reviews (sort by highest rating)
          showReviewsSortByHeightScores();
        } else if (category == "lowest") {
          // show reviews (sort by lowest rating)
          showReviewsSortbyLowScores();
        }
      });
    } catch (err) {
      console.log(err);
    }
  });
});
/**
 * add a review
 * @param data
 * qiaoli wang (wangqiao@deakin.edu.au)
 */
addReview = (data) => {
  try {
    $.post("/rateAndReview/addReview", data, (res) => {
      if (res == "success") {
        location.reload();
      } else {
        console.log(res);
      }
    });
  } catch (err) {
    console.log(err);
  }
};
/**
 * get reviews by city (sort by date)
 * @param city
 * qiaoli wang (wangqiao@deakin.edu.au)
 */
let reviews = [];
getReviews = (city) => {
  $(".review-list").empty();
  try {
    $.get("/rateAndReview/reviews", city, (res) => {
      reviews = res;
      renderReviews(res);
    });
  } catch (err) {
    console.log(err);
  }
};
showNewestReviews = () => {
  $(".review-list").empty();
  try {
    renderReviews(reviews);
  } catch (err) {
    console.log(err);
  }
};
showReviewsSortByHeightScores = () => {
  $(".review-list").empty();
  try {
    let result = reviews.sort(function (a, b) {
      return b.rating - a.rating;
    });
    renderReviews(result);
  } catch (err) {
    console.log(err);
  }
};
showReviewsSortbyLowScores = () => {
  $(".review-list").empty();
  try {
    let result = reviews.sort(function (a, b) {
      return a.rating - b.rating;
    });
    renderReviews(result);
  } catch (err) {
    console.log(err);
  }
};

/**
 * search reviews by review content
 * @param search
 * qiaoli wang (wangqiao@deakin.edu.au)
 */
searchReviews = (search) => {
  $(".review-list").empty();
  try {
    $.get("/rateAndReview/reviewsSearch", search, (res) => {
      renderReviews(res);
    });
  } catch (err) {
    console.log(err);
  }
};
/**
 * render reviews to page
 * @param data
 * qiaoliwang (wangqiao@deakin.edu.au)
 */
renderReviews = (data) => {
  let currentUserId = $("#userNameSpan").data("userid");
  try {
    if (data.length > 0) {
      showScorePercentage(data);
      data.forEach((item, index) => {
        getReplies({ reviewId: item._id }, index);
        let reviewItem = `<div class="review-item">
                    <div class="review-top">
                        <img src="${item.userIcon}" width="32" height="32">
                        <span id="user-${index}" data-uid="${item.userId}">${
          item.userName
        }</span>
                    </div>
                    <div class="basic-flex mt-10">
                        <div class="rating-item"></div>
                        <div class="rating-score">${parseFloat(
                          item.rating
                        ).toFixed(1)}</div>
                        <div class="text-gray ml-10">${moment(
                          item.createTime
                        ).fromNow()}</div>
                    </div>
                    <div class="review-content mt-10">
                        ${item.review}
                    </div>
                    <div class="review-operation">
                        ${
                          currentUserId === item.userId
                            ? ""
                            : `<span id="reply-${index}" class="text-gray" onclick="openReplyModal(${index})" data-user="${item.userName}" data-id="${item._id}">Reply</span>`
                        }
                        ${
                          currentUserId === item.userId
                            ? `<span id="edit-${index}" class="text-gray" onclick="EditModal(${index})" data-user="${item.userName}" data-id="${item._id}" data-review="${item.review}">Edit</span>`
                            : ""
                        }
                        ${
                          currentUserId === item.userId
                            ? `<span id="delete-${index}" class="text-gray ml-20" onclick="DeleteModal(${index})" data-user="${item.userName}" data-id="${item._id}" data-review="${item.review}">Delete</span>`
                            : ""
                        }
                    </div>
                    <div class="response-list response-${index}"></div>
                </div>`;
        $(".review-list").append(reviewItem);
        $(".rating-item").rateYo({
          ratedFill: "#FFC107",
          normalFill: "#C4C4C4",
          rating: item.rating,
          starWidth: "15px",
        });
        $(".rating-item").rateYo("option", "readOnly", true);
      });
    } else {
      $(".review-list").append(`<div class="no-data">no data</div>`);
    }
  } catch (err) {
    console.log(err);
  }
};
/**
 * give a rate
 * @param data
 * qiaoli wang (wangqiao@deakin.edu.au)
 */
addRate = (data) => {
  try {
    $.post("/rateAndReview/addRate", data, (res) => {
      console.log(res, "add rate");
    });
  } catch (err) {
    console.log(err);
  }
};
/**
 * get average rating score of current city
 * @param city
 * qiaoli wang (wangqiao@deakin.edu.au)
 */
getAverageRate = (city) => {
  try {
    $.get("/rateAndReview/averageRate", city, (res) => {
      if (res) {
        $("#averageScore").rateYo({
          ratedFill: "#FFC107",
          normalFill: "#C4C4C4",
          rating: res.rating,
          starWidth: "15px",
        });
        $("#averageScore").rateYo("option", "readOnly", true);
        $("#averageScore-text").text(parseFloat(res.rating).toFixed(1));
      }
    });
  } catch (err) {
    console.log(err);
  }
};
/**
 * display percentage of each rating level
 * @param data
 * qiaoli wang (wangqiao@deakin.edu.au)
 */
showScorePercentage = (data) => {
  try {
    let s5 = data.filter((item) => {
      return parseFloat(item.rating) == 5;
    });
    let s4 = data.filter((item) => {
      return parseFloat(item.rating) < 5 && parseFloat(item.rating) > 4;
    });
    let s3 = data.filter((item) => {
      return parseFloat(item.rating) < 4 && parseFloat(item.rating) > 3;
    });
    let s2 = data.filter((item) => {
      return parseFloat(item.rating) < 3 && parseFloat(item.rating) > 2;
    });
    let s1 = data.filter((item) => {
      return parseFloat(item.rating) < 2 && parseFloat(item.rating) > 1;
    });
    $(".star-5").attr("style", "width:" + s5.length + "%");
    $(".star-4").attr("style", "width:" + s4.length + "%");
    $(".star-3").attr("style", "width:" + s3.length + "%");
    $(".star-2").attr("style", "width:" + s2.length + "%");
    $(".star-1").attr("style", "width:" + s1.length + "%");
  } catch (err) {
    console.log(err);
  }
};

/**
 * create and open a reply modal
 * @param index
 * qiaoliwang (wangqiao@deakin.edu.au)
 */
openReplyModal = (index) => {
  let replyUser = $(`#edit-${index}`).data("user");
  try {
    // create a modal
    $("body")
      .append(`<div id="modalReply-${index}" class="modal reply-modal-wrap">
        <div class="modal-content">
            <p class="reply-title">Reply @${replyUser}</p>
            <textarea class="reply-content"></textarea>
        </div>
        <div class="modal-footer">
            <a onclick="closeReplyModal(${index})" class="text-gray mr-10 text-cap-all">Cancel</a>
            <button class="btn-flat small modal-reply-submit ml-50">Reply</button>
        </div>
    </div>`);

    submitReply(index);
  } catch (err) {
    console.log(err);
  }
};

/**
 * close and remove reply modal from page
 * @param index
 * qiaoliwang (wangqiao@deakin.edu.au)
 */
closeReplyModal = (index) => {
  $(`#modalReply-${index} .modal-content .notice-data`).remove();
  $(`#modalReply-${index} .reply-title`).text("");
  $(`#modalReply-${index} .reply-content`).val("");
  M.Modal.getInstance($(`#modalReply-${index}`)).close();
  $(`#modalReply-${index}`).remove();
};
/**
 * post a reply
 * @param index
 * qiaoliwang (wangqiao@deakin.edu.au)
 */
submitReply = (index) => {
  let replyUser = null,
    reviewId = null,
    content = null,
    currentUser = null,
    currentUid = null,
    replyUid = null;

  let reply = {};

  // open the modal by index
  $(".modal").modal();
  M.Modal.getInstance($(`#modalReply-${index}`)).open();
  // clear error notice data
  $(`#modalReply-${index} .modal-content .notice-data`).remove();

  replyUser = $(`#reply-${index}`).data("user");
  replyUid = $(`#user-${index}`).data("uid");
  reviewId = $(`#reply-${index}`).data("id");
  currentUser = $("#userNameSpan").text().trim();
  currentUid = $("#userNameSpan").data("userid");

  try {
    // if not user login redirect to home(login)
    if (!currentUser || !replyUser || !reviewId) {
      location.href = "/home/home.html";
    } else {
      $(`#modalReply-${index} .modal-reply-submit`).on("click", function () {
        // get reply content
        content = $(`#modalReply-${index} .reply-content`).val();

        if (content) {
          reply = {
            user: currentUser,
            uid: currentUid,
            replyUser: replyUser,
            replyUid: replyUid,
            reviewId: reviewId,
            content: content,
          };
          // set button disabled
          $(`#modalReply-${index} .modal-reply-submit`).attr("disabled", true);

          // request server side
          $.post("/rateAndReview/addReply", reply, (res) => {
            if (res.status === 200) {
              // if success close modal and render reply data to page
              closeReplyModal(index);
              let responseTemplate = `<div class="response-item">
                          <b>Response from ${
                            res.data.uid === res.data.replyUid
                              ? "the author"
                              : res.data.user
                          } </b>
                          <div class="text-gray"> ${moment(
                            res.createTime
                          ).fromNow()}</div>
                          <div class="response-content mt-10"> ${
                            res.data.content
                          }</div>
                        </div>`;
              $(`.response-list.response-${index}`).append(responseTemplate);
            }
          });
        } else {
          // if not reply content
          $(`#modalReply-${index} .modal-reply-submit`).attr("disabled", false);
          $(`#modalReply-${index} .reply-content`).after(
            '<div class="notice-data">Please enter your reply</div>'
          );
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
};

/**
 * get replies by review id
 * @param reviewId
 * @param index
 */
getReplies = (reviewId, index) => {
  let result = {};
  $(".response-list").empty();
  try {
    $.get("/rateAndReview/replies", reviewId, (res) => {
      if (res.status === 200) {
        result = res.data;
        result.forEach((item) => {
          let responseTemplate = `<div class="response-item">
                          <b>Response from ${
                            item.uid === item.replyUid
                              ? "the author"
                              : item.user
                          } </b>
                          <div class="text-gray"> ${moment(
                            item.createTime
                          ).fromNow()}</div>
                          <div class="response-content mt-10"> ${
                            item.content
                          }</div>
                        </div>`;

          $(`.response-list.response-${index}`).append(responseTemplate);
        });
      }
    });
  } catch (err) {
    console.log(err);
  }
};

EditModal = (index) => {
  let currentEditUser = $(`#edit-${index}`).data("user");
  let currentReview = $(`#edit-${index}`).data("review");
  // creates a edit modal window
  $("body").append(`<div id="modalEdit-${index}" class="modal edit-modal-wrap">
      <div class="modal-content">
          <p class="edit-title">${currentEditUser}</p>
          <textarea class="edit-content">${currentReview}</textarea>
      </div>
      <div class="modal-footer">
          <a onclick="closeEditModal(${index})" class="text-gray mr-10 text-cap-all">Cancel</a>
          <button class="btn-flat small modal-edit-submit ml-50">Submit</button>
      </div>
  </div>`);
  editReview(index);
};

editReview = (index) => {
  // Initiates edit modal open
  $(".modal").modal();
  M.Modal.getInstance($(`#modalEdit-${index}`)).open();
  reviewId = $(`#edit-${index}`).data("id");
  review = $(`#edit-${index}`).data("review");
  currentUser = $("#userNameSpan").text().trim();
  currentUserUid = $("#userNameSpan").data("userid");

  if (!currentUser || !reviewId) {
    location.href = "/home/home.html";
  } else {
    $(`#modalEdit-${index} .modal-edit-submit`).on("click", function () {
      content = $(`#modalEdit-${index} .edit-content`).val();

      if (content) {
        newReview = {
          reviewId: reviewId,
          review: content,
        };
        console.log(content);
        $(`#modalEdit-${index} .modal-edit-submit`).attr("disabled", true);

        $.post("/rateAndReview/editReview", newReview, (res) => {
          if (res === "success") {
            window.location.reload(true);
            M.toast({
              html: "successfull!",
              classes: "rounded",
            });
          }
        });
      }
    });
  }
};

closeEditModal = (index) => {
  M.Modal.getInstance($(`#modalEdit-${index}`)).close();
  M.toast({
    html: "Cancelled!",
    classes: "rounded",
  });
  $(`#modalEdit-${index}`).remove();
};

DeleteModal = (index) => {
  let deleteUser = $(`#delete-${index}`).data("user");
  let currentReview = $(`#delete-${index}`).data("review");
  // creates a delete modal window
  $("body")
    .append(`<div id="modalDelete-${index}" class="modal delete-modal-wrap">
          <div class="modal-content">
              <p class="delete-title">${deleteUser}</p>
              <p class="delete-content">${currentReview}</p>
              <p class="delete-content">Do you want to delete this review ?</p>
              
          </div>
          <div class="modal-footer">
              <a onclick="closeDeleteModal(${index})" class="text-gray mr-10 text-cap-all">Cancel</a>
              <button class="btn-flat small modal-delete-submit ml-50">Delete</button>
          </div>
      </div>`);

  deleteReview(index);
};

deleteReview = (index) => {
  //Instantiates Delete modal
  $(".modal").modal();
  M.Modal.getInstance($(`#modalDelete-${index}`)).open();
  reviewId = $(`#delete-${index}`).data("id");
  currentUid = $("#userNameSpan").data("userid");
  if (!currentUid || !reviewId) {
    location.href = "/home/home.html";
  } else {
    $(`#modalDelete-${index} .modal-delete-submit`).on("click", function () {
      if (reviewId) {
        deletedReview = {
          reviewId: reviewId,
        };
        $(`#modalDelete-${index} .modal-delete-submit`).attr("disabled", true);
        $.get("/rateAndReview/deleteReview", deletedReview, (res) => {
          if (res === "success") {
            window.location.reload(true);
            M.toast({
              html: "successfull!",
              classes: "rounded",
            });
          }
          console.log(index);
        });
      }
    });
  }
};
closeDeleteModal = (index) => {
  M.toast({
    html: "Cancelled!",
    classes: "rounded",
  });
  M.Modal.getInstance($(`#modalDelete-${index}`)).close();
  $(`#modalDelete-${index}`).remove();
};
