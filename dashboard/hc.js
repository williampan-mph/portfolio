function openTab(evt, tabId) {
  document.querySelectorAll(".tab-content").forEach((panel) => {
    panel.classList.remove("active-panel");
  });
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  document.getElementById(tabId).classList.add("active-panel");
  evt.currentTarget.classList.add("active");
}
