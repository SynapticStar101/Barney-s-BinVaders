// ============================================================
//  BARNEY'S BINVADERS — Google Apps Script Leaderboard
//  Paste this entire file into script.google.com
//  See DEVLOG.md for full setup instructions
// ============================================================

// Called when the game fetches the top 10 (GET request)
function doGet(e) {
  const sheet  = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const rows   = sheet.getDataRange().getValues().slice(1); // skip header row

  const scores = rows
    .map(r => ({ name: String(r[0]), score: Number(r[1]), level: Number(r[2]) }))
    .filter(r => r.name && r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return jsonOut({ scores });
}

// Called when the game submits a score (POST request)
function doPost(e) {
  try {
    const raw = JSON.parse(e.postData.contents);

    // Sanitise inputs — never trust data from the internet
    const name  = String(raw.name  || 'PLAYER')
                    .replace(/[^a-zA-Z0-9 _\-!.]/g, '')  // safe chars only
                    .substring(0, 12)
                    .trim() || 'PLAYER';
    const score = Math.min(999999, Math.max(1, parseInt(raw.score)  || 0));
    const level = Math.min(10,     Math.max(1, parseInt(raw.level)  || 1));

    if (score < 1) return jsonOut({ ok: false, reason: 'zero score' });

    SpreadsheetApp.getActiveSpreadsheet()
      .getActiveSheet()
      .appendRow([name, score, level, new Date()]);

    return jsonOut({ ok: true });

  } catch (err) {
    return jsonOut({ ok: false, reason: err.message });
  }
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
