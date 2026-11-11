(() => {
  'use strict';
  const form = document.getElementById('briefForm');
  if (!form) return;
  const status = document.getElementById('formStatus');
  const button = form.querySelector('button[type="submit"]');
  const messages = {
    ru: { send: 'Отправить обращение', busy: 'Отправляем…', success: 'Обращение принято к отправке на info@certusdz.com. Спасибо! Мы ответим на ваш e-mail.', error: 'Не удалось подтвердить отправку. Данные сохранены в форме. Попробуйте ещё раз или напишите на info@certusdz.com.' },
    en: { send: 'Send inquiry', busy: 'Sending…', success: 'Your inquiry has been accepted for delivery to info@certusdz.com. Thank you! We will reply by email.', error: 'We could not confirm sending. Your entries remain in the form. Please retry or email info@certusdz.com.' },
    fr: { send: 'Envoyer la demande', busy: 'Envoi…', success: 'Votre demande a été acceptée pour envoi à info@certusdz.com. Merci ! Nous vous répondrons par e-mail.', error: 'L’envoi n’a pas pu être confirmé. Vos informations restent dans le formulaire. Réessayez ou écrivez à info@certusdz.com.' }
  };
  messages.ar = {"send": "إرسال الطلب", "busy": "جارٍ الإرسال…", "success": "تم قبول طلبك لإرساله إلى info@certusdz.com. شكرًا لك! سنرد على بريدك الإلكتروني.", "error": "تعذر تأكيد الإرسال. لا تزال بياناتك محفوظة في النموذج. حاول مجددًا أو راسل info@certusdz.com."};
  const copy = () => messages[document.documentElement.lang] || messages.ru;
  let sending = false;
  if (new URLSearchParams(location.search).get('sent') === '1') status.textContent = copy().success;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    const data = new FormData(form);
    if (String(data.get('_honey') || '').trim()) return;
    sending = true;
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    button.textContent = copy().busy;
    status.textContent = copy().busy;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('https://formsubmit.co/ajax/info@certusdz.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          name: data.get('name'), company: data.get('company'), email: data.get('email'), phone: data.get('phone'),
          region: data.get('region'), type: data.get('type'), message: data.get('task'),
          _subject: 'CERTUS — обращение с сайта certusdz.com', _template: 'table',
          consent: data.get('consent'), privacy_policy: 'https://certusdz.com/'+document.documentElement.lang+'/privacy/',
          _url: location.href.split('?')[0].split('#')[0] + '#contact', _honey: ''
        })
      });
      const result = await response.json();
      if (!response.ok || !(result.success === true || result.success === 'true')) throw new Error('Submission not accepted');
      status.textContent = copy().success;
      form.reset();
    } catch (_) {
      status.textContent = copy().error;
    } finally {
      clearTimeout(timeout);
      sending = false;
      button.disabled = false;
      button.textContent = copy().send;
      form.removeAttribute('aria-busy');
    }
  });
})();
