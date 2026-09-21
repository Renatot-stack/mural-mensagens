const SPREADSHEET_ID = "COLE_AQUI_O_ID_DA_PLANILHA";
const SHEET_NAME = "Mensagens";

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const action = params.action || "list";

  if (action === "send") {
    return sendMessage_(params.name, params.message);
  }

  return listMessages_(params.callback);
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow(["Data/Hora", "Nome", "Mensagem"]);
  }

  return sheet;
}

function sendMessage_(name, message) {
  name = String(name || "").trim();
  message = String(message || "").trim();

  if (!name || !message) {
    return jsonResponse_({ ok: false, error: "Nome e mensagem são obrigatórios." });
  }

  if (name.length > 30 || message.length > 500) {
    return jsonResponse_({ ok: false, error: "Mensagem ou nome muito longo." });
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(5000);

  try {
    getSheet_().appendRow([new Date(), name, message]);
  } finally {
    lock.releaseLock();
  }

  return jsonResponse_({ ok: true });
}

function listMessages_(callback) {
  const sheet = getSheet_();
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return jsonResponse_({ ok: true, messages: [] }, callback);
  }

  // Limita a quantidade retornada para evitar uma resposta enorme.
  const startRow = Math.max(2, lastRow - 199);
  const values = sheet
    .getRange(startRow, 1, lastRow - startRow + 1, 3)
    .getValues();

  const messages = values.map(row => ({
    time: formatDate_(row[0]),
    name: String(row[1]),
    message: String(row[2])
  }));

  return jsonResponse_({ ok: true, messages }, callback);
}

function formatDate_(date) {
  if (!(date instanceof Date)) return String(date);

  return Utilities.formatDate(
    date,
    Session.getScriptTimeZone(),
    "dd/MM/yyyy HH:mm"
  );
}

function jsonResponse_(data, callback) {
  const json = JSON.stringify(data);

  if (callback) {
    // callback só é aceito para nomes simples de função.
    if (!/^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: "Callback inválido." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService
      .createTextOutput(`${callback}(${json});`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}
