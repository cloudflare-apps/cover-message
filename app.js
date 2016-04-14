(function() {
  if (!window.addEventListener) return // Check for IE9+

  let options = INSTALL_OPTIONS
  let element

  function hide(event) {
    if (event.target !== this) return

    element.setAttribute("data-visibility", "hidden")
  }

  function handleEmailSubmit(event) {
    event.preventDefault()

    console.log("email form submitted")
  }

  function handlePageSubmit(event) {
    event.preventDefault()

    console.log("page form submitted")
  }


  function updateElement() {
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
    const closeButton = document.createElement("eager-dialog-close-button")

    const submitButton = Object.assign(document.createElement("input"), {
      type: "submit",
      className: "submit-button",
      style: `color: ${options.buttonTextColor}; background-color: ${options.buttonBackgroundColor}`
    })

    // Event listeners

    dialog.addEventListener("click", hide)
    closeButton.addEventListener("click", hide)

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
    dialogContent.appendChild(closeButton)

    dialog.appendChild(dialogContent)

    element.appendChild(backdrop)
    element.appendChild(dialog)
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateElement)
  }
  else {
    updateElement()
  }

  INSTALL_SCOPE = {
    setOptions(nextOptions) {
      options = nextOptions

      updateElement()
    }
  }
}())
