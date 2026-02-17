import { storage } from "./storage";
import { hashAnswer } from "./answer-hash";
import { cache } from "./cache";
import type { InsertQuestion } from "@shared/schema";

function q(difficulty: number, prompt: string, choices: string[], correctAnswer: number, tags: string[]): InsertQuestion {
  return { difficulty, prompt, choices, correctAnswerHash: hashAnswer(correctAnswer), tags };
}

const seedQuestions: InsertQuestion[] = [
  q(1, "What does HTML stand for?", ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink Text Mode Language"], 0, ["web-development", "basics"]),
  q(1, "Which planet is closest to the Sun?", ["Venus", "Mercury", "Earth", "Mars"], 1, ["science", "astronomy"]),
  q(1, "What is 15 + 27?", ["40", "42", "44", "38"], 1, ["mathematics", "arithmetic"]),
  q(1, "Which color is made by mixing red and white?", ["Orange", "Pink", "Purple", "Peach"], 1, ["general-knowledge"]),
  q(1, "What is the capital of France?", ["London", "Berlin", "Paris", "Madrid"], 2, ["geography"]),

  q(2, "What does CSS stand for?", ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Syntax", "Colorful Style Sheets"], 1, ["web-development", "basics"]),
  q(2, "How many continents are there on Earth?", ["5", "6", "7", "8"], 2, ["geography"]),
  q(2, "What is the square root of 144?", ["10", "11", "12", "14"], 2, ["mathematics"]),
  q(2, "Which gas do plants absorb from the atmosphere?", ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], 1, ["science", "biology"]),
  q(2, "Who wrote Romeo and Juliet?", ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"], 1, ["literature"]),

  q(3, "What is the time complexity of accessing an element in an array by index?", ["O(n)", "O(log n)", "O(1)", "O(n^2)"], 2, ["computer-science", "data-structures"]),
  q(3, "What is the chemical symbol for Gold?", ["Go", "Gd", "Au", "Ag"], 2, ["science", "chemistry"]),
  q(3, "Which data structure uses FIFO ordering?", ["Stack", "Queue", "Tree", "Graph"], 1, ["computer-science", "data-structures"]),
  q(3, "What is the longest river in the world?", ["Amazon", "Mississippi", "Nile", "Yangtze"], 2, ["geography"]),
  q(3, "What is 17 x 23?", ["381", "391", "401", "371"], 1, ["mathematics", "arithmetic"]),

  q(4, "Which sorting algorithm has the best average-case time complexity?", ["Bubble Sort - O(n^2)", "Merge Sort - O(n log n)", "Selection Sort - O(n^2)", "Insertion Sort - O(n^2)"], 1, ["computer-science", "algorithms"]),
  q(4, "What is the derivative of x^3?", ["x^2", "3x^2", "3x", "2x^3"], 1, ["mathematics", "calculus"]),
  q(4, "Which protocol is used for secure web communication?", ["HTTP", "FTP", "HTTPS", "SMTP"], 2, ["technology", "networking"]),
  q(4, "What is the speed of light approximately?", ["300,000 km/s", "150,000 km/s", "450,000 km/s", "600,000 km/s"], 0, ["science", "physics"]),
  q(4, "In which year did World War II end?", ["1943", "1944", "1945", "1946"], 2, ["history"]),

  q(5, "What is the worst-case time complexity of QuickSort?", ["O(n log n)", "O(n^2)", "O(n)", "O(log n)"], 1, ["computer-science", "algorithms"]),
  q(5, "What is the integral of 1/x?", ["x", "ln|x| + C", "1/x^2", "e^x"], 1, ["mathematics", "calculus"]),
  q(5, "Which layer of the OSI model handles routing?", ["Data Link", "Transport", "Network", "Session"], 2, ["technology", "networking"]),
  q(5, "What is the Heisenberg Uncertainty Principle about?", ["Energy conservation", "Position and momentum precision", "Wave-particle duality", "Quantum entanglement"], 1, ["science", "physics"]),
  q(5, "What is the capital of Kazakhstan?", ["Almaty", "Astana", "Bishkek", "Tashkent"], 1, ["geography"]),

  q(6, "What is the time complexity of finding an element in a balanced BST?", ["O(n)", "O(log n)", "O(n log n)", "O(1)"], 1, ["computer-science", "data-structures"]),
  q(6, "What is Euler's number (e) approximately?", ["2.718", "3.141", "1.618", "2.236"], 0, ["mathematics"]),
  q(6, "Which design pattern ensures only one instance of a class?", ["Factory", "Observer", "Singleton", "Strategy"], 2, ["software-engineering", "design-patterns"]),
  q(6, "What is the half-life of Carbon-14?", ["1,000 years", "5,730 years", "10,000 years", "50,000 years"], 1, ["science", "chemistry"]),
  q(6, "Which philosopher wrote 'The Republic'?", ["Aristotle", "Socrates", "Plato", "Epicurus"], 2, ["philosophy"]),

  q(7, "What is the amortized time complexity of inserting into a dynamic array?", ["O(n)", "O(1)", "O(log n)", "O(n^2)"], 1, ["computer-science", "data-structures"]),
  q(7, "What is the determinant of a 2x2 identity matrix?", ["0", "1", "2", "Undefined"], 1, ["mathematics", "linear-algebra"]),
  q(7, "In the CAP theorem, which two properties can a distributed system guarantee?", ["Consistency and Availability always", "Any two of three", "Only Partition Tolerance", "All three always"], 1, ["computer-science", "distributed-systems"]),
  q(7, "What is the Chandrasekhar limit?", ["Maximum mass of a white dwarf", "Minimum mass of a black hole", "Speed of light in vacuum", "Age of the universe"], 0, ["science", "astrophysics"]),
  q(7, "Which language is considered the first high-level programming language?", ["COBOL", "Fortran", "BASIC", "Lisp"], 1, ["computer-science", "history"]),

  q(8, "What is the time complexity of Dijkstra's algorithm with a binary heap?", ["O(V^2)", "O(E log V)", "O(V + E)", "O(V log V)"], 1, ["computer-science", "algorithms"]),
  q(8, "What is the Riemann Hypothesis concerned with?", ["Prime number distribution", "P vs NP", "Fermat's Last Theorem", "Goldbach's conjecture"], 0, ["mathematics"]),
  q(8, "What consistency model does the Raft consensus algorithm provide?", ["Eventual", "Strong", "Causal", "Read-your-writes"], 1, ["distributed-systems"]),
  q(8, "What is the Kolmogorov complexity of a string?", ["Its length", "Shortest program that produces it", "Number of unique characters", "Compression ratio"], 1, ["computer-science", "theory"]),
  q(8, "Which physicist proposed the many-worlds interpretation?", ["Bohr", "Feynman", "Everett", "Dirac"], 2, ["science", "physics"]),

  q(9, "What is the space complexity of Tarjan's strongly connected components algorithm?", ["O(V + E)", "O(V^2)", "O(E log V)", "O(V * E)"], 0, ["computer-science", "algorithms"]),
  q(9, "What does the Curry-Howard correspondence relate?", ["Functions and sets", "Proofs and programs", "Types and categories", "Logic and algebra"], 1, ["computer-science", "theory"]),
  q(9, "What is the Church-Turing thesis?", ["All computers are equivalent", "Any computable function can be computed by a Turing machine", "P equals NP", "Halting problem is decidable"], 1, ["computer-science", "theory"]),
  q(9, "What is a Merkle tree used for?", ["Sorting data", "Efficient data verification", "Graph traversal", "Memory allocation"], 1, ["cryptography"]),
  q(9, "What is the significance of Godel's incompleteness theorems?", ["Mathematics is complete", "Some truths cannot be proven within a system", "All axioms are consistent", "Logic is decidable"], 1, ["mathematics", "logic"]),

  q(10, "What is the computational complexity class of determining if a graph is 3-colorable?", ["P", "NP-complete", "NP-hard but not NP-complete", "PSPACE"], 1, ["computer-science", "complexity-theory"]),
  q(10, "What is a ZK-SNARK?", ["A sorting algorithm", "A zero-knowledge succinct proof", "A cryptographic hash", "A consensus protocol"], 1, ["cryptography"]),
  q(10, "In type theory, what is the difference between System F and the Calculus of Constructions?", ["System F adds dependent types", "CoC adds both polymorphism and dependent types", "They are identical", "CoC removes polymorphism"], 1, ["computer-science", "type-theory"]),
  q(10, "What is the Halting Problem?", ["Determining if a program will halt", "Finding the shortest path", "Optimizing memory usage", "Scheduling processes"], 0, ["computer-science", "theory"]),
  q(10, "What does the P vs NP problem ask?", ["Whether polynomial algorithms exist for all problems", "Whether every problem verifiable in polynomial time is also solvable in polynomial time", "Whether all NP problems are unsolvable", "Whether P is empty"], 1, ["computer-science", "complexity-theory"]),
];

export async function seedDatabase() {
  const count = await storage.getQuestionCount();
  if (count > 0) {
    console.log(`Database already has ${count} questions, skipping seed.`);
    return;
  }

  console.log("Seeding database with questions...");
  await storage.insertQuestions(seedQuestions);
  cache.questionPool.invalidateAll();
  console.log(`Seeded ${seedQuestions.length} questions.`);
}
