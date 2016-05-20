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

	var options = { "properties": { "goal": { "order": 1, "title": "What’s the goal you’re trying to achieve?", "type": "string", "format": "radios", "enum": ["signup", "cta", "announcement"], "enumNames": { "signup": "Gather emails to sign visitors up for your newsletter.", "cta": "Redirect them to a special page.", "announcement": "Just show a message." }, "default": "signup" }, "ctaTitle": { "order": 2, "showIf": { "goal": "cta" }, "title": "Message title", "type": "string", "default": "New products!" }, "ctaText": { "order": 3, "showIf": { "goal": "cta" }, "title": "Message text", "format": "textarea", "type": "string", "default": "We just launched an amazing new product!" }, "ctaButtonText": { "order": 4, "showIf": { "goal": "cta" }, "title": "Button text", "type": "string", "default": "Take me there!" }, "ctaLinkAddress": { "order": 5, "showIf": { "goal": "cta" }, "title": "URL to drive traffic to", "type": "string", "default": "http://" }, "signupDestination": { "order": 6, "default": "email", "title": "What should we do with the emails we collect?", "type": "string", "format": "radios", "showIf": { "goal": "signup" }, "enum": ["email", "service"], "enumNames": { "email": "Send me an email with the collected email address.<span class=\"help-text\"><small>Powered by <a href=\"http://formspree.io\" target=\"_blank\" class=\"with-inherited-color\"><strong>Formspree</strong></a></small></span>", "service": "Add them as contacts to the mailing list service of my choice.<span class=\"help-text\"><small>Currently, <a href=\"http://www.constantcontact.com\" target=\"_blank\" class=\"with-inherited-color\"><strong>Constant Contact</strong></a> and <a href=\"http://mailchimp.com\" target=\"_blank\" class=\"with-inherited-color\"><strong>Mailchimp</strong></a> are supported.</small></span>" } }, "email": { "order": 7, "showIf": { "goal": "signup", "signupDestination": "email" }, "title": "What email address should signups be sent to?", "description": "<strong>Required</strong>", "placeholder": "you@email.com", "type": "string" }, "account": { "order": 8, "title": "Mailing list service", "description": "Select the mailing list service which you would like to send subscriptions to.", "type": "object", "format": "account", "services": ["mailchimp", "constant-contact"], "showIf": { "goal": "signup", "signupDestination": "service" } }, "list": { "order": 9, "title": "List", "description": "Select the list in your account which email submissions should be added to", "type": "string", "default": "", "enum": [""], "enumNames": { "": "Loading lists..." }, "showIf": { "goal": "signup", "signupDestination": "service", "account.service": { "op": "!=", "value": null } } }, "signupTitle": { "order": 10, "showIf": { "goal": "signup" }, "title": "Message title", "type": "string", "default": "Sign up" }, "signupText": { "order": 11, "showIf": { "goal": "signup" }, "title": "Message text", "format": "textarea", "type": "string", "default": "Join our mailing list to be the first to know what we’re up to!" }, "signupInputPlaceholder": { "order": 12, "showIf": { "goal": "signup" }, "title": "Input placeholder text", "type": "string", "default": "Email address" }, "signupButtonText": { "order": 13, "showIf": { "goal": "signup" }, "title": "Button text", "type": "string", "default": "Sign up!" }, "signupSuccessTitle": { "order": 14, "showIf": { "goal": "signup" }, "title": "Thank you title", "description": "This title will display after visitors enter their email.", "type": "string", "default": "Thanks for signing up!" }, "signupSuccessText": { "order": 15, "showIf": { "goal": "signup" }, "title": "Thank you text", "description": "This text will display after visitors enter their email.", "type": "string", "default": "You'll be kept up to date with our newsletter." }, "announcementTitle": { "order": 16, "showIf": { "goal": "announcement" }, "title": "Message title", "type": "string", "default": "Announcement" }, "announcementText": { "order": 17, "showIf": { "goal": "announcement" }, "title": "Message text", "format": "textarea", "type": "string", "default": "Sale! Everything is 75% off this entire week." }, "announcementButtonText": { "order": 18, "showIf": { "goal": "announcement" }, "title": "Button text", "type": "string", "default": "Got it!" }, "color": { "order": 19, "title": "Accent color", "type": "string", "format": "color", "default": "#0099ff" } } };

	var schema = options.properties;

	var escapeElement = document.createElement("textarea");

	function esc() {
	  var content = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];

	  escapeElement.textContent = content;

	  return escapeElement.innerHTML;
	}

	function get(options, key) {
	  return esc(options[key] || schema[key].default || "");
	}

	function announcement(options) {
	  return "\n    <eager-dialog-content-title>" + get(options, "announcementTitle") + "</eager-dialog-content-title>\n    " + get(options, "announcementText") + "\n\n    <form>\n      <input type=\"submit\" value=\"" + get(options, "announcementButtonText") + "\">\n    </form>\n  ";
	}

	function cta(options) {
	  return "\n    <eager-dialog-content-title>" + get(options, "ctaTitle") + "</eager-dialog-content-title>\n\n    " + get(options, "ctaText") + "\n\n    <form>\n      <input type=\"submit\" value=\"" + get(options, "ctaButtonText") + "\">\n    </form>\n  ";
	}

	function signup(options) {
	  return "\n    <eager-dialog-content-title>" + get(options, "signupTitle") + "</eager-dialog-content-title>\n\n    " + get(options, "signupText") + "\n\n    <form>\n      <input\n        name=\"_replyto\"\n        placeholder=\"" + get(options, "signupInputPlaceholder") + "\"\n        required\n        type=\"email\" />\n      <input type=\"submit\" value=\"" + get(options, "signupButtonText") + "\">\n    </form>\n  ";
	}

	function signupSuccess(options) {
	  return "\n    <eager-dialog-content-title>" + get(options, "signupSuccessTitle") + "</eager-dialog-content-title>\n    " + get(options, "signupSuccessText") + "\n  ";
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

	  function delegateEmailSubmit(receiver, callback) {
	    if (options.signupDestination === "email" && options.email) {
	      submitFormspree(options, receiver, callback);
	    } else if (options.signupDestination === "service") {
	      if (options.account.service === "mailchimp") {
	        submitMailchimp(options, receiver, callback);
	      } else if (options.account.service === "constant-contact") {
	        submitConstantContact(options, receiver, callback);
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

	      delegateEmailSubmit(email, function (ok) {
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

	    element.querySelector("eager-dialog").addEventListener("click", hide);

	    var formElement = element.querySelector("form");
	    var closeButton = element.querySelector("eager-dialog-close-button");

	    if (formElement) {
	      formElement.addEventListener("submit", submitHandlers[options.goal]);
	      formElement.querySelector("input[type='submit']").style.backgroundColor = options.color;
	    }

	    closeButton.addEventListener("click", hide);
	    element.addEventListener("click", hide);

	    if (options.goal === "signup" && options.signupDestination === "email" && !options.email) {
	      var emailInput = element.querySelector("form input[type='email']");
	      var submitInput = element.querySelector("form input[type='submit']");

	      emailInput.placeholder = "Provide your email in the Eager app installer.";
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

	  window.INSTALL_SCOPE = {
	    setOptions: function setOptions(nextOptions) {
	      options = nextOptions;

	      updateElement();
	    }
	  };
	})();

}());