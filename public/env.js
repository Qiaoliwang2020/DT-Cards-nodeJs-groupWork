$(document).ready(function(){

  
  $(document).ready(function(){
    $('.tabs').tabs();
  });
  console.log('Ready Test')

  $('.modal').modal();

  //bind the button

  $('.podCard').click( (e) => {
    let el=e.currentTarget.attributes;
    // console.log(el.data.value)

    podID = el.data.value;

    data = {
      podID
    }

    $.get('/data/pod', data, podHistory => {
      $('.historical-data').html("")

      $.each(podHistory, (index, value) => {
        // console.log(value)
        $(`#${value.podID}_historical-data`).append(`
          <div class="card-panel col l12" >
                
            <div class="card-content">
              <div >
                <div class="col s12 " > <span> <b> Reading </b> </span></div>
                <div class="col s6 l6 "> <span>  ${moment.unix(parseInt(value.timeStamp)).format('l - LT')} </span> </div>
                <div class="col s6 l6 "> <span>  ${value.insectsAmount} </span> </div>
              </div>
            
          </div>
        `)
      })
    })
  })

  $('.recordButton').click( (e) =>{
      e.preventDefault();
    

      const _id = e.target.id;
      const insectsAmount = document.getElementById(`${_id}_insectsAmount`).value;
      const timeStamp = moment().unix();

      let data = {
        _id,
        insectsAmount,
        timeStamp
      }

    //  console.log(data);

      $.post('/counter', data, (result) => {
        // console.log(result)
        if (result === 'success' ) {
          $('main').html(`
            <div class='preloader-wrapper big active'>
              <div class='spinner-layer spinner-blue-only'>
                <div class='circle-clipper left'>
                  <div class='circle'></div>
                </div><div class='gap-patch'>
                  <div class='circle'></div>
                </div><div class='circle-clipper right'>
                  <div class='circle'></div>
                </div>
              </div>
            </div>
          `);

          setTimeout(()=>{
            window.location.reload();
          },1000)
        }
      })

  })


  
  $('#addAreaButton').click( () => {
    const podName = document.getElementById('podName').value
    // console.log(podName)

    let data = {
      podName
    };

    $.post('/counter/createArea', data, (result) => {
      // console.log(result)
      if (result === 'success' ) {
        $('main').html(`
          <div class='preloader-wrapper big active'>
            <div class='spinner-layer spinner-blue-only'>
              <div class='circle-clipper left'>
                <div class='circle'></div>
              </div><div class='gap-patch'>
                <div class='circle'></div>
              </div><div class='circle-clipper right'>
                <div class='circle'></div>
              </div>
            </div>
          </div>
        `);

        setTimeout(()=>{
          window.location.reload();
        },2000)
      }
    })
  })

})
