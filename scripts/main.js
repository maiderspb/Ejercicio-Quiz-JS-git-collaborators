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
const alertcontainer = document.getElementById('alertContainer');
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

  if (selected === correct){
    createNotif('respondido correctamente','success')
    setTimeout(nextQuestion, 500);
    score++;
  } else{
    createNotif('error','danger')
    setTimeout(nextQuestion, 500);
  }


 
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
  const alert = document.createElement("div");
  alert.className = `alert alert-${tipo} mt-3`;
  alert.textContent = mensaje;
  alertcontainer.appendChild(alert);
  setTimeout(() => {
      alert.remove();

    },3000)
  
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
          "¿Cuál es el operador de comparación para comprobar la igualdad entre valor y tipo en JavaScript?",
        options: ["==", "===", "!=", "!=="],
        correct: "===",
      },
      {
        question:
          "¿Cuál es la sintaxis correcta para declarar una variable en JavaScript?",
        options: [
          "variablename = 'Juan'",
          "nombre variable = 'Juan'",
          "v nombre = 'Juan'",
          "var nombre = 'Juan'",
        ],
        correct: "var nombre = 'Juan'",
      },
      {
        question:
          "¿Cuál es el método para añadir un elemento al final de una matriz en JavaScript?",
        options: [
          "array.append(elemento)",
          "array.add(elemento)",
          "array.push(elemento)",
          "array.push(elemento)",
        ],
        correct: "array.push(elemento)",
      },

      {
        question:
          "¿Cuál es la función para convertir una cadena en un número en JavaScript?",
        options: [
          "parseInt()",
          "convertirEnInt()",
          "cadenaANúmero()",
          "aNúmero()",
        ],
        correct: "parseInt()",
      },
      {
        question:
          "¿Cuál es el método para eliminar el último elemento de una matriz en JavaScript?",
        options: [
          "array.pop()",
          "array.eliminarÚltimo()",
          "array.borrarÚltimo()",
          "array.splice(-1)",
        ],
        correct: "array.pop()",
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
