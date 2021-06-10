$(document).ready(function() {

    let cardNumber =  $('.card-number').text().trim();
    let defaultCurrency =  $('#currency').data('currency');
    let cardBalance = parseFloat($('#cardBalance').text());

    // connect to the socket
    let socket = io();

    // show exchange rate of current currency
    socket.on('currentCurrency', (msg) => {
        let amount = getAmount();
        let currency = $('#currency').val()
        $('.show-currency').text(`${currency} ${amount} = ${msg.currency} ${msg.balance}`);
    })

    // generate bar code for the card
    generateBarCode(cardNumber);

    getCurrencies(defaultCurrency);

    // when currency change
    $('#currency').on('change',function (){
        convertCurrency(socket)
    })
    // when amount change
    $('#amount').on('change',function (){
        convertCurrency(socket)
    })
    // check exhange rate
    $('#check-exchangeRate').on('click',function (){
        try {
            let amount = getAmount();
            if(amount){
                convertCurrency(socket)
            }
            else{
                M.toast({html: "please select or enter an amount",classes: 'red dark-1'})
            }
        }
        catch (err){
            console.log(err, 'check exchange rate')
        }
    })
    // when user click to pay (next)
    $('#pay').on('click',function (){
        try{
            let amount = getAmount();
            let currentUid = $('#userNameSpan').data('userid');

            if(!currentUid){
                location.href = '/home/home.html'
            }else {
                if(amount){
                    $('#modal-payment').modal('close');
                    let cur = $('#currency').val()
                    window.location.href= `/payment?id=${cardNumber}&amount=${amount}&currency=${cur}`;
                }else{
                    M.toast({html: "please select or enter an amount",classes: 'red dark-1'})
                }
            }
        }
        catch (err){
            console.log(err, 'when user click to pay (next)')
        }

    })
    // withdraw action
    $('#withdrawAction').on('click',function (){
        let currentUid = $('#userNameSpan').data('userid');
        try{
            if(!currentUid){
                location.href = '/home/home.html'
            }else{
                if(cardBalance > 0){
                    // withdraw
                    let cardPayId = $('#withdraw').data('pid');
                    console.log(cardPayId,'pid');
                    if(cardPayId){
                        let data ={
                            cardId :cardNumber,
                            payId :cardPayId
                        };
                        M.Modal.getInstance($('#modal-withdraw')).open();
                        $.get('/payment/paymentInfo',data,function (res){
                            if(res.data.length >0){
                                let result = res.data[0];
                                $('#currencyAmount').attr('data-amount',result.amount/100);
                                $('#currencyAmount').attr('data-pid',result.id);
                                $('#currencyAmount').text(`${result.currency.toUpperCase()} ${result.amount/100}`);
                            }
                        })
                    }else{
                        console.log('000');
                        $('#currencyAmount').text(`0`);
                    }
                }
                else {
                    let data ={
                        cardId : cardNumber,
                    }
                    M.Modal.getInstance($('#removeCardNotification')).open();

                    $('#disagreeRemove').on('click',function (){
                        M.Modal.getInstance($('#removeCardNotification')).close();
                    })
                    $('#agreeRemove').on('click',function (){
                        $.post( "/cards/deleteCard",data,(result) =>{
                            if (result == "success"){
                                M.Modal.getInstance($('#removeCardNotification')).close();
                                M.toast({html: "Card removed",classes: 'green dark-1'})
                                setTimeout(function(){
                                    location.href="/home/home.html"
                                }, 2000);

                            }
                        })
                    })
                }
            }
        }
        catch (err){
            console.log(err, 'card detail page withdraw action')
        }
    })
    // when user click withdraw all
    $('#withdrawAll').on('click',function (){
        let amount =  $('#currencyAmount').data('amount');
        $('#withdraw-amount').val(amount);
    })
    // when user agree the withdraw notification
    $('#withdrawAgree').on('change',function (value){
        let  agreeCheck = $('#withdrawAgree').is(':checked');
        $('#withdraw').attr('disabled', !agreeCheck)
    })
    // when user click to withdraw
    $('#withdraw').on('click',function (){
        let paymentInfo ={
            amount : $('#currencyAmount').data('amount'),
            id:$('#currencyAmount').data('pid'),
        }
        let withdrawAmount = $('#withdraw-amount').val();

        try{
            if(withdrawAmount && parseFloat(paymentInfo.amount) >= parseFloat(withdrawAmount)){
                let refund = {
                    amount:withdrawAmount,
                    payment_id: paymentInfo.id
                }
                // create a refund
                $.ajax({
                    type: "POST",
                    url: "/payment/payment_refund",
                    data: refund,
                    success: function(result) {
                        let refundInfo = result.data;
                        let createTime = refundInfo.create;
                        let receiptNumber = moment(createTime).format("ddd-MMYY-hms");

                        $('#modal-payment').modal('close');
                        $('.currency-code').text(refundInfo.currency)
                        $('#suc-amount').text((refundInfo.amount/100).toFixed(2));
                        $('#receipt-no').text("Receipt No: "+  receiptNumber);
                        $('#create-time').text(moment(createTime).format("dddd, MMMM Do YYYY, h:mm:ss a"));

                        $('.completed-view').removeClass('hidden');
                        $('.card-view').addClass('hidden');

                        refundInfo.cardId = cardNumber;
                        refundInfo.userId = $('.page-nav-user').data('userid');
                        refundInfo.receipt_number = receiptNumber;
                        refundInfo.type = "withdraw";
                        addPaymentInfo(refundInfo);
                    },
                    error: function(err){
                        M.toast({html: err.responseJSON.error,displayLength: Infinity, classes: 'red dark-1'});
                    },
                    complete:function (){
                        M.Modal.getInstance($('#modal-withdraw')).close();
                    }
                });
            }else{
                M.toast({html: 'please check your balance!', classes: 'red dark-1'});
            }
        }
        catch (err){
            console.log(err,'when user click to withdraw')
        }
    })

    // simulate user use the card
    $('.card-details').on('click',function (){
        let userId = $('#userNameSpan').data('userid');
        try{
            let travelItem = [
                {
                    title:'4-Elizabeth St/Flinders St to 63-Deakin University/Burwood Hwy',
                    amount:2.5,
                },
                {
                    title:'Brunswick West - Barkly Square Shopping Centre via Hope Street and Sydney Road',
                    amount:4.5,
                },
                {
                    title:'Airport West to Gowanbrae via Melrose Drive and Gowanbrae Drive',
                    amount:5,
                }]
            let randomNum = Math.floor(Math.random() * 3);
            let currentTimestamp = Date.now();
            let city = $('#cityName').text().trim();
            let data = {
                cardId:cardNumber,
                userId:userId,
                amount:travelItem[randomNum].amount*1000,
                title:travelItem[randomNum].title,
                city:city,
                created:currentTimestamp,
                type:"travel",
                currency:"aud",
            }
            //console.log(data);
            addTravelData(data)
        }
        catch (err){
            console.log(err,'simulate user use the card');
        }
    })
})

