(function() {
  if (!window.addEventListener) return // Check for IE9+

  let options = INSTALL_OPTIONS
  let element

  function submitConstantContact(options, email, cb) {
    if (!options.form || !options.form.listId) return cb(false)

    const xhr = new XMLHttpRequest()

    const body = {
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
    const url = `https://formspree.io/${options.userEmail}`
    const xhr = new XMLHttpRequest()
    const params = `email=${encodeURIComponent(email)}`

    xhr.open("POST", url)
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    xhr.setRequestHeader("Accept", "application/json")
    xhr.onload = function() {
      let jsonResponse = {}

      if (xhr.status < 400) {
        try {
          jsonResponse = JSON.parse(xhr.response)
        }
        catch (e) {}

        if (jsonResponse && jsonResponse.success === "confirmation email sent") {
          cb("Formspree has sent an email to " + options.email + " for verification.")
        }
        else {
          cb(true)
        }
      }
      else {
        cb(false)
      }
    }

    xhr.send(params)
  }

  function submitMailchimp(options, email, cb) {
    const cbCode = "eagerFormCallback" + Math.floor(Math.random() * 100000000000000)

    window[cbCode] = function(resp) {
      cb(resp && resp.result === "success")

      delete window[cbCode]
    }

    let url = options.list

    if (!url) return cb(false)

    url = url.replace("http", "https")
    url = url.replace(/list-manage[0-9]+\.com/, "list-manage.com")
    url = url.replace("?", "/post-json?")
    url = url + "&EMAIL=" + encodeURIComponent(email)
    url = url + "&c=" + cbCode

    const script = Object.assign(document.createElement("script"), {
      src: url
    })

    document.head.appendChild(script)
  }

  function emailUtilsSubmit(options, email, callback) {
    if (options.signupDestination === "email" && options.userEmail) {
      submitFormspree(options, email, callback)
    }
    else if (options.signupDestination === "service") {
      if (options.account.service === "mailchimp") {
        submitMailchimp(options, email, callback)
      }
      else if (options.account.service === "constant-contact") {
        submitConstantContact(options, email, callback)
      }
    }
  }

  function hide(event) {
    if (event.target !== this) return

    element.setAttribute("data-visibility", "hidden")
  }

  function timeoutHide() {
    element.setAttribute("data-visibility", "hidden")
  }

  const submitHandlers = {
    signup(event) {
      event.preventDefault()

      const email = event.target.querySelector("input[name='_replyto']").value

      function callback(ok){
        options.announcementTitle = options.signupSuccessTitle
        options.announcementText = options.signupSuccessText

        options.goal = "announcement"

        if (ok) {
          setTimeout(timeoutHide, 3000)
        } 
        else {
          options.announcementText = "Whoops, something didn’t work. Please try again."
        }

        updateElement()
      }

      emailUtilsSubmit(options, email, callback)
    },
    cta(event) {
      event.preventDefault()

      // cta link address must be https:// to work in test, not sure in development
      window.location = options.ctaLinkAddress
    },
    announcement(event) {
      event.preventDefault()

      element.setAttribute("data-visibility", "hidden")
    }
  }

  const renderers = {
    wrapper(children) {
      return `
        <eager-backdrop></eager-backdrop>

        <eager-dialog>
          <eager-dialog-content>
            <eager-dialog-content-text>
              ${children}
              <eager-dialog-close-button></eager-dialog-close-button>
            </eager-dialog-content-text>
          </eager-dialog-content>
        </eager-dialog>
      `
    },
    signup() {
      return `
        <eager-dialog-content-title>${options.signupTitle || "Sign up"}</eager-dialog-content-title>
        ${options.signupText}

        <form class="clearfix signup">
          <input class="input-email" name="_replyto" placeholder="${options.signupInputPlaceholder}" required type="email" />
          <input type="submit" class="submit-button" value="${options.signupButtonText || "Sign up!"}">
        </form>
      `
    },
    announcement() {
      return `
        <eager-dialog-content-title>${options.announcementTitle || "Announcement"}</eager-dialog-content-title>
        ${options.announcementText}

        <form class="clearfix announcement">
          <input type="submit" class="submit-button" value="${options.announcementButtonText || "Got it!"}">
        </form>
      `
    },
    cta() {
      return `
        <eager-dialog-content-title>${options.ctaTitle || "New products!"}</eager-dialog-content-title>

        ${options.ctaText}

        <form class="clearfix cta">
          <input type="submit" class="submit-button" value="${options.ctaButtonText || "Take me there!"}">
        </form>
      `
    }
  }

  function updateElement() {
    try {
      localStorage.eagerCoverMessageShown = JSON.stringify(options)
    }
    catch (e) {}

    element = Eager.createElement({
      selector: "body",
      method: "append"
    }, element)

    element.classList.add("eager-cover-message")
    element.setAttribute("data-visibility", "visible")

    const children = renderers[options.goal]()

    element.innerHTML = renderers.wrapper(children)


    element.querySelector("form").addEventListener("submit", submitHandlers[options.goal])

    element.querySelector("eager-dialog").addEventListener("click", hide)
    element.querySelector("eager-dialog-close-button").addEventListener("click", hide)
    element.querySelector(".submit-button").style.backgroundColor = options.color
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
