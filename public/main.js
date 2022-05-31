const update = document.querySelector('#update-button');

update.addEventListener('click', (_) => {
  fetch('/quotes', {
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'no one',
      quote: 'Cool Prius.',
    }),
  })
    .then((res) => {
      if (res.ok) return res.json();
    })
    .then((response) => {
      console.log(response);
      window.location.reload(true);
    });
});

const deleteButton = document.querySelector('#delete-button');
const messageDiv = document.querySelector('#message');

deleteButton.addEventListener('click', (_) => {
  fetch('/quotes', {
    method: 'delete',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quote: 'Cool Prius.',
    }),
  })
    .then((res) => {
      if (res.ok) return res.json();
    })
    .then((res) => {
      if (res === 'No quote to delete') {
        messageDiv.textContent =
          'No one is bullying the Prius owners right now.';
      } else {
        window.location.reload();
      }
    });
});
