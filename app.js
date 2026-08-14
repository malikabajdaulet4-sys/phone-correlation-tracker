const KEY = "phoneCorrelationData";

const form = document.getElementById("dataForm");
const tableBody = document.getElementById("tableBody");
const correlations = document.getElementById("correlations");

let data = JSON.parse(localStorage.getItem(KEY) || "[]");

document.getElementById("date").valueAsDate = new Date();

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const entry = {
    date: document.getElementById("date").value,
    screenTime: Number(document.getElementById("screenTime").value),
    sleep: Number(document.getElementById("sleep").value),
    study: Number(document.getElementById("study").value),
    mood: Number(document.getElementById("mood").value)
  };

  data.push(entry);

  data.sort((a, b) => a.date.localeCompare(b.date));

  saveData();
  render();

  form.reset();
  document.getElementById("date").valueAsDate = new Date();
});

function saveData() {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function correlation(a, b) {
  if (a.length < 2) {
    return 0;
  }

  const averageA = mean(a);
  const averageB = mean(b);

  let numerator = 0;
  let denominatorA = 0;
  let denominatorB = 0;

  for (let i = 0; i < a.length; i++) {
    numerator +=
      (a[i] - averageA) *
      (b[i] - averageB);

    denominatorA +=
      (a[i] - averageA) ** 2;

    denominatorB +=
      (b[i] - averageB) ** 2;
  }

  const denominator =
    Math.sqrt(denominatorA) *
    Math.sqrt(denominatorB);

  if (denominator === 0) {
    return 0;
  }

  return numerator / denominator;
}

function describeCorrelation(value) {
  const strength = Math.abs(value);

  if (strength < 0.2) {
    return "Very weak";
  }

  if (strength < 0.4) {
    return "Weak";
  }

  if (strength < 0.7) {
    return "Moderate";
  }

  return "Strong";
}

function render() {
  document.getElementById("entries").textContent =
    data.length;

  document.getElementById("avgScreen").textContent =
    data.length
      ? `${mean(data.map(x => x.screenTime)).toFixed(1)}h`
      : "0h";

  document.getElementById("avgMood").textContent =
    data.length
      ? `${mean(data.map(x => x.mood)).toFixed(1)}/10`
      : "0/10";

  tableBody.innerHTML = data
    .slice()
    .reverse()
    .map(entry => `
      <tr>
        <td>${entry.date}</td>
        <td>${entry.screenTime}h</td>
        <td>${entry.sleep}h</td>
        <td>${entry.study}h</td>
        <td>${entry.mood}/10</td>
      </tr>
    `)
    .join("");

  if (data.length < 2) {
    correlations.innerHTML =
      "<p>Add at least two entries to calculate correlations.</p>";

    return;
  }

  const screenTime = data.map(x => x.screenTime);

  const results = [
    {
      name: "Screen time ↔ Mood",
      value: correlation(
        screenTime,
        data.map(x => x.mood)
      )
    },
    {
      name: "Screen time ↔ Sleep",
      value: correlation(
        screenTime,
        data.map(x => x.sleep)
      )
    },
    {
      name: "Screen time ↔ Study",
      value: correlation(
        screenTime,
        data.map(x => x.study)
      )
    }
  ];

  correlations.innerHTML = results
    .map(result => `
      <div class="result">
        ${result.name}
        <strong>${result.value.toFixed(2)}</strong>
        <div>
          ${describeCorrelation(result.value)} correlation
        </div>
      </div>
    `)
    .join("");
}

render();
