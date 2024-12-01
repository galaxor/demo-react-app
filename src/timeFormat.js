export const fullDateTime = new Intl.DateTimeFormat(navigator.language, {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZoneName: 'short'
});

export const dayFormat = new Intl.DateTimeFormat(navigator.language, {
  weekday: 'short'
});

export const dateFormat = new Intl.DateTimeFormat(navigator.language, {
  year: 'numeric', month: 'short', day: 'numeric'
});

export const timeFormat = new Intl.DateTimeFormat(navigator.language, {
  hour: 'numeric', minute: 'numeric', timeZoneName: 'short'
});
