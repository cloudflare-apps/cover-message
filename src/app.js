import {submitConstantContact, submitFormspree, submitMailchimp} from "eager-email-utils"
import * as renderers from "./renderers"

(function() {
  if (!window.addEventListener) return // Check for IE9+
  const preview = INSTALL_ID === "preview"
  let options = INSTALL_OPTIONS
  let element

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

    const children = renderers[options.goal](options)

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
