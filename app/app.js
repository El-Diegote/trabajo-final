const slidesBase = [
  {
    titulo: "Portada",
    bullets: ["UCEMA Deck Agent", "Sistema agéntico con supervisión humana"],
    fuente: "Sin fuente: slide de apertura",
  },
  {
    titulo: "Problema y necesidad",
    bullets: ["Convertir materiales académicos en una presentación trazable", "Evitar afirmaciones sin respaldo documental"],
    fuente: "fuente-demo.md · fuente-demo-F001",
  },
  {
    titulo: "Ciclo agéntico",
    bullets: ["El modelo decide consultas", "La herramienta recupera fragmentos", "La salida se valida contra esquema"],
    fuente: "fuente-demo.md · fuente-demo-F002",
  },
  {
    titulo: "Supervisión y cierre",
    bullets: ["El estado final queda en requiere_aprobacion", "El PPTX se genera solo con firma humana"],
    fuente: "fuente-demo.md · fuente-demo-F003",
  },
];

const fragmentos = [
  { id: "fuente-demo-F001", texto: "La propuesta debe conservar trazabilidad por fragmentos." },
  { id: "fuente-demo-F002", texto: "El ciclo registra herramienta, argumentos y resultados." },
  { id: "fuente-demo-F003", texto: "La generación del PPTX requiere aprobación humana." },
];

const slidesPreview = document.querySelector("#slidesPreview");
const fragmentList = document.querySelector("#fragmentList");
const duracion = document.querySelector("#duracion");
const duracionSalida = document.querySelector("#duracionSalida");
const perfil = document.querySelector("#perfil");
const estilo = document.querySelector("#estilo");
const fuentesOk = document.querySelector("#fuentesOk");
const aprobacionOk = document.querySelector("#aprobacionOk");

function renderPreview() {
  duracionSalida.textContent = duracion.value;
  const badge = fuentesOk.checked && aprobacionOk.checked ? "Demo aprobable" : "Demo bloqueada";
  const badgeClass = fuentesOk.checked && aprobacionOk.checked ? "ok" : "danger";

  slidesPreview.innerHTML = slidesBase
    .map(
      (slide, index) => `
        <article class="slide-card">
          <div>
            <span class="tag ${badgeClass}">${badge}</span>
            <h3>${index + 1}. ${slide.titulo}</h3>
            <ul>${slide.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}</ul>
          </div>
          <footer>${slide.fuente} · ${perfil.value} · ${estilo.value} · ${duracion.value} min</footer>
        </article>
      `
    )
    .join("");

  fragmentList.innerHTML = fragmentos
    .map((fragmento) => `<li><strong>${fragmento.id}</strong><br />${fragmento.texto}</li>`)
    .join("");
}

document.querySelectorAll("[data-action='preview']").forEach((button) => {
  button.addEventListener("click", () => {
    renderPreview();
    document.querySelector("#evidencia").scrollIntoView({ behavior: "smooth" });
  });
});

document.querySelector("[data-action='review']").addEventListener("click", () => {
  document.querySelector("#checklist").scrollIntoView({ behavior: "smooth" });
});

document.querySelectorAll("[data-section-link]").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll("[data-section-link]").forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
  });
});

[duracion, perfil, estilo, fuentesOk, aprobacionOk].forEach((control) => {
  control.addEventListener("input", renderPreview);
});

renderPreview();
