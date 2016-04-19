(function () {
  'use strict';

  function submitFormspree(options, email, cb) {
    var url, xhr, params;

    url = '//formspree.io/' + options.email;
    xhr = new XMLHttpRequest();

    params = 'email=' + encodeURIComponent(email);

    xhr.open('POST', url);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.onload = function () {
      var jsonResponse = {};
      if (xhr.status < 400) {
        try {
          jsonResponse = JSON.parse(xhr.response);
        } catch (err) {}

        if (jsonResponse && jsonResponse.success === 'confirmation email sent') {
          cb('Formspree has sent an email to ' + options.email + ' for verification.');
        } else {
          cb(true);
        }
      } else {
        cb(false);
      }
    };

    xhr.send(params);
  };

  function submitMailchimp(options, email, cb) {
    var cbCode, url, script;

    cbCode = 'eagerFormCallback' + Math.floor(Math.random() * 100000000000000);

    window[cbCode] = function (resp) {
      cb(resp && resp.result === 'success');

      delete window[cbCode];
    };

    url = options.list;
    if (!url) {
      return cb(false);
    }

    url = url.replace('http', 'https');
    url = url.replace(/list-manage[0-9]+\.com/, 'list-manage.com');
    url = url.replace('?', '/post-json?');
    url = url + '&EMAIL=' + encodeURIComponent(email);
    url = url + '&c=' + cbCode;

    script = document.createElement('script');
    script.src = url;
    document.head.appendChild(script);
  };

  function submitConstantContact(options, email, cb) {
    if (!options.form || !options.form.listId) {
      return cb(false);
    }

    var xhr, body;

    xhr = new XMLHttpRequest();

    body = {
      email: email,
      ca: options.form.campaignActivity,
      list: options.form.listId
    };

    xhr.open('POST', 'https://visitor2.constantcontact.com/api/signup');
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.onload = function () {
      cb(xhr && xhr.status < 400);
    };

    xhr.send(JSON.stringify(body));
  };

  var escapeElement = document.createElement("textarea");

  function esc() {
    var content = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];

    escapeElement.textContent = content;

    return escapeElement.innerHTML;
  }

  function announcement(options) {
    return "\n    <eager-dialog-content-title>" + esc(options.announcementTitle || "Announcement") + "</eager-dialog-content-title>\n    " + esc(options.announcementText || "Sale! Everything is 75% off this entire week.") + "\n\n    <form>\n      <input type=\"submit\" value=\"" + esc(options.announcementButtonText || "Got it!") + "\">\n    </form>\n  ";
  }

  function cta(options) {
    return "\n    <eager-dialog-content-title>" + esc(options.ctaTitle || "New products!") + "</eager-dialog-content-title>\n\n    " + esc(options.ctaText || "We just launched an amazing new product!") + "\n\n    <form>\n      <input type=\"submit\" value=\"" + esc(options.ctaButtonText || "Take me there!") + "\">\n    </form>\n  ";
  }

  function signup(options) {
    return "\n    <eager-dialog-content-title>" + esc(options.signupTitle || "Sign up") + "</eager-dialog-content-title>\n    " + (options.signupText || "Join our mailing list to be the first to know what we’re up to!") + "\n\n    <form>\n      <input\n        name=\"_replyto\"\n        placeholder=\"" + esc(options.signupInputPlaceholder || "Email address") + "\"\n        required\n        type=\"email\" />\n      <input type=\"submit\" value=\"" + esc(options.signupButtonText || "Sign up!") + "\">\n    </form>\n  ";
  }

  function signupSuccess(options) {
    return "\n    <eager-dialog-content-title>" + esc(options.signupSuccessTitle || "Thanks for signing up!") + "</eager-dialog-content-title>\n    " + esc(options.signupSuccessText || "You'll be kept up to date with our newsletter.") + "\n  ";
  }

var renderers = Object.freeze({
    announcement: announcement,
    cta: cta,
    signup: signup,
    signupSuccess: signupSuccess
  });

  (function () {
    if (!window.addEventListener) return; // Check for IE9+
    var preview = INSTALL_ID === "preview";
    var options = INSTALL_OPTIONS;
    var element = void 0;

    function delegateEmailSubmit(options, email, callback) {
      if (options.signupDestination === "email" && options.userEmail) {
        submitFormspree(options, email, callback);
      } else if (options.signupDestination === "service") {
        if (options.account.service === "mailchimp") {
          submitMailchimp(options, email, callback);
        } else if (options.account.service === "constant-contact") {
          submitConstantContact(options, email, callback);
        }
      }
    }

    function hide(event) {
      if (event && event.target !== this) return;

      element.setAttribute("data-visibility", "hidden");
      document.body.style.overflow = "";
    }

    var submitHandlers = {
      signup: function signup(event) {
        event.preventDefault();

        element.setAttribute("data-form", "submitting");

        var email = event.target.querySelector("input[name='_replyto']").value;

        delegateEmailSubmit(options, email, function (ok) {
          element.setAttribute("data-form", "submitted");
          options.goal = "signupSuccess";

          if (ok) {
            setTimeout(hide, 3000);
          } else {
            options.signupSuccessTitle = "Whoops";
            options.signupSuccessText = "Something didn’t work. Please check your email address and try again.";
          }

          updateElement();
        });
      },
      cta: function cta(event) {
        event.preventDefault();

        if (preview) {
          window.location.reload();
        } else {
          window.location = options.ctaLinkAddress;
        }
      },
      announcement: function announcement(event) {
        event.preventDefault();

        element.setAttribute("data-visibility", "hidden");
      }
    };

    function updateElement() {
      try {
        localStorage.eagerCoverMessageShown = JSON.stringify(options);
      } catch (e) {}

      element = Eager.createElement({
        selector: "body",
        method: "append"
      }, element);

      element.classList.add("eager-cover-message");
      element.setAttribute("data-visibility", "visible");
      element.setAttribute("data-goal", options.goal);

      document.body.style.overflow = "hidden";

      var children = renderers[options.goal](options);

      element.innerHTML = "\n      <eager-backdrop></eager-backdrop>\n\n      <eager-dialog>\n        <eager-dialog-content>\n          <eager-dialog-close-button></eager-dialog-close-button>\n\n          <eager-dialog-content-text>\n            " + children + "\n          </eager-dialog-content-text>\n        </eager-dialog-content>\n      </eager-dialog>\n    ";

      element.querySelector("form").addEventListener("submit", submitHandlers[options.goal]);

      element.querySelector("eager-dialog").addEventListener("click", hide);
      element.querySelector("eager-dialog-close-button").addEventListener("click", hide);
      element.querySelector("input[type='submit']").style.backgroundColor = options.color;

      if (options.goal === "signup" && !options.userEmail) {
        var emailInput = element.querySelector("form input[type='email']");
        var submitInput = element.querySelector("form input[type='submit']");

        emailInput.placeholder = "Please fill your email in the Eager app installer.";
        emailInput.disabled = true;
        submitInput.disabled = true;
      }
    }

    function bootstrap() {
      var alreadyShown = localStorage.eagerCoverMessageShown === JSON.stringify(options);

      if (alreadyShown && !preview) return;

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

}());