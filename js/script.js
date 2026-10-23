/* Configure a Formspree endpoint here, e.g. https://formspree.io/f/your-form-id */
const FORM_ENDPOINT = "";

const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!open));
  navMenu.classList.toggle('is-open', !open);
});
document.querySelectorAll('.nav-menu a').forEach(link => link.addEventListener('click', () => {
  menuToggle.setAttribute('aria-expanded', 'false'); navMenu.classList.remove('is-open');
}));

const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
}), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(item => revealObserver.observe(item));

const stageButtons = document.querySelectorAll('.workflow-stages button');
const detail = document.querySelector('.workflow-detail');
stageButtons.forEach(button => button.addEventListener('click', () => {
  stageButtons.forEach(stage => stage.setAttribute('aria-selected', 'false'));
  button.setAttribute('aria-selected', 'true');
  detail.querySelector('h3').textContent = button.dataset.title;
  detail.querySelector('p:last-child').textContent = button.dataset.copy;
}));

document.querySelectorAll('.service').forEach(service => service.querySelector('a').addEventListener('click', () => {
  document.querySelector('#service').value = service.dataset.service;
}));

const form = document.querySelector('#enquiry-form');
const formStatus = document.querySelector('#form-status');
const required = [...form.querySelectorAll('[required]')];
function showError(input, message) {
  input.setAttribute('aria-invalid', 'true');
  const error = input.closest('.field').querySelector('.field-error');
  error.textContent = message;
}
function clearError(input) {
  input.removeAttribute('aria-invalid');
  const error = input.closest('.field').querySelector('.field-error');
  if (error) error.textContent = '';
}
function validate(input) {
  const value = input.value.trim();
  if (!value) { showError(input, 'This field is required.'); return false; }
  if (input.type === 'email' && !input.validity.valid) { showError(input, 'Enter a valid email address.'); return false; }
  clearError(input); return true;
}
required.forEach(input => input.addEventListener('input', () => validate(input)));
form.addEventListener('submit', async event => {
  event.preventDefault();
  const valid = required.map(validate).every(Boolean);
  if (!valid) { formStatus.textContent = 'Please correct the highlighted fields before continuing.'; required.find(input => !input.validity.valid || !input.value.trim())?.focus(); return; }
  if (!FORM_ENDPOINT) { formStatus.textContent = 'Form submissions are not configured yet. Please email, call, or use WhatsApp to discuss your project.'; return; }
  const submit = form.querySelector('[type="submit"]');
  submit.disabled = true; submit.textContent = 'Sending…'; formStatus.textContent = 'Sending your enquiry…';
  try {
    const response = await fetch(FORM_ENDPOINT, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Form provider rejected the submission.');
    form.reset(); formStatus.textContent = 'Thanks — your enquiry has been received.';
  } catch (error) { formStatus.textContent = 'We could not send your enquiry. Please try again or contact us by email, phone, or WhatsApp.'; }
  finally { submit.disabled = false; submit.innerHTML = 'Send project enquiry <span aria-hidden="true">↗</span>'; }
});
document.querySelector('#year').textContent = new Date().getFullYear();
