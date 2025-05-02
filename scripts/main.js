let questions = [];
let current = 0;
let score = 0;

document.addEventListener("DOMContentLoaded", async () => {
  if (window.location.pathname.includes("question.html")) {
    questions = await getQuestions();
    if (questions.length > 0) showQuestion();
  }

  if (window.location.pathname.includes("results.html")) {
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

  if (document.getElementById("resultsChart")) {
    const results = JSON.parse(localStorage.getItem("quizResults") || "[]");

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
              fill: false,
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: "Fecha",
              },
            },
            y: {
              title: {
                display: true,
                text: "Puntuación",
              },
              beginAtZero: true,
              suggestedMax: 10,
            },
          },
        },
      });
    } else {
      console.warn("No hay resultados para mostrar en la gráfica.");
    }
  }
});

function showQuestion() {
  const q = questions[current];
  const container = document.getElementById("quiz-container");
  container.innerHTML = `
    <article class="question-card">
      <h2>${q.question}</h2>
      <div class="options-grid">
        ${q.options
          .map(
            (opt) =>
              `<button onclick="handleAnswer('${opt}', '${q.correct}')">${opt}</button>`
          )
          .join("")}
      </div>
      <div class="question-count">Pregunta ${current + 1} de 10</div>
      <div class="next-btn">
        <button onclick="nextQuestion()">Siguiente</button>
      </div>
    </article>
  `;
}

function handleAnswer(selected, correct) {
  const buttons = document.querySelectorAll(".options-grid button");
  buttons.forEach((btn) => (btn.disabled = true));

  if (selected === correct) score++;

  setTimeout(nextQuestion, 500);
}

function nextQuestion() {
  current++;
  if (current < 10) {
    showQuestion();
  } else {
    endQuiz();
  }
}

function endQuiz() {
  const results = JSON.parse(localStorage.getItem("quizResults") || "[]");
  results.push({
    date: new Date().toLocaleDateString(),
    score: score,
  });
  localStorage.setItem("quizResults", JSON.stringify(results));

  window.location.href = `results.html?score=${score}`;
}

async function getQuestions() {
  const API_URL = "https://opentdb.com/api.php?amount=10&type=multiple";

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
          "¿Cuál es la diferencia principal entre 'var', 'let' y 'const' en JavaScript?",
        options: [
          "'var' y 'let' tienen ámbito de bloque, 'const' tiene ámbito global",
          "'var' tiene ámbito de función, mientras que 'let' y 'const' tienen ámbito de bloque",
          "No hay diferencia, todos tienen el mismo ámbito",
          "'const' permite reasignar valores, 'let' no",
        ],
        correct:
          "'var' tiene ámbito de función, mientras que 'let' y 'const' tienen ámbito de bloque",
      },
      {
        question: "¿Qué es una 'closure' en JavaScript?",
        options: [
          "Una función que se ejecuta inmediatamente después de ser definida",
          "Una función que recuerda el ámbito en el que fue creada",
          "Una función que solo se puede ejecutar una vez",
          "Una función sin nombre",
        ],
        correct: "Una función que recuerda el ámbito en el que fue creada",
      },
      {
        question:
          "¿Qué método se utiliza para agregar un elemento al final de un array en JavaScript?",
        options: ["add()", "append()", "push()", "insert()"],
        correct: "push()",
      },
      {
        question:
          "¿Qué palabra clave se utiliza para declarar una constante en JavaScript?",
        options: ["let", "var", "const", "constant"],
        correct: "const",
      },
      {
        question:
          "¿Cuál de los siguientes métodos convierte un objeto JSON en una cadena?",
        options: [
          "JSON.parse()",
          "JSON.convert()",
          "JSON.stringify()",
          "JSON.toString()",
        ],
        correct: "JSON.stringify()",
      },
      {
        question:
          "¿Qué método se utiliza para eliminar el último elemento de un array? ",
        options: ["remove()", "pop()", "delete()", "splice()"],
        correct: "pop()",
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
