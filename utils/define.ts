export type QuestMeta = {
  id: string;
  title: string;
  description: string;
  has_password: boolean;
};

export type Option = {
  id: string;
  content: string;
};

export type Question = {
  id: string;
  content: string;
  questionnaire_id: string;
  options: Option[];
};

export type Questionnaire = {
  meta: QuestMeta;
  questions: Question[];
};
