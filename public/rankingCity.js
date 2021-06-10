$(document).ready(function () {});
removeDuplicates = (data, key) => {
  return [new Map(data.map((item) => [key(item), item])).values()];
};
showRankingList = () => {
  $.get("/rankingCityData/allCities", {}, (result) => {
    //console.log(result, "res");
    let data = result.data;
    // var filterData = data.reduce(function (data, c) {
    //   data[c.city] = (data[c.city] || 0) + 1;
    //   return data;
    // }, {});

    // var resultAverageData = data.filter(function (obj) {
    //   return filterData[obj.city] < 2;
    // });

    let newArray = removeDuplicates(data, (item) => item.city);
    // console.log(newArray, "new Array");
    let finaldata = Array.from(newArray[0]);
    // let finaldata = [...newArray];
    console.log(finaldata, "Array");

    var ranking_data = [];

    // $.getJSON("/rateAndReview/averageRate", function(data){
    //     $.each(data, function(key, ))
    // })

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
          getData = function (data) {
            //   console.log(data, "???");
            let average = data.sort(function (a, b) {
              return b.rating - a.rating;
            });
            console.log(average, "Working");
          };
          getData(ranking_data);
        },
      });
      console.log(ranking_data, "Checking");
    }
    console.log(ranking_data, "Checking Outside");
    // console.log(ranking_data, "Hello");
    // let finalArray = ranking_data.map(function (obj) {
    //   return obj;
    // });
    // console.log(finalArray, "final Array");
    // for (let i in ranking_data) {
    //   let newArray = [];
    //   newArray.push([i, ranking_data[i]]);
    // }

    // console.log(, "New Data");

    // let a = finaldata.forEach((item) => {
    //   $.ajax({
    //     type: "GET",
    //     url: "/rateAndReview/averageRate",
    //     async: false,
    //     dataType: "json",
    //     data: { city: item.city },
    //     success: function (json) {
    //       php_data.push(json);
    //     },
    //   });
    //   console.log(php_data, "data");
    // });

    // console.log(a, "a");
  });
};

showRankingList();
