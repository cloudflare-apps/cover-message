(function() {
  if (!window.addEventListener) return // Check for IE9+

  function submitConstantContact(options, email, cb) {
    if (!options.form || !options.form.listId) {
      return cb(false)
    }

    let xhr, body

    xhr = new XMLHttpRequest()

    body = {
      email,
      ca: options.form.campaignActivity,
      list: options.form.listId
    }

    xhr.open("POST", "https://visitor2.constantcontact.com/api/signup")
    xhr.setRequestHeader("Content-type", "application/json")
    xhr.setRequestHeader("Accept", "application/json")
    xhr.onload = function () {
      cb(xhr && xhr.status < 400)
    }

    xhr.send(JSON.stringify(body))
  }

  function submitFormspree(options, email, cb) {
    let url, xhr, params

    url = "//formspree.io/" + options.email
    xhr = new XMLHttpRequest()

    params = "email=" + encodeURIComponent(email)

    xhr.open("POST", url)
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    xhr.setRequestHeader("Accept", "application/json")
    xhr.onload = function() {
      let jsonResponse = {}

      if (xhr.status < 400) {
        try {
          jsonResponse = JSON.parse(xhr.response)
        } catch (err) { }

        if (jsonResponse && jsonResponse.success === "confirmation email sent") {
          cb("Formspree has sent an email to " + options.email + " for verification.")
        } else {
          cb(true)
        }
      } else {
        cb(false)
      }
    }

    xhr.send(params)
  }

  function emailUtilsSubmitMailchimp(options, email, cb) {
    let cbCode, url, script

    cbCode = "eagerFormCallback" + Math.floor(Math.random() * 100000000000000)

    window[cbCode] = function(resp) {
      cb(resp && resp.result === "success")

      delete window[cbCode]
    }

    url = options.list
    if (!url) {
      return cb(false)
    }

    url = url.replace("http", "https")
    url = url.replace(/list-manage[0-9]+\.com/, "list-manage.com")
    url = url.replace("?", "/post-json?")
    url = url + "&EMAIL=" + encodeURIComponent(email)
    url = url + "&c=" + cbCode

    script = document.createElement("script")
    script.src = url
    document.head.appendChild(script)
  }

  function emailUtilsSubmit(options, email, callback) {
    if (options.destination === "email" && options.email) {
      submitFormspree(options, email, callback)
    } 
    else if (options.destination === "service") {
      if (options.account.service === "mailchimp") {
        emailUtilsSubmitMailchimp(options, email, callback)
      }
      else if (options.account.service === "constant-contact") {
        submitConstantContact(options, email, callback)
      }
    }
  }

  let options = INSTALL_OPTIONS
  let element
  let email

  function hide(event) {
    if (event.target !== this) return

    element.setAttribute("data-visibility", "hidden")
  }

  function handleEmailSubmit(event) {
    event.preventDefault()

    email = event.target.querySelector("input[name='_replyto']").value
    console.log(email)

    function callback(){
      options.message = options.email.postedMessage

      options.goal = "message"

      updateElement()
    }

    emailUtilsSubmit(options, email, callback)
  }
  
  function handlePageSubmit(event) {
    event.preventDefault()

    window.location = options.page.buttonLink
  }

  function updateElement() {
    try {
      localStorage.eagerCoverMessageShown = JSON.stringify(options)
    }
    catch (e) {
    }

    element = Eager.createElement({
      selector: "body",
      method: "append"
    }, element)

    element.classList.add("eager-cover-message")
    element.setAttribute("data-visibility", "visible") // TODO Check if seen before.

    // Elements

    const backdrop = document.createElement("eager-backdrop")
    const dialog = document.createElement("eager-dialog")
    const dialogContent = document.createElement("eager-dialog-content")
    const dialogContentText = document.createElement("eager-dialog-content-text")

    const submitButton = Object.assign(document.createElement("input"), {
      type: "submit",
      className: "submit-button",
      style: `color: ${options.buttonTextColor}; background-color: ${options.buttonBackgroundColor}`
    })

    // Event listeners

    dialog.addEventListener("click", hide)


    // Child appending

    dialogContentText.innerHTML = options.message.html

    if (options.goal === "email") {
      const emailInput = Object.assign(document.createElement("input"), {
        type: "email",
        className: "input-email",
        name: "_replyto",
        placeholder: "Enter your Email"
      })

      const emailForm = Object.assign(document.createElement("form"), {
        id: "email-form",
        method: "post",
        name: "email"
      })

      emailForm.appendChild(emailInput)
      emailForm.appendChild(submitButton)

      submitButton.value = options.email.buttonText

      emailForm.addEventListener("submit", handleEmailSubmit)

      dialogContentText.appendChild(emailForm)
    }
    else if (options.goal === "page") {
      submitButton.value = options.page.buttonText

      const pageForm = Object.assign(document.createElement("form"), {
        className: "page-form"
      })

      pageForm.appendChild(submitButton)

      pageForm.addEventListener("submit", handlePageSubmit)
      dialogContentText.appendChild(pageForm)
    }

    dialogContent.appendChild(dialogContentText)

    dialog.appendChild(dialogContent)

    element.appendChild(backdrop)
    element.appendChild(dialog)
  }

  const alreadyShown = localStorage.eagerCoverMessageShown === JSON.stringify(options)

  function bootstrap() {
    if (alreadyShown && INSTALL_ID !== "preview") return

    updateElement()
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap)
  }
  else {
    bootstrap()
  }

  INSTALL_SCOPE = {
    setOptions(nextOptions) {
      options = nextOptions

      updateElement()
    }
  }
}())
