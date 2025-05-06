let questions = [];
let current = 0;
let score = 0;

document.addEventListener("DOMContentLoaded", async () => {
  const path = window.location.pathname;

  if (path.includes("question.html")) {
    questions = await getQuestions();
    if (questions.length > 0) showQuestion();
  }

  if (path.includes("results.html")) {
    const params = new URLSearchParams(window.location.search);
    const scoreValue = params.get("score");

    const scoreCircle = document.getElementById("scoreResult");
    const resultText = document.querySelector(".result-text p");

    if (scoreCircle && scoreValue !== null) {
      scoreCircle.textContent = `${scoreValue}/10`;
    }

    if (resultText && scoreValue !== null) {
      resultText.textContent = `Tu resultado ha sido de ${scoreValue} respuestas correctas.`;
    }
  }

  if (path.endsWith("/") || path.includes("index.html")) {
    const results = JSON.parse(
      localStorage.getItem("quizResults") || "[]"
    ).slice(-5);

    if (results.length && window.Chart) {
      const ctx = document.getElementById("resultsChart");

      new Chart(ctx, {
        type: "line",
        data: {
          labels: results.map((r) => r.date),
          datasets: [
            {
              label: "Puntuaciones",
              data: results.map((r) => r.score),
              borderColor: "blue",
              backgroundColor: "rgba(0, 0, 255, 0.1)",
              fill: true,
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: { title: { display: true, text: "Fecha" } },
            y: {
              title: { display: true, text: "Puntuación" },
              beginAtZero: true,
              suggestedMax: 10,
            },
          },
        },
      });

      const resultsList = document.getElementById("resultsList");
      resultsList.innerHTML = `
        <table class="table table-striped mt-3">
          <thead><tr><th>Fecha</th><th>Aciertos</th></tr></thead>
          <tbody>
            ${results
              .map((r) => `<tr><td>${r.date}</td><td>${r.score}</td></tr>`)
              .join("")}
          </tbody>
        </table>
        <button class="btn btn-danger mt-2" onclick="clearHistory()">Borrar historial</button>
      `;
    } else {
      console.warn("No hay resultados para mostrar.");
    }
  }
});

function handleAnswer(btnClicked, selected, correct) {
  const buttons = document.querySelectorAll(".options-grid button");

  buttons.forEach((btn) => {
    btn.disabled = true;

    if (btn.textContent === correct) {
      btn.style.backgroundColor = "green";
      btn.textContent += " ✅";
    }

    if (btn === btnClicked && selected !== correct) {
      btn.style.backgroundColor = "red";
      btn.textContent += " ❌";
    }
  });

  if (selected === correct) {
    createNotif("¡Correcto!", "success");
    score++;
  } else {
    createNotif("Incorrecto", "danger");
  }

  const nextBtn = document.getElementById("nextBtn");
  if (nextBtn) nextBtn.disabled = false;
}

function showQuestion() {
  if (!questions[current]) return;

  const q = questions[current];
  const container = document.getElementById("quiz-container");

  const alertContainer = document.getElementById("alertContainer");
  if (alertContainer) alertContainer.innerHTML = "";

  container.innerHTML = `
    <div class="question-card">
      <h2>${q.question}</h2>
      <div class="options-grid">
        ${q.options
          .map(
            (opt) =>
              `<button onclick="handleAnswer(this, '${opt}', '${q.correct}')">${opt}</button>`
          )
          .join("")}
      </div>
      <p>Pregunta ${current + 1} de 10</p>
      <button id="nextBtn" onclick="nextQuestion()" disabled>Siguiente</button>
    </div>
  `;
}

function nextQuestion() {
  current++;
  if (current < 10) {
    showQuestion();
  } else {
    endQuiz();
  }
}

function createNotif(mensaje, tipo) {
  const alertContainer = document.getElementById("alertContainer");
  if (!alertContainer) return;

  const alert = document.createElement("div");
  alert.className = `alert alert-${tipo} mt-3`;
  alert.textContent = mensaje;

  alertContainer.innerHTML = "";
  alertContainer.appendChild(alert);
}

function endQuiz() {
  const results = JSON.parse(localStorage.getItem("quizResults") || "[]").slice(
    -9
  );
  results.push({
    date: new Date().toLocaleDateString(),
    score: score,
  });
  localStorage.setItem("quizResults", JSON.stringify(results));

  window.location.href = `results.html?score=${score}`;
}

async function getQuestions() {
  const API_URL =
    "https://opentdb.com/api.php?amount=10&category=18&type=multiple";

  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    const apiQuestions = data.results.map((q) => {
      const allAnswers = [...q.incorrect_answers, q.correct_answer];
      const shuffledAnswers = shuffleArray(allAnswers);

      return {
        question: decodeHTML(q.question),
        correct: decodeHTML(q.correct_answer),
        options: shuffledAnswers.map(decodeHTML),
      };
    });

    const extraQuestions = [
      {
        question: "¿Cuál es la finalidad principal de JavaScript?",
        options: [
          "Permitir la interacción con los usuarios",
          "Crear páginas web",
          "Crear animaciones",
          "Crear bases de datos",
        ],
        correct: "Permitir la interacción con los usuarios",
      },
      {
        question: "¿En qué año se introdujo JavaScript?",
        options: ["1995", "2000", "1990", "2005"],
        correct: "1995",
      },
      {
        question:
          "¿Cuál es el operador de comparación para comprobar la igualdad entre valor y tipo en JavaScript?",
        options: ["==", "===", "!=", "!=="],
        correct: "===",
      },
    ];

    const combined = shuffleArray([...apiQuestions, ...extraQuestions]).slice(
      0,
      10
    );
    return combined;
  } catch (error) {
    console.error("Error loading questions:", error);
    return [];
  }
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function clearHistory() {
  if (confirm("¿Seguro que quieres borrar el historial?")) {
    localStorage.removeItem("quizResults");
    location.reload();
  }
}
