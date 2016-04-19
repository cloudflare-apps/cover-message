const escapeElement = document.createElement("textarea")

function esc(content = "") {
  escapeElement.textContent = content

  return escapeElement.innerHTML
}

export function announcement(options) {
  return `
    <eager-dialog-content-title>${esc(options.announcementTitle || "Announcement")}</eager-dialog-content-title>
    ${esc(options.announcementText || "Sale! Everything is 75% off this entire week.")}

    <form>
      <input type="submit" value="${esc(options.announcementButtonText || "Got it!")}">
    </form>
  `
}

export function cta(options) {
  return `
    <eager-dialog-content-title>${esc(options.ctaTitle || "New products!")}</eager-dialog-content-title>

    ${esc(options.ctaText || "We just launched an amazing new product!")}

    <form>
      <input type="submit" value="${esc(options.ctaButtonText || "Take me there!")}">
    </form>
  `
}

export function signup(options) {
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
}

export function signupSuccess(options) {
  return `
    <eager-dialog-content-title>${esc(options.signupSuccessTitle || "Thanks for signing up!")}</eager-dialog-content-title>
    ${esc(options.signupSuccessText || "You'll be kept up to date with our newsletter.")}
  `
}
