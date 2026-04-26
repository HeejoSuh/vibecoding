const input = document.getElementById("userInput");
const unsafeEl = document.getElementById("unsafeQuery");
const safeEl = document.getElementById("safeQuery");
const resultText = document.getElementById("resultText");
const resultTable = document.getElementById("resultTable");

const mockUsers = [
  { id: 1, username: "admin", password: "1234" },
  { id: 2, username: "user", password: "pass" }
];

// 입력 정규화
function normalizeInput(value) {
  return value
    .slice(0, 96)
    .replace(/[\n\r]/g, "")
    .replace(/[^\x20-\x7E]/g, "");
}

// HTML escape
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));
}

// 시뮬레이션 규칙
function evaluate(input) {
  if (/or\s+['"]?1['"]?\s*=\s*['"]?1/i.test(input)) {
    return { type: "bypass", data: mockUsers };
  }
  if (/union/i.test(input)) {
    return { type: "union", data: mockUsers };
  }
  if (/1\s*=\s*2/.test(input)) {
    return { type: "false", data: [] };
  }
  return { type: "normal", data: mockUsers.slice(0, 1) };
}

// 렌더링
function render() {
  const raw = input.value;
  const normalized = normalizeInput(raw);
  const safe = escapeHTML(normalized);

  unsafeEl.textContent =
    "SELECT * FROM users WHERE username = '" + safe + "'";

  safeEl.textContent =
    "SELECT * FROM users WHERE username = ?";

  const result = evaluate(normalized);

  if (result.type === "bypass") {
    resultText.innerText = "인증 우회 발생 (모든 사용자 반환)";
  } else if (result.type === "union") {
    resultText.innerText = "UNION 공격 시뮬레이션 (데이터 노출)";
  } else if (result.type === "false") {
    resultText.innerText = "조건 거짓 → 결과 없음";
  } else {
    resultText.innerText = "정상 조회";
  }

  renderTable(result.data);
}

function renderTable(data) {
  resultTable.innerHTML = "";
  data.forEach(row => {
    const tr = document.createElement("tr");
    Object.values(row).forEach(val => {
      const td = document.createElement("td");
      td.innerText = val;
      tr.appendChild(td);
    });
    resultTable.appendChild(tr);
  });
}

// 이벤트
input.addEventListener("input", render);

document.querySelectorAll("[data-payload]").forEach(btn => {
  btn.onclick = () => {
    input.value = btn.dataset.payload;
    render();
  };
});