// generate a bar code for the card with card number
generateBarCode =(cardNumber)=>{
    JsBarcode("#barcode", cardNumber,{
        lineColor: "#000",
        width:1,
        height: 30,
        displayValue: false
    });
}
// get currencies
getCurrencies = (defaultCurrency) => {

    $('#currency').empty();
    try{
        $.get("/payment/currencies", (result) => {

            if(result.message == 'success'){
                let data = result.currencies.data;
                let currencies = data.map(elem => ({
                    currency: elem.currency,
                    code: elem.code
                }));
                currencies.forEach((item)=>{
                    let currency = `<option value="${item.code}">${item.currency} - ${item.code}</option>`
                    $('#currency').append(currency);
                })
                selectElement('currency',defaultCurrency)
            }
        })
    }
    catch (err){
        console.log(err,'get currencies')
    }
}

selectElement =(id, valueToSelect)=> {
    let element = document.getElementById(id);
    element.value = valueToSelect;
}
// get amount
getAmount = () => {
    let amount = 0;
    amount = $("input[name='amount']:checked").val();

    if (amount === 'others') {
        $('.other-amount').removeClass('hide');
        amount = $('#othersAmount').val();
    } else {
        $('.other-amount').addClass('hide');
    }
    return amount;
}

// update transport card balance
updateBalance =(data)=>{
    let cardBalance = parseFloat($('#cardBalance').text())
    try{
        $.post( "/card/updateBalance",data,(result) =>{
            if(result === 'success'){
                $('#cardBalance').text((cardBalance + data.balance).toFixed(2))
            }else{
                console.log('card balance update failed');
            }
        })
    }
    catch (err){
        console.log(err,'update transport card balance')
    }
}
// add payment record to database
addPaymentInfo = (data)=>{
    let payId = '';
    let withdrawAmount = data.amount/100;
    let cardId =  data.cardId;

    try{
        $.post('/payment/addPaymentTransaction',data,function (res) {
            if(res.message == "success"){
                payId = res.data.payId;
                let cardInfo = {
                    cardId:cardId,
                    balance:-withdrawAmount,
                    payId: payId,
                    currency:data.currency
                }
                updateBalance(cardInfo)
            }
        })
    }
    catch (err){
       console.log(err);
    }

}
convertCurrency =(socket)=>{
    let amount = getAmount();
    let currency = $('#currency').val()
    socket.emit('checkExchangeRate', amount,currency);
}

// insert travel data to transaction's collection
addTravelData = (data)=>{
    let cardBalance = parseFloat($('#cardBalance').text());
    let payId = $('#withdraw').data('pid');
    let cost = data.amount/1000;
    try{
        if(cardBalance > data.amount/1000){
            $.post('/travelData/addTransaction',data,function (res) {
                if(res.message == "success"){
                    let cardInfo = {
                        cardId:data.cardId,
                        balance:-cost,
                        payId: payId,
                        currency:data.currency
                    }
                    updateBalance(cardInfo);
                }else{
                    console.log('add travel data failed');
                }
            })
        }else{
            M.toast({html: "not enough balance, please recharge",classes: 'red dark-1'})
        }
    }
    catch (err){
        console.log(err);
    }

}


