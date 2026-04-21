export type QuestionType = 'single' | 'multiple' | 'text';

export interface Question {
  id: number;
  text: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string | string[];
}

export interface QuizSection {
  id: string;
  title: string;
  points: number;
  questions: Question[];
}

export const quizData: QuizSection[] = [
  {
    id: 'global',
    title: '1ère écoute – Compréhension globale',
    points: 3,
    questions: [
      {
        id: 1,
        text: 'Ce document est :',
        type: 'single',
        options: ['une publicité', 'un journal d’informations', 'une interview'],
        correctAnswer: 'un journal d’informations'
      },
      {
        id: 2,
        text: 'Combien de personnes parlent ?',
        type: 'single',
        options: ['une', 'deux', 'trois'],
        correctAnswer: 'deux'
      },
      {
        id: 3,
        text: 'Les informations sont :',
        type: 'single',
        options: ['sur un seul sujet', 'sur plusieurs sujets', 'seulement sur le sport'],
        correctAnswer: 'sur plusieurs sujets'
      }
    ]
  },
  {
    id: 'detailed',
    title: '2ème écoute – Compréhension détaillée',
    points: 7,
    questions: [
      {
        id: 4,
        text: 'Quel temps fait-il dans le sud de la France ?',
        type: 'single',
        options: ['Il pleut', 'Il fait beau', 'Il neige'],
        correctAnswer: 'Il fait beau'
      },
      {
        id: 5,
        text: 'Quel temps fait-il dans le nord ?',
        type: 'single',
        options: ['Il pleut', 'Il fait beau', 'Il fait chaud'],
        correctAnswer: 'Il pleut'
      },
      {
        id: 6,
        text: 'Que font les élèves à l’école Victor Hugo ?',
        type: 'single',
        options: ['Ils font du sport', 'Ils organisent une fête', 'Ils organisent une journée écologique'],
        correctAnswer: 'Ils organisent une journée écologique'
      },
      {
        id: 7,
        text: 'Coche les bonnes réponses (Les élèves...) :',
        type: 'multiple',
        options: ['plantent des arbres', 'regardent un film', 'recyclent du papier'],
        correctAnswer: ['plantent des arbres', 'recyclent du papier']
      },
      {
        id: 8,
        text: 'L’équipe de football de Paris :',
        type: 'single',
        options: ['a perdu', 'a gagné', 'n’a pas joué'],
        correctAnswer: 'a gagné'
      },
      {
        id: 9,
        text: 'Le film parle de :',
        type: 'single',
        options: ['un enfant', 'un animal', 'un professeur'],
        correctAnswer: 'un animal'
      },
      {
        id: 10,
        text: 'Que demandent les experts ?',
        type: 'single',
        options: ['prendre la voiture', 'prendre le vélo ou les transports publics', 'rester à la maison'],
        correctAnswer: 'prendre le vélo ou les transports publics'
      }
    ]
  },
  {
    id: 'fine',
    title: '3ème écoute – Compréhension fine',
    points: 5,
    questions: [
      {
        id: 11,
        text: 'Quelle est la date ?',
        type: 'text',
        correctAnswer: 'lundi 5 mai'
      },
      {
        id: 12,
        text: 'Où se passe l’activité écologique ?',
        type: 'text',
        correctAnswer: 'à l’école Victor Hugo'
      },
      {
        id: 13,
        text: 'Quel est le score du match ?',
        type: 'text',
        correctAnswer: 'deux à zéro'
      },
      {
        id: 14,
        text: 'Quand sort le film ?',
        type: 'single',
        options: ['aujourd’hui', 'cette semaine', 'ce mois'],
        correctAnswer: 'cette semaine'
      },
      {
        id: 15,
        text: 'Complète la phrase : Il y a beaucoup de __________________ dans les grandes villes.',
        type: 'text',
        correctAnswer: 'pollution'
      }
    ]
  }
];
