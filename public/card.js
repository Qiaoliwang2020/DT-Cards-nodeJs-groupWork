$(document).ready(function() {

    let cardNumber =  $('.card-number').text().trim();
    let defaultCurrency =  $('#currency').data('currency');
    // generate bar code for the card
    generateBarCode(cardNumber);

    getCurrencies(defaultCurrency);

    // when amount change
    $('#amount').on('change',function (){
        getAmount();
    })
    // check exhange rate
    $('#check-exchangeRate').on('click',function (){
        let amount = getAmount();
        let currency = $('#currency').val()
        let data={
            balance :amount,
            currency:currency
        }
        if(amount){
            convertCurrency(data)
        }
        else{
            M.toast({html: "please select or enter an amount",classes: 'red dark-1'})
        }
    })
    // when user click to  pay
    $('#pay').on('click',function (){

        let amount = getAmount();

        if(amount){
            $('#modal-payment').modal('close');
            let cur = $('#currency').val()
            window.location.href= `/payment?id=${cardNumber}&amount=${amount}&currency=${cur}`;
        }else{
            M.toast({html: "please select or enter an amount",classes: 'red dark-1'})
        }
    })
    // withdraw action
    $('#withdrawAction').on('click',function (){

        let cardBalance = parseFloat($('#cardBalance').text())
        if(cardBalance > 0){
            // withdraw
            M.Modal.getInstance($('#modal-withdraw')).open();
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
    })
    // when user click withdraw all
    $('#withdrawAll').on('click',function (){
        let amount = $('#totalAmount').text();
        $('#withdraw-amount').val(amount);
    })
    // when user agree the withdraw notification
    $('#withdrawAgree').on('change',function (value){
        let  agreeCheck = $('#withdrawAgree').is(':checked');
        $('#withdraw').attr('disabled', !agreeCheck)
    })
    // when user click to withdraw
    $('#withdraw').on('click',function (){
        let paymentInfo ={}
        let withdrawAmount = $('#withdraw-amount').val();
        let balance = $('#totalAmount').text();
        let cardPayId = $('#withdraw').data('pid')
        let data ={
            cardId :cardNumber,
            payId :cardPayId
        };
        $.get('/payment/paymentInfo',data,function (res){
            try{
                if(res.data.length >0){
                    paymentInfo = res.data[0]

                    if(withdrawAmount && parseFloat(balance) >= parseFloat(withdrawAmount)){

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
                                refundInfo.receiptNumber = receiptNumber;
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
                }else{
                    M.toast({html: '"please check your balance',  classes: 'red dark-1'});
                }
            }
            catch (err){
                console.log(err)
            }

        })
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
    $.post( "/card/updateBalance",data,(result) =>{
            if(result === 'success'){

                //location.reload();
            }
     })
}
// add payment record to database
addPaymentInfo = (data)=>{
    let payId = '';
    let withdrawAmount = data.amount/100;
    let cardId =  data.cardId;

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
convertCurrency =(data)=>{

    $.post('/payment/convertCurrency',data,function (res){
        if(res.message == 'success'){
            $('.show-currency').text(`${data.currency} ${data.balance} = ${res.currency} ${res.balance}`);
        }
    })
}