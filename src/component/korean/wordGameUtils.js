import gameData from '../../game_data/korean/game_data.json';
import exampleData from '../../game_data/korean/example.json';

export const CATEGORY_LABELS = {
  animal: '\uB3D9\uBB3C',
  fruit: '\uACFC\uC77C',
  ride: '\uD0C8\uAC83',
  funiture: '\uAC00\uAD6C',
  clothing: '\uC637',
  food: '\uC74C\uC2DD',
  nature: '\uC790\uC5F0',
  color: '\uC0C9\uAE54',
  people: '\uC0AC\uB78C'
};

export const QUESTION_DURATION = 7000;
export const QUESTION_COUNT = 5;
export const TOTAL_GAME_DURATION = QUESTION_DURATION * QUESTION_COUNT;
export const TOTAL_DISTANCE = 10;
export const TIGER_START_POSITION = 0;
export const PLAYER_START_POSITION = 5;
export const HOME_POSITION = 10;
export const TIGER_SPEED_PER_SECOND = TOTAL_DISTANCE / (TOTAL_GAME_DURATION / 1000);
export const COUNTDOWN_STEPS = ['3', '2', '1', '\uC2DC\uC791'];
export const FEEDBACK_DELAY_MS = 700;
export const CATCH_ANIMATION_MS = 900;

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function createMaskedWord(word) {
  if (!word) {
    return { maskedWord: '', missingSyllable: '' };
  }

  const hiddenIndex = Math.floor(Math.random() * word.length);
  const letters = word.split('');
  const missingSyllable = letters[hiddenIndex];
  letters[hiddenIndex] = 'O';

  return {
    maskedWord: letters.join(''),
    missingSyllable
  };
}

function createChoices(missingSyllable) {
  const distractors = shuffle(exampleData.sample.filter((letter) => letter !== missingSyllable)).slice(0, 3);
  return shuffle([missingSyllable, ...distractors]);
}

function createQuestion(categoryKey, words) {
  const answerWord = shuffle(words)[0];
  const { maskedWord, missingSyllable } = createMaskedWord(answerWord);

  return {
    id: `${categoryKey}-${answerWord}`,
    categoryKey,
    categoryLabel: CATEGORY_LABELS[categoryKey] || categoryKey,
    answerWord,
    maskedWord,
    missingSyllable,
    choices: createChoices(missingSyllable)
  };
}

export function createQuestionSet(questionCount = QUESTION_COUNT) {
  const categories = shuffle(Object.keys(gameData));
  const selectedCategories = [];

  while (selectedCategories.length < questionCount) {
    selectedCategories.push(categories[selectedCategories.length % categories.length]);
  }

  return selectedCategories.map((categoryKey, index) => ({
    ...createQuestion(categoryKey, gameData[categoryKey]),
    sequence: index + 1
  }));
}