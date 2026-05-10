const sidebar = document.querySelector('.sidebar');

const toggleSidebar =
document.getElementById('toggleSidebar');

toggleSidebar.addEventListener('click', () => {
  sidebar.classList.toggle('closed');
});

/* ======================================================
   ELEMENTOS
====================================================== */

const monthTitle =
document.getElementById('monthTitle');

const calendarGrid =
document.getElementById('calendarGrid');

const timeGrid =
document.getElementById('timeGrid');

const prevMonthBtn =
document.getElementById('prevMonth');

const nextMonthBtn =
document.getElementById('nextMonth');

const psychologistCards =
document.querySelectorAll('.psychologist-card');

const selectedPsychologistText =
document.getElementById('selectedPsychologist');

const selectedDateText =
document.getElementById('selectedDate');

const selectedTimeText =
document.getElementById('selectedTime');

/* TIMELINE */

const stepPsychologist =
document.getElementById('stepPsychologist');

const stepDate =
document.getElementById('stepDate');

const stepTime =
document.getElementById('stepTime');

const stepConfirm =
document.getElementById('stepConfirm');

/* ======================================================
   DADOS
====================================================== */

const months = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
];

let currentDate = new Date();

/* COMEÇA VAZIO */

let selectedPsychologist = null;

let selectedDay = null;

let selectedTime = null;

/* DISPONIBILIDADE */

const psychologistAvailability = {

  'Dra. Ana Carolina': {
    unavailableDays: [8, 12, 18],
    unavailableTimes: ['11:00', '16:00']
  },

  'Dra. Juliana Lima': {
    unavailableDays: [5, 9, 22],
    unavailableTimes: ['10:00', '15:00']
  },

  'Dr. Rafael Gomes': {
    unavailableDays: [3, 7, 20],
    unavailableTimes: ['09:00', '14:00']
  }

};

/* HORÁRIOS */

const allTimes = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00'
];

/* ======================================================
   RESUMO
====================================================== */

function updateSummary() {

  const month =
  currentDate.getMonth();

  const year =
  currentDate.getFullYear();

  selectedPsychologistText.innerText =
  selectedPsychologist || '--';

  selectedDateText.innerText =
  selectedDay !== null
  ? `${selectedDay} ${months[month]} ${year}`
  : '--';

  selectedTimeText.innerText =
  selectedTime || '--';

}

/* ======================================================
   TIMELINE
====================================================== */

function updateTimeline() {

  stepPsychologist.classList.remove(
    'active-timeline'
  );

  stepDate.classList.remove(
    'active-timeline'
  );

  stepTime.classList.remove(
    'active-timeline'
  );

  stepConfirm.classList.remove(
    'active-timeline'
  );

  if(selectedPsychologist !== null) {

    stepPsychologist.classList.add(
      'active-timeline'
    );

  }

  if(selectedDay !== null) {

    stepDate.classList.add(
      'active-timeline'
    );

  }

  if(selectedTime !== null) {

    stepTime.classList.add(
      'active-timeline'
    );

  }

}

/* ======================================================
   CALENDÁRIO
====================================================== */

function renderCalendar() {

  calendarGrid.innerHTML = '';

  const year =
  currentDate.getFullYear();

  const month =
  currentDate.getMonth();

  monthTitle.innerText =
  `${months[month]} ${year}`;

  const firstDay =
  new Date(year, month, 1).getDay();

  const daysInMonth =
  new Date(year, month + 1, 0).getDate();

  /* ESPAÇOS */

  for(let i = 0; i < firstDay; i++) {

    const empty =
    document.createElement('div');

    empty.classList.add('empty');

    calendarGrid.appendChild(empty);

  }

  /* DIAS */

  for(let day = 1; day <= daysInMonth; day++) {

    const dayElement =
    document.createElement('div');

    dayElement.classList.add(
      'calendar-day'
    );

    dayElement.innerText = day;

    /* SEM PSICÓLOGO */

    if(selectedPsychologist === null) {

      dayElement.classList.add(
        'unavailable-day'
      );

      calendarGrid.appendChild(
        dayElement
      );

      continue;

    }

    const unavailableDays =
    psychologistAvailability[
      selectedPsychologist
    ].unavailableDays;

    /* DATA ATUAL */

    const today = new Date();

    /* DATA PASSADA */

    const isPastDate =

    year < today.getFullYear()

    ||

    (
      year === today.getFullYear()
      &&
      month < today.getMonth()
    )

    ||

    (
      year === today.getFullYear()
      &&
      month === today.getMonth()
      &&
      day < today.getDate()
    );

    /* BLOQUEIO */

    const isUnavailable =

    unavailableDays.includes(day)

    ||

    isPastDate;

    if(isUnavailable) {

      dayElement.classList.add(
        'unavailable-day'
      );

    } else {

      dayElement.addEventListener(
        'click',
        () => {

          selectedDay = day;

          selectedTime = null;

          stepConfirm.classList.remove(
            'active-timeline'
          );

          renderCalendar();

          updateSummary();

          updateTimeline();

        }
      );

    }

    if(day === selectedDay) {

      dayElement.classList.add(
        'active-day'
      );

    }

    calendarGrid.appendChild(
      dayElement
    );

  }

  renderTimes();

}

