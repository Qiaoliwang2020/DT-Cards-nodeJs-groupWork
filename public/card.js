$(document).ready(function() {

    let cardNum =  $('.card-number').text().trim();
    let defaultCurrency =  $('#currency').data('currency');

    // generate bar code for the card
    generateBarCode(cardNum);

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
            window.location.href= `/payment?id=${cardNum}&amount=${amount}&currency=${cur}`;
        }else{
            alert(
                "please select or enter an amount"
            )
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
            let data ={
                cardId : cardNum,
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