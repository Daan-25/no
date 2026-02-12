const chips = document.querySelectorAll(".chip");
const scoreEl = document.getElementById("score");
const linerEl = document.getElementById("liner");
const shuffleBtn = document.getElementById("shuffle");
const revealEls = document.querySelectorAll(".reveal");

let score = 0;

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chip.classList.toggle("active");
    score += chip.classList.contains("active") ? 1 : -1;
    scoreEl.textContent = String(score);
  });
});

const liners = [
  "\"He built a social network before Zuckerberg, just with way worse terms and conditions.\"",
  "\"If red flags were frequent flyer miles, this guy had platinum status.\"",
  "\"His PR team needed a priest, a lawyer, and probably a flamethrower.\"",
  "\"The phrase 'open secret' did cardio because of this mess.\"",
  "\"Every scandal has smoke. This one had a full industrial chimney.\"",
  "\"His life story reads like a crime podcast that forgot to breathe.\"",
];

shuffleBtn.addEventListener("click", () => {
  const current = linerEl.textContent;
  let next = current;
  while (next === current) {
    next = liners[Math.floor(Math.random() * liners.length)];
  }
  linerEl.textContent = next;
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2,
  }
);

revealEls.forEach((el) => observer.observe(el));
