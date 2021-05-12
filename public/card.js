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
    // when user click to  pay
    $('#pay').on('click',function (){

        let amount = getAmount();

        if(amount){
            $('#modal-payment').modal('close');
            let cur = $('#currency').val()
            window.location.href= `/payment?id=${cardNumber}&amount=${amount}&currency=${cur}`;
        }else{
            alert(
                "please select or enter an amount"
            )
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
    // when user click to withdraw
    $('#withdraw').on('click',function (){
        let withdrawAmount = $('#withdraw-amount').val();
        let balance = $('#totalAmount').text();
        if(withdrawAmount && parseFloat(balance) >= parseFloat(withdrawAmount)){
            // let data = {
            //     amount:withdrawAmount,
            //     currency: defaultCurrency
            // }
            //
            // $.post( "/payment/payment_refund",data,(result) =>{
            //     console.log(result,'res');
            // })
            let data ={
                cardId : cardNumber,
                balance:-withdrawAmount,
            }
            $.post( "/card/updateBalance",data,(result) =>{
                console.log(result,'res');
                if(result === 'success'){
                    $('#modal-payment').modal('close');
                    location.reload();
                }
            })
        }else{
            alert(
                "please check your balance"
            )
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