import {options} from '../install.json'

const {properties: schema} = options
const escapeElement = document.createElement('textarea')

function esc (content = '') {
  escapeElement.textContent = content

  return escapeElement.innerHTML
}

function get (options, key) {
  return esc(options[key] || schema[key].default || '')
}

export function announcement (options) {
  return `
    <cf-dialog-content-title>${get(options, 'announcementTitle')}</cf-dialog-content-title>
    ${get(options, 'announcementText')}

    <form>
      <input type="submit" value="${get(options, 'announcementButtonText')}">
    </form>
  `
}

export function cta (options) {
  return `
    <cf-dialog-content-title>${get(options, 'ctaTitle')}</cf-dialog-content-title>

    ${get(options, 'ctaText')}

    <form>
      <input type="submit" value="${get(options, 'ctaButtonText')}">
    </form>
  `
}

export function signup (options) {
  return `
    <cf-dialog-content-title>${get(options, 'signupTitle')}</cf-dialog-content-title>

    <cf-signup-text>${get(options, 'signupText')}</cf-signup-text>

    <form>
      <input
        name="_replyto"
        placeholder="${get(options, 'signupInputPlaceholder')}"
        required
        type="email" />
      <input type="submit" value="${get(options, 'signupButtonText')}">
    </form>
  `
}

export function signupSuccess (options) {
  return `
    <cf-dialog-content-title>${get(options, 'signupSuccessTitle')}</cf-dialog-content-title>
    ${get(options, 'signupSuccessText')}
  `
}
