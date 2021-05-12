(function() {
    var _elementsModal_stripe;
    var _elementsModal_HOST_URL = "";
    var _elementsBackground_color = $('.payment-details').data('color')

    function init(content, paymentIntent) {
        var amount = calculateDisplayAmountFromCurrency(paymentIntent);
        var modal = document.createElement("div");
        modal.className = "ElementsModal--modal";
        modal.innerHTML = `
      <div class="ElementsModal--modal-content">
      <div class="ElementsModal--top-banner" style="background: ${_elementsBackground_color}">
        <div class="ElementsModal--sales-info">
          <div class="ElementsModal--top">
            <div class="ElementsModal--company">${content.businessName ||
        ""}</div>
            <button class="ElementsModal--close" onClick="window.elementsModal.toggleElementsModalVisibility()">
              <svg
                width="20px"
                height="20px"
                viewBox="0 0 20 20"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
              >
                <defs>
                  <path
                    d="M10,8.8766862 L13.6440403,5.2326459 C13.9542348,4.92245137 14.4571596,4.92245137 14.7673541,5.2326459 C15.0775486,5.54284044 15.0775486,6.04576516 14.7673541,6.3559597 L11.1238333,9.99948051 L14.7673541,13.6430016 C15.0775486,13.9531961 15.0775486,14.4561209 14.7673541,14.7663154 C14.4571596,15.0765099 13.9542348,15.0765099 13.6440403,14.7663154 L10,11.1222751 L6.3559597,14.7663154 C6.04576516,15.0765099 5.54284044,15.0765099 5.2326459,14.7663154 C4.92245137,14.4561209 4.92245137,13.9531961 5.2326459,13.6430016 L8.87616671,9.99948051 L5.2326459,6.3559597 C4.92245137,6.04576516 4.92245137,5.54284044 5.2326459,5.2326459 C5.54284044,4.92245137 6.04576516,4.92245137 6.3559597,5.2326459 L10,8.8766862 Z"
                    id="path-1"
                  ></path>
                </defs>
                <g
                  id="Payment-recipes"
                  stroke="none"
                  stroke-width="1"
                  fill="none"
                  fill-rule="evenodd"
                >
                  <g
                    id="Elements-Popup"
                    transform="translate(-816.000000, -97.000000)"
                  >
                    <g id="close-btn" transform="translate(816.000000, 97.000000)">
                      <circle
                        id="Oval"
                        fill-opacity="0.3"
                        fill="#AEAEAE"
                        cx="10"
                        cy="10"
                        r="10"
                      ></circle>
                      <mask id="mask-2" fill="white">
                        <use xlink:href="#path-1"></use>
                      </mask>
                      <use
                        id="Mask"
                        fill-opacity="0.5"
                        fill="#FFFFFF"
                        opacity="0.5"
                        xlink:href="#path-1"
                      ></use>
                    </g>
                  </g>
                </g>
              </svg>
            </button>
          </div>
          <div class="ElementsModal--product ElementsModal--details">${content.productName ||
        ""}</div>
          <div class="ElementsModal--price ElementsModal--details">${amount}</div>
          <div class="ElementsModal--email ElementsModal--details">${content.customerEmail ||
        ""}</div>
        </div>
      </div>
      <div class="ElementsModal--payment-details">
        <form
          class="ElementsModal--payment-form"
          id="payment-form"
        >
          <div class="form-row">
            <div class="ElementsModal--forms">
              <div id="payment-request-section" class="StripeElement--payment-request">
                <div id="payment-request-button" class="StripeElement--payment-request-button">
                <!-- A Stripe Element will be inserted here. -->
                </div>
                <!-- Used to display form errors. -->
                <div
                  id="paymentRequest-errors"
                  class="ElementsModal--error-message"
                  role="alert"
                ></div>
                <div class="ElementsModal--form-divider">
                    <span class="ElementsModal--form-divider-text">Or pay with card</span>
                </div>
              </div>
              <div class="ElementsModal--form">
                <label for="ElementsModal--card-element">
                  <span class="ElementsModal--form-label spacer"
                    >Card details</span
                  >
                  <div class="StripeElement--card mt-10" id="card-element">
                    <!-- A Stripe Element will be inserted here. -->
                  </div>
                </label>
                <!-- Used to display form errors. -->
                <div
                  id="card-errors"
                  class="ElementsModal--error-message"
                  role="alert"
                ></div>
              </div>
              <div class="ElementsModal--form">
                <input
                  type="hidden"
                  name="amount"
                  value="${content.amount}"
                />
                <input
                  type="hidden"
                  name="currency"
                  value="${content.currency}"
                />
                <input
                  type="hidden"
                  name="description"
                  value="${content.productName}"
                />
                <button class="ElementsModal--pay-button mt-30">Pay ${amount}</button>
              </div>
              <!-- Edit your terms and conditions here   -->
              <div class="footer ElementsModal--footer-text">
                By purchasing this ${content.productName}, you agree to ${content.businessName}’s
                <a class="ElementsModal--footer-text" href="stripe.com"
                  >Terms and Conditions.</a
                >
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
    `;
        // insert modal in dom
        document.body.insertBefore(modal, document.body.firstChild);

        getPublicKey().then(key => {
            _elementsModal_stripe = Stripe(key);
            createElements(content, paymentIntent);
            createPaymentRequest(content, paymentIntent);
        });
    }

    function getPublicKey() {
        return fetch(_elementsModal_HOST_URL + "/payment/public-key", {
            method: "get",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                return data.publicKey;
            });
    }

    function toggleElementsModalVisibility() {
        var modal = document.querySelector(".ElementsModal--modal");
        var modalContent = document.querySelector(".ElementsModal--modal-content")
        if (modal && modal.classList) {
            modal.classList.toggle("ElementsModal--show-modal");
            modalContent.classList.toggle("ElementsModal--show-content")
        }
    }

    function createPaymentIntent(content) {
        try{
            return fetch(_elementsModal_HOST_URL + "/payment/payment_intents", {
                method: "post",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(content)
                })
                .then(function(response) {
                    return response.json();
                })
                .then(function(paymentIntent) {
                    if(paymentIntent.error){
                        M.toast({html: paymentIntent.error,displayLength: Infinity,classes: 'red darken-1'})
                    }
                    console.log(paymentIntent,'[aymentIntent')
                    return paymentIntent;
                });
        }
        catch (err){
            console.log(err);
        }

    }

    function createPaymentRequest(content, paymentIntent) {
        var paymentRequest = _elementsModal_stripe.paymentRequest({
            country:'US',
            currency: content.currency,
            total: {
                label: content.productName + ", " + content.businessName,
                amount: paymentIntent.amount
            },
            requestPayerName: true,
            requestPayerEmail: true
        });

        var elements = _elementsModal_stripe.elements();
        var prButton = elements.create("paymentRequestButton", {
            paymentRequest: paymentRequest
        });

        // Check the availability of the Payment Request API first.
        paymentRequest.canMakePayment().then(function(result) {
            if (result) {
                document.getElementById("payment-request-section").style.display =
                    "block";
                prButton.mount("#payment-request-button");
            } else {
                document.getElementById("payment-request-button").style.display =
                    "none";
                document.getElementById("payment-request-section").style.display =
                    "none";
            }
        });

        paymentRequest.on("paymentmethod", function(ev) {
            _elementsModal_stripe
                .confirmCardPayment(
                    paymentIntent.client_secret,
                    { payment_method: ev.paymentMethod.id },
                    { handleActions: false }
                )
                .then(function(confirmResult) {
                    if (confirmResult.error) {
                        // Report to the browser that the payment failed, prompting it to
                        // re-show the payment interface, or show an error message and close
                        // the payment interface.
                        ev.complete("fail");
                    } else {
                        // Report to the browser that the confirmation was successful, prompting
                        // it to close the browser payment method collection interface.
                        ev.complete("success");
                        // Check if payment has fully succeeded and no futher action is needed
                        if (confirmResult.paymentIntent.status === "succeeded") return stripePaymentHandler(confirmResult);
                        // Otherwise, let Stripe.js handle the rest of the payment flow (eg. 3DS authentication is required).
                        _elementsModal_stripe
                            .confirmCardPayment(paymentIntent.client_secret)
                            .then(function(result) {
                                if (result.error) {
                                    // The payment failed -- ask your customer for a new payment method.
                                    var displayError = document.getElementById(
                                        "paymentRequest-errors"
                                    );
                                    displayError.textContent = result.error.message;
                                } else {
                                    // The payment has succeeded.
                                    stripePaymentHandler(confirmResult);
                                }
                            });
                    }
                });
        });
    }

    function create(content) {
        createPaymentIntent(content).then(function(paymentIntent) {
            init(content, paymentIntent);
        });
    }

    function createElements(content, paymentIntent) {
        // Create an instance of Elements.
        var elements = _elementsModal_stripe.elements();

        // Custom styling can be passed to options when creating an Element.
        // (Note that this  uses a wider set of styles than the guide below.)
        var style = {
            base: {
                color: "#32325d",
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                fontSmoothing: "antialiased",
                fontSize: "16px",
                "::placeholder": {
                    color: "#aab7c4"
                }
            },
            invalid: {
                color: "#fa755a",
                iconColor: "#fa755a"
            }
        };

        // Create an instance of the card Element.
        var card = elements.create("card", {
            style: style
        });
        // Add an instance of the card Element into the `card-element` <div>.
        card.mount("#card-element");

        // Handle form submission.
        var form = document.getElementById("payment-form");
        form.addEventListener("submit", function(event) {
            event.preventDefault();

            _elementsModal_stripe
                .confirmCardPayment(paymentIntent.client_secret, {
                    payment_method: {
                        card: card,
                        billing_details: { name: content.customerName }
                    }
                })
                .then(function(result) {
                    if (result.error) {
                        var displayError = document.getElementById("card-errors");
                        displayError.textContent = result.error.message;
                    } else {
                        stripePaymentHandler(result);
                    }
                });
        });
    }

    // Implement logic to handle the users authorization for payment.
    // Here you will want to redirect to a successful payments page, or update the page.
    function stripePaymentHandler(result) {

        let data = result.paymentIntent;

        toggleElementsModalVisibility();

        document.querySelectorAll(".payment-view").forEach(function(view) {
            view.classList.add("hidden");
        });

        document.querySelectorAll(".completed-view").forEach(function(view) {

            view.classList.remove("hidden");

            let createTime = data.create;
            $('#suc-amount').text((data.amount/100).toFixed(2));
            $('#receipt-no').text("Receipt No: "+  moment(createTime).format("ddd-MMYY-hms"));
            $('#create-time').text(moment(createTime).format("dddd, MMMM Do YYYY, h:mm:ss a"));
        });

        let card ={
            cardId:$('#payment-amount').data('id'),
            balance:data.amount/100,
        }
        $.post( "/card/updateBalance",card,(res) =>{
            if(res !== 'success'){
               console.log(res);
            }
        })
    }

    // Allows the user to dismiss the Elements modal when using the esc key
    document.addEventListener("keyup", function(event) {
        if (event.defaultPrevented) {
            return;
        }

        var key = event.key || event.keyCode;

        if (key === "Escape" || key === "Esc" || key === 27) {
            var modal = document.querySelector(".ElementsModal--modal");
            if (modal.classList[1] === "ElementsModal--show-modal") {
                toggleElementsModalVisibility();
            }
        }
    });

    // UI enhancement to dismiss the Elements modal when the user clicks
    // outside of the modal and in the window.
    function dismissElementsModalOnWindowClick(event) {
        var modal = document.querySelector(".ElementsModal--modal");
        if (
            event.target === modal &&
            modal.classList[1] === "ElementsModal--show-modal"
        ) {
            toggleElementsModalVisibility();
        }
    }
    window.addEventListener("click", dismissElementsModalOnWindowClick);

    window.elementsModal = (() => {
        return { create, toggleElementsModalVisibility };
    })();

    function browserLocale() {
        var lang;

        if (navigator.languages && navigator.languages.length) {
            // latest versions of Chrome and Firefox set this correctly
            lang = navigator.languages[0];
        } else if (navigator.userLanguage) {
            // IE only
            lang = navigator.userLanguage;
        } else {
            // latest versions of Chrome, Firefox, and Safari set this correctly
            lang = navigator.language;
        }

        return lang;
    }

    function zeroDecimalCurrencies(currency) {
        var zeroDecimalCurrencies = [
            "BIF",
            "CLP",
            "DJF",
            "GNF",
            "JPY",
            "KMF",
            "KRW",
            "XPF",
            "XOF",
            "XAF",
            "VUV",
            "VND",
            "UGX",
            "RWF",
            "PYG",
            "MGA"
        ];
        return zeroDecimalCurrencies.indexOf(currency);
    }

    function calculateDisplayAmountFromCurrency(paymentIntent) {
        var amountToDisplay = paymentIntent.amount;

        if (zeroDecimalCurrencies(paymentIntent.currency) === -1) {
            amountToDisplay = amountToDisplay / 100;
        }
        return amountToDisplay.toLocaleString(browserLocale(), {
            style: "currency",
            currency: paymentIntent.currency
        });
    }
})();