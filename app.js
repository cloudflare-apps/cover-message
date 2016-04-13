(function(){

  function email$utils$utils$$submit(options, email, callback) {
      if (options.collectOrService === 'collect' && options.userEmail) {
        email$utils$utils$$submitFormspree(options, email, callback);
      } else if (options.collectOrService == 'service') {
        if (options.account.service == 'mailchimp') {
          email$utils$utils$$submitMailchimp(options, email, callback);
        } else if (options.account.service == 'constant-contact') {
          email$utils$utils$$submitConstantContact(options, email, callback);
        }
      }
    }

    function email$utils$utils$$submitFormspree(options, email, cb) {
      var url, xhr, params;

      url = '//formspree.io/' + options.userEmail;
      xhr = new XMLHttpRequest();

      params = 'email=' + encodeURIComponent(email);

      xhr.open('POST', url);
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.onload = function() {
        var jsonResponse = {};
        if (xhr.status < 400) {
          try {
            jsonResponse = JSON.parse(xhr.response);
          } catch (err) {}

          if (jsonResponse && jsonResponse.success === 'confirmation email sent') {
            cb('Formspree has sent an email to ' + options.userEmail + ' for verification.');
          } else {
            cb(true);
          }
        } else {
          cb(false);
        }
      }

      xhr.send(params);
    }function email$utils$utils$$submitMailchimp(options, email, cb) {
      var cbCode, url, script;

      cbCode = 'eagerFormCallback' + Math.floor(Math.random() * 100000000000000);

      window[cbCode] = function(resp) {
        cb(resp && resp.result === 'success');

        delete window[cbCode];
      }

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
    }function email$utils$utils$$submitConstantContact(options, email, cb) {
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
      xhr.onload = function() {
        cb(xhr && xhr.status < 400);
      };

      xhr.send(JSON.stringify(body));
    }

  if (!window.addEventListener || !window.localStorage)
    return;

  var options = INSTALL_OPTIONS;

  function ensureProtocol(url) {
    if (!url || url === '') {
      return url;
    }
    if (!/^https?:\/\//i.test(url) && /^[^\/]+\.[^\/]+\//.test(url)) {
      return 'http://' + url;
    }
    return url;
  }

  function setOptions(opts) {
    options = opts;

    render();

    if (!shown)
      show();
  }

  var email;

  var counter = 0;

  var backdrop = document.createElement('eager-backdrop');
  document.body.appendChild(backdrop);

  var dialog = document.createElement('eager-dialog');
  document.body.appendChild(dialog);

  var content = document.createElement('eager-dialog-content');
  dialog.appendChild(content);

  var closeButton = document.createElement('eager-dialog-close');
  closeButton.addEventListener('click', hide);

  var headingEmail = options.headingEmail;

  var messageEmail = options.messageEmail;

  function render() {
    dialog.setAttribute('eager-theme', options.theme);

    var html = '';
    if (options.imageToggle) {
      html += '<img src="' + options.image + '">';
    }

    if (options.goal === "message" || options.goal === "email" || options.goal === "page") {
      html += '<eager-dialog-content-text>';

      if(options.goal === "message"){
        html += '<h2>' + options.headingMessage + '</h2>';
        html += options.messageMessage.html;
      }

      if (options.goal === "email"){
        html += '<h2>' + headingEmail + '</h2>';
        html += messageEmail.html;
        if(counter === 0){
          html += '<form id="email-form" method="post" " name="email">'
               +  '<input type="email" class="input-email" name="_replyto" placeholder="' + options.emailPlaceholderText + '">'
               +  '<input type="submit" class="email-button" value="send" style="color:' + options.emailButtonTextColor + '; background-color: '+ options.emailButtonColor + '">'
               +  '</form>'
        }
      }

      if (options.goal === "page") {
        html += '<h2>' + options.headingPage + '</h2>';
        html += options.messagePage.html;
        html += '<form action="' + options.buttonLink + '">'
             +  '<input style="color: ' + options.buttonTextColor + '; background-color: ' + options.buttonColor + '" class="page-button" type="submit" value="' + options.buttonText + '">'
             +  '</form>';
      }

      html += '</eager-dialog-content-text>';
    }

    content.innerHTML = html;
    content.appendChild(closeButton);
  }

  window.onload = function(){
  if(options.goal === "email"){
    var emailForm = document.getElementById("email-form");
    emailForm.addEventListener('submit', function(event) {
      event.preventDefault();

      email = event.target.querySelector("input[name='_replyto']").value;
      headingEmail = options.headingEmailPost;
      messageEmail = options.messageEmailPost;

      callback = function(ok) {

          if (ok) {

            if (typeof ok == 'string') {
              body.innerHTML = ok;
            }

            setTimeout(hide, 3000);
          } else {
            messageEmail = 'Whoops, something didn’t work. Please try again.';
          }
        };

      email$utils$utils$$submit(options, email, callback);
      counter += 1;
      render();
    })
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render());
  }
  else {
    render();
  }


  var boundEls = [backdrop, dialog];
  for (var i=boundEls.length; i--;){
    (function(i){
      boundEls[i].addEventListener('click', function(e){
        if (e.target === boundEls[i] && shown){
          hide();
          e.preventDefault();
        }
      });
    })(i);
  }

  var shown = false;

  function show() {

    render();
    dialog.className = 'eager-is-shown';
    backdrop.className = 'eager-is-shown';
    shown = true;

    

    document.body.scrollTop = 0;
  }

  function hide() {

    dialog.className = '';
    backdrop.className = '';
    shown = false;
  }

  var IS_PREVIEW = INSTALL_ID === 'preview';
  var ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

  var outsideDates = false;
  if (!IS_PREVIEW){
    if (options.hideBeforeToggle && options.hideBefore){
      if (new Date(options.hideBefore) > new Date())
        outsideDates = true;
    }
    if (options.hideAfterToggle && options.hideAfter){
      if ((+new Date(options.hideAfter) + ONE_DAY_IN_MS) < new Date())
        outsideDates = true;
    }
  }

  var alreadyShown = options.showFrequency === 'once' && localStorage.eagerCoverMessageShown && localStorage.eagerCoverMessageShown === JSON.stringify(options);

  if ((!outsideDates && !alreadyShown) || IS_PREVIEW)
    show();

  INSTALL_SCOPE.setOptions = setOptions;

})();