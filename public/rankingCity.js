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
    ("<div>");
    ranking_data.forEach((item) => {
      template = `<div class="rankingList-item-info">
  <table class="ranking-table" style="width:100%">
  <tr>
    <th>City</th>
    <th>Rating</th> 
  </tr>
  <tr>
    <td> ${item.city}</td>
    <td>${item.rating}</td>
  </tr>
</table>
  </div>`;
      $(`.ranking-list`).append(template);
    });
  });
};
getData = function (data) {
  let average = data.sort(function (a, b) {
    return b.rating - a.rating;
  });
};
