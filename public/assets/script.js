let testStatuses = false;

function zeroPad(num) {
  return num < 10 ? '0'+num : num;
}

function getCheckboxField(field, value, isVisible, statusId) {
  return `<li class="list-group-item card-input-item checkbox-card-input-item" ${isVisible ? '' : 'style="display: none"'} data-status-id="${statusId}">
    <input type="checkbox" class="field-select mr-1" name="share[]" value="${field.code}">
    <label class="card-input-label">${field.title}</label>
    <input type="checkbox" class="card-input" name="${field.code}" value="1" ${value == 1 ? 'checked="checked"': ''}>
  </li>`;
}
function getColorField(field, value, isVisible, statusId) {
  return `<li class="list-group-item card-input-item color-card-input-item" ${isVisible ? '' : 'style="display: none"'} data-status-id="${statusId}">
      <input type="checkbox" class="field-select mr-1" name="share[]" value="${field.code}">
      <label class="card-input-label">${field.title}</label>
      <div class="card-input">
        <input type="hidden" name="${field.code}" value="${value}">
        <span class="color-selector color-red ${value == "red" ? 'active' : ''}"></span>
        <span class="color-selector color-yellow ${value == "yellow" ? 'active' : ''}"></span>
        <span class="color-selector color-green ${value == "green" ? 'active' : ''}"></span>
      </div>
    </li>`;
}
function getTextField(field, value, isVisible, statusId) {
  return `<li class="list-group-item card-input-item text-card-input-item" ${isVisible ? '' : 'style="display: none"'} data-status-id="${statusId}">
      <input type="checkbox" class="field-select mr-1" name="share[]" value="${field.code}">
      <label class="card-input-label flex-fill">${field.title}</label>
      <div class="card-input">
        ${value}
      </div>
      <div class="btn-edit-field">
        <i class="fas fa-edit"></i>
      </div>

      <label class="card-input-label flex-fill in-edit-view">${field.title}</label>
      <div class="card-input-field in-edit-view">
        <textarea class="form-control">${value}</textarea>
      </div>
      <div class="edit-buttons in-edit-view py-2">
        <button class="btn btn-primary btn-save-field mr-2 flex-fill">Сохранить</button>
        <button class="btn btn-outline-secondary btn-edit-field"><i class="fas fa-ban"></i></button>
      </div>
    </li>`;
}
function getDateField(field, value, isVisible, statusId) {
  let dateValue = '';
  if (value) {
    let date = new Date(value);
    let dd = zeroPad( date.getDate() );
    let mm = zeroPad( date.getMonth() + 1 );
    let yyyy = date.getFullYear();

    dateValue = dd+'.'+mm+'.'+yyyy;
  }
  return `<li class="list-group-item card-input-item date-card-input-item" ${isVisible ? '' : 'style="display: none"'} data-status-id="${statusId}">
      <input type="checkbox" class="field-select mr-1" name="share[]" value="${field.code}">
      <label class="card-input-label flex-fill">${field.title}</label>
      <div class="card-input">
        ${dateValue}
      </div>
      <div class="btn-edit-field">
        <i class="fas fa-edit"></i>
      </div>

      <label class="card-input-label flex-fill in-edit-view">${field.title}</label>
      <div class="card-input-field in-edit-view">
        <input type="date" class="form-control" value=${value}>
      </div>
      <div class="edit-buttons in-edit-view py-2">
        <button class="btn btn-primary btn-save-field mr-2 flex-fill">Сохранить</button>
        <button class="btn btn-outline-secondary btn-edit-field"><i class="fas fa-ban"></i></button>
      </div>
    </li>`
}
function getField(field, value, isVisible, statusId) {
  let fieldHTML = '';
  switch (field.type) {
    case 'checkbox':
      fieldHTML = getCheckboxField(field, value, isVisible, statusId)
    break;
    case 'color':
      fieldHTML = getColorField(field, value, isVisible, statusId)
    break;
    case 'date':
      fieldHTML = getDateField(field, value, isVisible, statusId)
    break;
    case 'text':
      fieldHTML = getTextField(field, value, isVisible, statusId)
      break;
  }
  
  return fieldHTML;
}

