/* eslint-disable */
export const hideAlert = () => {
  const element = document.querySelector('.alert');
  if (element) element.remove();
};

export const showAlert = (type, msg, time = 5) => {
  hideAlert();

  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, time * 1000);
};
