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