function getEditField(field, value) {
  let inputHTML;
  
  switch (field.type) {
    case 'checkbox':
      inputHTML = `<input type="checkbox" class="card-input" name="${field.code}" value="1" ${value == 1 ? 'checked="checked"': ''}>`;
    break;
    case 'color':
      inputHTML = `<div class="card-input">
        <input type="hidden" name="${field.code}" value="${value}">
        <span class="color-selector color-red ${value == "red" ? 'active' : ''}"></span>
        <span class="color-selector color-yellow ${value == "yellow" ? 'active' : ''}"></span>
        <span class="color-selector color-green ${value == "green" ? 'active' : ''}"></span>
      </div>`;
    break;
    case 'date':
      inputHTML = `<input type="date" class="form-control" name="${field.code}" value=${value}>`;
    break;
    case 'text':
      inputHTML = `<textarea class="form-control" name="${field.code}">${value}</textarea>`;
      break;
  }
  
  return `<div class="form-group">
    <label for="input-${field.code}">${field.title}</label>
    ${inputHTML}
  </div>`
}

function getCardHTML(card, allFields, cardStatusId) {
  let statusCodes = Object.keys(allFields);
  let hasFields = allFields[cardStatusId].length > 0;
  let fieldHTML = statusCodes.map((statusId) => {
    let statusFieldsHTML = allFields[statusId].map((field) => {
      let value = card[field.id] || '';
      let isVisible = statusId == cardStatusId;
      return getField(field, value, isVisible, statusId);
    }).join('\n');
    return statusFieldsHTML;
  }).join('\n');
  
  return `<li class="card-container ui-sortable-handle">
        <div class="card" data-card-id="${card.id}">
          <div class="card-body">
            <div class="card-title mb-0 d-flex justify-content-between">
              <h5 class="flex-fill">${card.title}</h5>
              <span class="status-icons d-flex justify-content-end">
                <button class="btn btn-link btn-edit-card"><i class="fas fa-edit"></i></button>
                <button class="btn btn-link btn-share-form"><i class="fas fa-share-square"></i></button>
                <button class="btn btn-link btn-archive"><i class="fas fa-archive"></i></button>
              </span>
            </div>
            ${card.comment ? '<p class="card-text">'+card.comment+'</p>' : ''}
            <p class="card-text card-checklist-text mt-2" ${hasFields ? '' : 'style="display: none"'}>
              <a class="" data-toggle="collapse" href="#list-${card.id}" role="button" aria-expanded="true" >Скрыть чеклист</a>
            </p>
          </div>
          <div class="collapse show" id="list-${card.id}">
            <ul class="list-group list-group-flush">
              ${fieldHTML}
            </ul>
          </div>
          <div class="card-footer">
            <input type="text" class="form-control mb-2" placeholder="Ссылка на форму" readonly>
            <div class="d-flex share-buttons">
              <button class="btn btn-primary btn-block mr-2 btn-copy-link">Копировать</button>
              <button class="btn btn-outline-secondary btn-show-preview"><i class="fas fa-eye"></i></button>
            </div>
          </div>

        </div>
      </li>`;
}
function getStatusColumnHTML(status, allFields) {
  let index = $('.status-card').length;
  
  return `<div class="status-card" data-status-id="${status.id}">
    <div class="status-card-header d-flex justify-content-between">
      <span class="status-card-header-text flex-fill">${status.title}</span>
      <span class="status-icons d-flex justify-content-between">
        <button class="btn btn-link btn-filter"><i class="fas fa-filter"></i></button>
        <button class="btn btn-link btn-hide"><i class="fas fa-eye-slash"></i></button>
      </span>
    </div>
    <ul class="sortable ui-sortable" id="sort${status.id}">
        ${status.cards.map((card) => getCardHTML(card, allFields, status.id)).join('\n')}
    </ul>
  </div>`;
}
function getBoardHTML(statuses) {
  let fields = statuses.reduce((aggr, statusData) => {
    aggr[statusData.id] = statusData.fields || [];
    return aggr;
  }, {});
  
  let boardHTML = statuses.map((status) => getStatusColumnHTML(status, fields)).join('\n');
  return boardHTML;
}
function getRandom(array, count) {
  let records = [];
  
  for (let index = 1; index <= count; index++) {
    let randomIndex = Math.round(Math.random()*(array.length-1));
    records.push(array[randomIndex]);
  }
  
  return records;
}
function getTestStatuses() {
  if (testStatuses) {
    return testStatuses;
  }
  
  let allCandidates = [
    {id: 1, title: 'Николюк Остап'},
    {id: 2, title: 'Ярков Антон'},
    {id: 3, title: 'Сапалёв Виктор'},
    {id: 4, title: 'Караваев Эдуард'},
    {id: 5, title: 'Кулигин Степан'},
    {id: 6, title: 'Уманов Константин'},
    {id: 7, title: 'Звягин Захар', comment: 'Настойчив'},
    {id: 8, title: 'Ярославцев Иван'},
    {id: 9, title: 'Ошурков Павел'},
    {id: 10, title: 'Ячменцев Тарас'},
    {id: 11, title: 'Бабкина Елена', comment: 'Вторая попытка'},
    {id: 12, title: 'Кривова Ника'},
    {id: 13, title: 'Репина Дарья'},
    {id: 14, title: 'Веретёнова Виктория', comment: 'Нужно уточнить про паспорт'},
    {id: 15, title: 'Курдина Яна'},
    {id: 16, title: 'Ерофеева Ирина'},
    {id: 17, title: 'Чекудаева Лидия'},
    {id: 18, title: 'Ковпак Вера'},
    {id: 19, title: 'Кравец Регина'},
    {id: 20, title: 'Гнусарева Анна'}
  ];  
  testStatuses = [
    {
      id: 1,
      title: 'Входящие',
      cards: getRandom(allCandidates, 6)
    },
    {
      id: 2,
      title: 'Интервью',
      fields: [
        {'title': 'Телефонное интервью', 'type': 'checkbox', 'code': 'i0'},
        {'title': 'Тестирование', 'type': 'checkbox', 'code': 'i1'}
      ],
      cards: getRandom(allCandidates, 4)
    },
    {
      id: 3,
      title: 'Собеседование',
      fields: [
        {'title': 'HR', 'type': 'color', 'code': 'i2'},
        {'title': 'Дата команды', 'type': 'date', 'code': 'i21'},
        {'title': 'С командой', 'type': 'color', 'code': 'i3'}
      ],
      cards: getRandom(allCandidates, 3)
    },
    {
      id: 4,
      title: 'Оффер',
      fields: [
        {'title': 'Подтверждение руководителем', 'type': 'color', 'code': 'i4'},
        {'title': 'Проверка СБ', 'type': 'color', 'code': 'i5'},
        {'title': 'Подтверждение кандидатом', 'type': 'checkbox', 'code': 'i6'},
        {'title': 'Оповещение группы', 'type': 'checkbox', 'code': 'i7'}
      ],
      cards: getRandom(allCandidates, 2)
    },
    {
      id: 5,
      title: 'Выход на работу',
      fields: [
        {'title': 'Дата выхода', 'type': 'date', 'code': 'i8'},
        {'title': 'Документы кандидата', 'type': 'checkbox', 'code': 'i9'},
        {'title': '«Buddy»', 'type': 'text', 'code': 'i10'},
        {'title': 'Выход', 'type': 'checkbox', 'code': 'i12'}
      ],
      cards: getRandom(allCandidates, 1)
    },
  ];

  return testStatuses;
}

