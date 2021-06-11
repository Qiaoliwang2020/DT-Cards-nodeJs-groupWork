$(document).ready(function () {
  showRankingList();
});
removeDuplicates = (data, key) => {
  return [new Map(data.map((item) => [key(item), item])).values()];
};
showRankingList = () => {
  $.get("/rankingCityData/allCities", {}, (result) => {
    let data = result.data;

    let newArray = removeDuplicates(data, (item) => item.city);

    let finaldata = Array.from(newArray[0]);

    console.log(finaldata, "Array");

    var ranking_data = [];

    for (let i = 0; i < finaldata.length; i++) {
      const element = finaldata[i];
      $.ajax({
        type: "GET",
        url: "/rateAndReview/averageRate",
        async: false,
        dataType: "json",
        data: { city: element.city },
        success: function (json) {
          ranking_data.push(json);
          getData(ranking_data);
        },
      });
    }
    console.log(ranking_data, "Checking Outside");
    let template = "";
    $(".ranking-list").empty();
    ranking_data.forEach((item) => {
      console.log(item, "ot");
      template = `<div class="rankingList-item-info">
          <div class="h-item-title">
          ${item.city}
          </div>
          <div class="h-item-title">
          ${item.rating}
          </div>
  </div>`;
      $(`.ranking-list`).append(template);
    });
  });
};
getData = function (data) {
  let average = data.sort(function (a, b) {
    return b.rating - a.rating;
  });
  console.log(average, "Working");
};
