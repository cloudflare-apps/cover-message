import {submitConstantContact, submitFormspree, submitMailchimp} from "eager-email-utils"

(function() {
  if (!window.addEventListener) return // Check for IE9+
  const escapeElement = document.createElement("textarea")
  const preview = INSTALL_ID === "preview"
  let options = INSTALL_OPTIONS
  let element

  function esc(content = "") {
    escapeElement.textContent = content

    return escapeElement.innerHTML
  }

  function delegateEmailSubmit(options, email, callback) {
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
    if (event && event.target !== this) return

    element.setAttribute("data-visibility", "hidden")
    document.body.style.overflow = ""
  }

  const submitHandlers = {
    signup(event) {
      event.preventDefault()

      element.setAttribute("data-form", "submitting")

      const email = event.target.querySelector("input[name='_replyto']").value

      delegateEmailSubmit(options, email, ok => {
        element.setAttribute("data-form", "submitted")
        options.goal = "signupSuccess"

        if (ok) {
          setTimeout(hide, 3000)
        }
        else {
          options.signupSuccessTitle = "Whoops"
          options.signupSuccessText = "Something didn’t work. Please check your email address and try again."
        }

        updateElement()
      })
    },
    cta(event) {
      event.preventDefault()

      if (preview) {
        window.location.reload()
      }
      else {
        window.location = options.ctaLinkAddress
      }
    },
    announcement(event) {
      event.preventDefault()

      element.setAttribute("data-visibility", "hidden")
    }
  }

  const renderers = {
    announcement() {
      return `
        <eager-dialog-content-title>${esc(options.announcementTitle || "Announcement")}</eager-dialog-content-title>
        ${esc(options.announcementText || "Sale! Everything is 75% off this entire week.")}

        <form>
          <input type="submit" value="${esc(options.announcementButtonText || "Got it!")}">
        </form>
      `
    },
    cta() {
      return `
        <eager-dialog-content-title>${esc(options.ctaTitle || "New products!")}</eager-dialog-content-title>

        ${esc(options.ctaText || "We just launched an amazing new product!")}

        <form>
          <input type="submit" value="${esc(options.ctaButtonText || "Take me there!")}">
        </form>
      `
    },
    signup() {
      return `
        <eager-dialog-content-title>${esc(options.signupTitle || "Sign up")}</eager-dialog-content-title>
        ${options.signupText || "Join our mailing list to be the first to know what we’re up to!"}

        <form>
          <input
            name="_replyto"
            placeholder="${esc(options.signupInputPlaceholder || "Email address")}"
            required
            type="email" />
          <input type="submit" value="${esc(options.signupButtonText || "Sign up!")}">
        </form>
      `
    },
    signupSuccess() {
      return `
        <eager-dialog-content-title>${esc(options.signupSuccessTitle || "Thanks for signing up!")}</eager-dialog-content-title>
        ${esc(options.signupSuccessText || "You'll be kept up to date with our newsletter.")}
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
    element.setAttribute("data-goal", options.goal)

    document.body.style.overflow = "hidden"

    const children = renderers[options.goal]()

    element.innerHTML = `
      <eager-backdrop></eager-backdrop>

      <eager-dialog>
        <eager-dialog-content>
          <eager-dialog-close-button></eager-dialog-close-button>

          <eager-dialog-content-text>
            ${children}
          </eager-dialog-content-text>
        </eager-dialog-content>
      </eager-dialog>
    `

    element.querySelector("form").addEventListener("submit", submitHandlers[options.goal])

    element.querySelector("eager-dialog").addEventListener("click", hide)
    element.querySelector("eager-dialog-close-button").addEventListener("click", hide)
    element.querySelector("input[type='submit']").style.backgroundColor = options.color

    if (options.goal === "signup" && !options.userEmail) {
      const emailInput = element.querySelector("form input[type='email']")
      const submitInput = element.querySelector("form input[type='submit']")

      emailInput.placeholder = "Please fill your email in the Eager app installer."
      emailInput.disabled = true
      submitInput.disabled = true
    }
  }

  function bootstrap() {
    const alreadyShown = localStorage.eagerCoverMessageShown === JSON.stringify(options)

    if (alreadyShown && !preview) return

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
