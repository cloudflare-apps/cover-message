"use strict";

(function () {
  if (!window.addEventListener) return; // Check for IE9+

  var options = INSTALL_OPTIONS;
  var element = void 0;
  var email = void 0;

  function hide(event) {
    if (event.target !== this) return;

    element.setAttribute("data-visibility", "hidden");
  }

  function handleEmailSubmit(event) {
    event.preventDefault();

    email = event.target.querySelector("input[name='_replyto']").value;
    console.log(email);

    // dialogContentText.innerHTML = options.postedMessage
    // run function that goes through all other functions to see what one it needs
    // updateElement() but we need an update element that skips rendering the email form
  }

  // shouldn't need if we properly log that the app has displayed before

  function handlePageSubmit(event) {
    event.preventDefault();

    window.location = options.page.buttonLink;
  }

  function updateElement() {
    try {
      localStorage.eagerCoverMessageShown = JSON.stringify(options);
    } catch (e) {}

    element = Eager.createElement({
      selector: "body",
      method: "append"
    }, element);

    element.classList.add("eager-cover-message");
    element.setAttribute("data-visibility", "visible"); // TODO Check if seen before.

    // Elements

    var backdrop = document.createElement("eager-backdrop");
    var dialog = document.createElement("eager-dialog");
    var dialogContent = document.createElement("eager-dialog-content");
    var dialogContentText = document.createElement("eager-dialog-content-text");
    var closeButton = document.createElement("eager-dialog-close-button");

    var submitButton = Object.assign(document.createElement("input"), {
      type: "submit",
      className: "submit-button",
      style: "color: " + options.buttonTextColor + "; background-color: " + options.buttonBackgroundColor
    });

    // Event listeners

    dialog.addEventListener("click", hide);
    closeButton.addEventListener("click", hide);

    // Child appending

    dialogContentText.innerHTML = options.message.html;

    if (options.goal === "email") {
      var emailInput = Object.assign(document.createElement("input"), {
        type: "email",
        className: "input-email",
        name: "_replyto",
        placeholder: "Enter your Email"
      });

      var emailForm = Object.assign(document.createElement("form"), {
        id: "email-form",
        method: "post",
        name: "email"
      });

      emailForm.appendChild(emailInput);
      emailForm.appendChild(submitButton);

      submitButton.value = options.email.buttonText;

      emailForm.addEventListener("submit", handleEmailSubmit);

      dialogContentText.appendChild(emailForm);
    } else if (options.goal === "page") {
      submitButton.value = options.page.buttonText;

      var pageForm = Object.assign(document.createElement("form"), {
        className: "page-form"
      });

      pageForm.appendChild(submitButton);

      pageForm.addEventListener("submit", handlePageSubmit);
      dialogContentText.appendChild(pageForm);
    }

    dialogContent.appendChild(dialogContentText);
    dialogContent.appendChild(closeButton);

    dialog.appendChild(dialogContent);

    element.appendChild(backdrop);
    element.appendChild(dialog);
  }

  var alreadyShown = localStorage.eagerCoverMessageShown === JSON.stringify(options);

  function bootstrap() {
    if (alreadyShown && INSTALL_ID !== "preview") return;

    updateElement();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }

  INSTALL_SCOPE = {
    setOptions: function setOptions(nextOptions) {
      options = nextOptions;

      updateElement();
    }
  };
})();