function drawTestStatuses() {
  let testStatusesHTML = getBoardHTML(getTestStatuses());
  $('.task-board').html(testStatusesHTML);
}
function getAllFields() {
  let statuses = getTestStatuses();
  let fields = statuses.reduce((fields, status) => {
    return status.fields ? fields.concat(status.fields) : fields;
  }, []);
  return fields;
}
function getCardById(cardId) {
  let statuses = getTestStatuses();
  let card = statuses.reduce((found, status) => {
    if (found) {
      return found;
    }
    
    let foundInStatus = status.cards.reduce((foundInStatus, card) => {
      if (foundInStatus) {
        return foundInStatus;
      }
      
      return card.id == cardId ? card : false;
    }, false);
    
    return foundInStatus;
  }, false);
  
  return card;
}
function getStatusById(searchStatusId) {
  return getTestStatuses().reduce( (found, status) => status.id == searchStatusId ? status : found, false );
}
function showEditForm(cardId, fieldCodes) {
  let fields = getAllFields();
  let card = cardId ? getCardById(cardId) : false;
  let isFilter = cardId === false;
  let isFullForm = true;
  if (fieldCodes) {
    fields = fields.filter(field => fieldCodes.indexOf(field.code) !== -1);
    isFullForm = false;
  }
  
  let title = isFilter ? 'Фильтр' : card.title;
  let fieldsHTML = fields.map(field => {
    let value = card ? card[field.code] || '' : '';
    return getEditField(field, value);
  }).join('\n');
  let formModalHTML = `<div class="modal" tabindex="-1" role="dialog" id="fieldsModal" data-type="try" data-card-id="${cardId}">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">${title}</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        ${fieldsHTML}
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Закрыть</button>
        ${isFullForm 
          ? '<button type="button" class="btn btn-success btn-save-card">Сохранить</button>'
          : ''}
      </div>
    </div>
  </div>
</div>`;
    $('body').append(formModalHTML);
    $('#fieldsModal').on('hidden.bs.modal', function (e) {
        $('#fieldsModal').remove();
    }).modal('show');
}

