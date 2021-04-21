$(document).ready(function() {
    // generate a bar code for the card with card number
    let cardNum =  $('.card-number').text().trim();
    JsBarcode("#barcode", cardNum,{
        lineColor: "#000",
        width:1,
        height: 30,
        displayValue: false
    });

    // get amount
    getAmount=()=>{
        let amount = 0;
        amount = $("input[name='amount']:checked").val();

        if(amount === 'others'){
            $('.other-amount').removeClass('hide');
            amount = $('#othersAmount').val();
        }else{
            $('.other-amount').addClass('hide');
        }
        return amount;
    }
    // when amount change
    $('#amount').on('change',function (){
        getAmount();
    })
    // when user click to  pay
    $('#pay').on('click',function (){
        let amount = getAmount();
        if(amount){
            let data ={
                cardId : cardNum,
                balance:amount,
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
        let amount = $('#withdraw-amount').val();
        if(amount){
            let data ={
                cardId : cardNum,
                balance:-amount,
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
                "please enter an amount"
            )
        }
    })
})