/* ======================================================
   HORÁRIOS
====================================================== */

function renderTimes() {

  timeGrid.innerHTML = '';

  if(
    selectedPsychologist === null ||
    selectedDay === null
  ) {

    return;

  }

  const unavailableTimes =
  psychologistAvailability[
    selectedPsychologist
  ].unavailableTimes;

  allTimes.forEach((time) => {

    const button =
    document.createElement('button');

    button.classList.add('time');

    button.innerText = time;

    /* HORA ATUAL */

    const today = new Date();

    const currentHour =
    today.getHours();

    const currentMinute =
    today.getMinutes();

    /* HORA DO BOTÃO */

    const [hour, minute] =
    time.split(':').map(Number);

    /* É HOJE? */

    const isToday =

    selectedDay === today.getDate()

    &&

    currentDate.getMonth() ===
    today.getMonth()

    &&

    currentDate.getFullYear() ===
    today.getFullYear();

    /* HORÁRIO PASSADO */

    const isPastTime =

    isToday

    &&

    (
      hour < currentHour

      ||

      (
        hour === currentHour
        &&
        minute <= currentMinute
      )
    );

    /* BLOQUEIO */

    const isUnavailable =

    unavailableTimes.includes(time)

    ||

    isPastTime;

    if(isUnavailable) {

      button.classList.add(
        'unavailable-time'
      );

    } else {

      button.addEventListener(
        'click',
        () => {

          selectedTime = time;

          stepConfirm.classList.remove(
            'active-timeline'
          );

          renderTimes();

          updateSummary();

          updateTimeline();

        }
      );

    }

    if(time === selectedTime) {

      button.classList.add(
        'active-time'
      );

    }

    timeGrid.appendChild(button);

  });

}

/* ======================================================
   MÊS
====================================================== */

prevMonthBtn.addEventListener(
  'click',
  () => {

    currentDate.setMonth(
      currentDate.getMonth() - 1
    );

    renderCalendar();

    updateSummary();

  }
);

nextMonthBtn.addEventListener(
  'click',
  () => {

    currentDate.setMonth(
      currentDate.getMonth() + 1
    );

    renderCalendar();

    updateSummary();

  }
);

/* ======================================================
   PSICÓLOGOS
====================================================== */

psychologistCards.forEach(card => {

  card.addEventListener(
    'click',
    () => {

      psychologistCards.forEach(c => {

        c.classList.remove(
          'active-card'
        );

      });

      card.classList.add(
        'active-card'
      );

      selectedPsychologist =
      card.dataset.psychologist;

      /* RESET */

      selectedDay = null;

      selectedTime = null;

      stepConfirm.classList.remove(
        'active-timeline'
      );

      renderCalendar();

      updateSummary();

      updateTimeline();

    }
  );

});

/* ======================================================
   CONFIRMAR
====================================================== */

document
.querySelector('.confirm-btn')

.addEventListener(
  'click',
  () => {

    if(
      selectedPsychologist !== null &&
      selectedDay !== null &&
      selectedTime !== null
    ) {

      stepConfirm.classList.add(
        'active-timeline'
      );

      alert(
        'Consulta agendada com sucesso!'
      );

    } else {

      alert(
        'Selecione psicólogo, data e horário.'
      );

    }

  }
);

/* ======================================================
   INICIAR
====================================================== */

renderCalendar();

updateSummary();

updateTimeline();