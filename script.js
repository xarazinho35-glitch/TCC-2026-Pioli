const phoneInput = document.getElementById('phone');
const nameInput = document.getElementById('name');
const form = document.getElementById('appointment-form');

// Máscara dinâmica para o telefone: (XX) XXXXX-XXXX
phoneInput.addEventListener('input', function (e) {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length > 11) value = value.slice(0, 11);

  if (value.length > 6) {
    value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
  } else if (value.length > 2) {
    value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
  } else if (value.length > 0) {
    value = `(${value}`;
  }
  
  e.target.value = value;
});

// Validação e envio do formulário
form.addEventListener('submit', function (event) {
  event.preventDefault();

  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const service = document.getElementById('service').value;
  const date = document.getElementById('date').value;

  if (name.length < 3) {
    alert('Por favor, digite o nome completo do paciente.');
    nameInput.focus();
    return;
  }

  const numericPhone = phone.replace(/\D/g, '');
  if (numericPhone.length < 10) {
    alert('Por favor, informe um telefone válido com DDD.');
    phoneInput.focus();
    return;
  }

  if (!date) {
    alert('Por favor, selecione uma data para o agendamento.');
    return;
  }

  // Formata a data para exibições BR (AAAA-MM-DD para DD/MM/AAAA)
  const formattedDate = date.split('-').reverse().join('/');

  const newAppointment = {
    name: name,
    phone: phone,
    service: service,
    date: formattedDate,
    status: 'Pendente'
  };

  const currentAppointments = JSON.parse(localStorage.getItem('appointments')) || [];
  currentAppointments.push(newAppointment);
  localStorage.setItem('appointments', JSON.stringify(currentAppointments));

  const clinicPhone = "5534999999999"; 
  const message = `Olá! Meu nome é ${name} (Tel: ${phone}). Gostaria de agendar ${service} para o dia ${formattedDate}.`;
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${clinicPhone}&text=${encodeURIComponent(message)}`;

  window.location.href = whatsappUrl;
});

// Função para alternar o Dark Mode na página principal
function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  
  // Salva a preferência do usuário
  const isDark = document.body.classList.contains('dark-theme');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Aplica o tema salvo ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  }
});