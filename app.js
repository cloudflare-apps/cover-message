(function(){

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
        if(counter == 0){
          html += '<form id="email-form" onSubmit="return false;">'
               +  '<input type="email" class="input-email" name="email" placeholder="' + options.emailPlaceholderText + '">'
               +  '<input type="submit" class="email-button" value="' + options.emailButtonText + '" style="color:' + options.emailButtonTextColor + '; background-color: '+ options.emailButtonColor + '">'
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
    function handler(event) {
      event.preventDefault();
      // Do other stuff
      email = event.target.querySelector("input[name='email']").value;
      emailForm.onSubmit = "return false;";
      headingEmail = options.headingEmailPost;
      messageEmail = options.messageEmailPost;
      counter += 1;
      if(counter == 1){
        render();
      }
    }
    emailForm.addEventListener('submit', handler);
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