(() => {
  const STORAGE_KEY = "receipt-tracker:data:v1";

  /** @typedef {{id:string,date:string,vendor:string,category:string,amount:number,notes:string}} Receipt */

  /** @type {HTMLFormElement | null} */
  const form = document.getElementById("receiptForm");
  const dateInput = document.getElementById("date");
  const vendorInput = document.getElementById("vendor");
  const categoryInput = document.getElementById("category");
  const amountInput = document.getElementById("amount");
  const notesInput = document.getElementById("notes");

  const filterTextInput = document.getElementById("filterText");
  const filterCategoryInput = document.getElementById("filterCategory");
  const clearAllBtn = document.getElementById("clearAllBtn");

  const tbody = document.getElementById("receiptsBody");
  const emptyState = document.getElementById("emptyState");
  const summaryCount = document.getElementById("summaryCount");
  const summaryTotal = document.getElementById("summaryTotal");
  const summaryAverage = document.getElementById("summaryAverage");

  /** @type {Receipt[]} */
  let receipts = loadFromStorage();

  function loadFromStorage() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .map((r) => ({
          ...r,
          amount: typeof r.amount === "number" ? r.amount : Number(r.amount) || 0,
        }))
        .filter((r) => r && typeof r.id === "string");
    } catch {
      return [];
    }
  }

  /** @param {Receipt[]} data */
  function saveToStorage(data) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  }

  function ensureDefaultDate() {
    if (!(dateInput instanceof HTMLInputElement)) return;
    if (!dateInput.value) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      dateInput.value = `${yyyy}-${mm}-${dd}`;
    }
  }

  function render() {
    if (!tbody) return;

    const textQuery = (filterTextInput?.value || "").trim().toLowerCase();
    const categoryFilter = filterCategoryInput?.value || "";

    const filtered = receipts.filter((r) => {
      const matchesCategory =
        !categoryFilter || r.category.toLowerCase() === categoryFilter.toLowerCase();
      const matchesText =
        !textQuery ||
        r.vendor.toLowerCase().includes(textQuery) ||
        (r.notes && r.notes.toLowerCase().includes(textQuery));
      return matchesCategory && matchesText;
    });

    tbody.innerHTML = "";

    if (filtered.length === 0) {
      if (emptyState) emptyState.style.display = "block";
    } else {
      if (emptyState) emptyState.style.display = "none";

      filtered
        .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
        .forEach((r) => {
          const tr = document.createElement("tr");

          const tdDate = document.createElement("td");
          tdDate.textContent = r.date;

          const tdVendor = document.createElement("td");
          tdVendor.textContent = r.vendor;

          const tdCategory = document.createElement("td");
          tdCategory.textContent = r.category;

          const tdAmount = document.createElement("td");
          tdAmount.textContent = formatCurrency(r.amount);
          tdAmount.className = "numeric";

          const tdNotes = document.createElement("td");
          tdNotes.textContent = r.notes || "";

          const tdActions = document.createElement("td");
          tdActions.style.textAlign = "right";

          const deleteBtn = document.createElement("button");
          deleteBtn.type = "button";
          deleteBtn.className = "icon-btn";
          deleteBtn.innerHTML = "✕";
          deleteBtn.title = "Delete receipt";
          deleteBtn.addEventListener("click", () => {
            handleDelete(r.id);
          });

          tdActions.appendChild(deleteBtn);

          tr.appendChild(tdDate);
          tr.appendChild(tdVendor);
          tr.appendChild(tdCategory);
          tr.appendChild(tdAmount);
          tr.appendChild(tdNotes);
          tr.appendChild(tdActions);

          tbody.appendChild(tr);
        });
    }

    const count = filtered.length;
    const total = filtered.reduce((sum, r) => sum + (r.amount || 0), 0);
    const avg = count ? total / count : 0;

    if (summaryCount) summaryCount.textContent = String(count);
    if (summaryTotal) summaryTotal.textContent = formatCurrency(total);
    if (summaryAverage) summaryAverage.textContent = formatCurrency(avg);
  }

  function handleDelete(id) {
    receipts = receipts.filter((r) => r.id !== id);
    saveToStorage(receipts);
    render();
  }

  function handleClearAll() {
    if (!receipts.length) return;
    const confirmed = window.confirm(
      "Clear all receipts? This cannot be undone."
    );
    if (!confirmed) return;
    receipts = [];
    saveToStorage(receipts);
    render();
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (
      !(dateInput instanceof HTMLInputElement) ||
      !(vendorInput instanceof HTMLInputElement) ||
      !(categoryInput instanceof HTMLSelectElement) ||
      !(amountInput instanceof HTMLInputElement) ||
      !(notesInput instanceof HTMLInputElement)
    ) {
      return;
    }

    const date = dateInput.value;
    const vendor = vendorInput.value.trim();
    const category = categoryInput.value;
    const amountRaw = amountInput.value;
    const notes = notesInput.value.trim();

    const amount = Number(amountRaw);
    if (!date || !vendor || !category || !amount || Number.isNaN(amount)) {
      window.alert("Please fill in date, vendor, category and a valid amount.");
      return;
    }

    const now = Date.now();
    const id = `${now}-${Math.random().toString(36).slice(2, 8)}`;

    const receipt = { id, date, vendor, category, amount, notes };
    receipts = [receipt, ...receipts];
    saveToStorage(receipts);

    vendorInput.value = "";
    amountInput.value = "";
    notesInput.value = "";
    categoryInput.value = "";
    ensureDefaultDate();

    render();
  }

  function init() {
    ensureDefaultDate();
    render();

    if (form) {
      form.addEventListener("submit", handleSubmit);
    }

    if (filterTextInput) {
      filterTextInput.addEventListener("input", render);
    }
    if (filterCategoryInput) {
      filterCategoryInput.addEventListener("change", render);
    }
    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", handleClearAll);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