function colorInputChanged(event) {
  let $colorEl = $(event.target);
  $colorEl.siblings().removeClass('active');
  $colorEl.addClass('active');
}
function cardRecieved(event, ui) {
  let $card = $(ui.item);
  let statusId = $card.closest(".status-card").data(
    "status-id");
  let cardId = $card.data("card-id");
  
  $card.find('.card-input-item').hide();
  let $visibleInputs = $card.find('.card-input-item[data-status-id="'+statusId+'"]');
  let $checklistText = $card.find('.card-checklist-text');
  if ($visibleInputs.length > 0) {
    $checklistText.show();
    $visibleInputs.show();
  }
  else {
    $checklistText.hide();
  }
}
function bindFieldEvents() {
  $(document).on('click', '.color-selector', colorInputChanged);
  $(document).on('click', '.btn-edit-field', function (event) {
    let $row = $(event.target).closest('li');
    $row.toggleClass('edit-view');
    
  });
}
function bindCardButtonsEvents() {
  $(document).on('click', '.btn-archive', function () {
    let $button = $(event.target).closest('.btn');
    let $card = $button.closest('.card-container');
    $card.remove();
  });
  
  $(document).on('click', '.btn-edit-card', function (event) {
    let $button = $(event.currentTarget);
    let $card = $button.closest('.card');
    let cardId = $card.data('card-id');
    showEditForm(cardId);
  });

}
function bindCardShareEvents() {
  $(document).on('click', '.btn-share-form', function (event) {
    let $button = $(event.target).closest('.btn');
    let $card = $button.closest('.card');
    $button.toggleClass('active');
    $card.toggleClass('share');
  });

  $(document).on('click', '.field-select', function (event) {
    let $row = $(event.target).closest('li');
    $row.toggleClass('active');
  });
  
  $(document).on('click', '.btn-show-preview', function (event) {
    let $button = $(event.currentTarget);
    let $card = $button.closest('.card');
    let cardId = $card.data('card-id');
    let fieldCodes = $card.find('.field-select:checked').toArray().map(el => $(el).val());
    showEditForm(cardId, fieldCodes);
  });
}
function bindStatusEvents() {
  $(document).on('click', '.btn-filter', function (event) {
    let statusId = $(event.currentTarget).closest('.status-card').data('status-id');
    let status = getStatusById(statusId);
    let fieldCodes = status.fields.map( field => field.code );
    showEditForm(false, fieldCodes);
  });
  
  $(document).on('click', '.btn-hide', function (event) {
    let $statusCol = $(event.currentTarget).closest('.status-card');
    $statusCol.toggleClass('hidden');
  });
}
function bindEvents() {
  bindCardShareEvents();
  bindFieldEvents();
  bindCardButtonsEvents();
  bindStatusEvents();
}
function bindDragAndDrop() {
  $('ul[id^="sort"]').sortable({
      connectWith : ".sortable",
      receive : cardRecieved
    }).disableSelection();  
}

$(function() {
  drawTestStatuses();
  bindDragAndDrop();
  bindEvents();
});