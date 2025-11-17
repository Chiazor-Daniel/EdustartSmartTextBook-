import { useAuthStore } from "@/store/authStore";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

type LoginResponse = {
  user: {
    id: number;
    email: string;
    full_name: string;
    organization: {
      id: number;
      name: string;
    };
    // ... other user fields
  };
  token: string;
  expires_at: string;
};

type SignUpRequest = {
  email: string;
  full_name: string;
  phone_number: string;
  gender: string;
  is_active: boolean;
  user_type: string;
  password: string;
  confirm_password: string;
};

type LoginRequest = {
  email: string;
  password: string;
};

type SubjectsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Subject[];
};

type Subject = {
  id: number;
  included___topics: any | null;
  created_at: string | null;
  updated_at: string;
  title: string;
  content: string;
  slug: string;
  color: string;
  image: string;
  background_image: string;
  icon: string | null;
};

type Topic = {
  id: number;
  name: string;
  description: string;
  subject_id: number;
  created_at: string;
  updated_at: string;
};

type Subtopic = {
  id: number;
  name: string;
  description: string;
  topic_id: number;
  subject_id: number;
  created_at: string;
  updated_at: string;
};

type CardsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Card[];
};

type Card = {
  id: number;
  created_at: string | null;
  updated_at: string;
  order: number;
  title: string;
  content: string;
  slug: string;
  verge3d_file: string | null;
  audio_file: string | null;
  thumbnail_file: string | null;
  subtopic: number;
};

// Diagnostic types
type DiagnosticQuestion = {
  id: number;
  subject: string;
  difficulty: string;
  prompt: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
};

type StartDiagnosticRequest = {
  user: {
    name: string;
    email: string;
  };
  exam_type: string;
  daily_study_minutes: number;
  months_until_exam: number;
};

type StartDiagnosticResponse = {
  diagnostic_id: number;
  questions: DiagnosticQuestion[];
};

type AnswerSubmission = {
  question_id: number;
  selected_option: string;
  confidence: string;
};

type SubmitAnswersRequest = {
  answers: AnswerSubmission[];
};

type SubjectBreakdown = {
  accuracy: number;
  correct: number;
  total_questions: number;
  recommendation: string;
};

type Reward = {
  tier: string;
  message: string;
};

type DiagnosticResults = {
  diagnostic_id: number;
  total_questions: number;
  total_correct: number;
  accuracy: number;
  subject_breakdown: Record<string, SubjectBreakdown>;
  reward: Reward;
};

type CheckUserDiagnosticRequest = {
  email: string;
};

type CheckUserDiagnosticResponse = {
  has_completed_diagnostic: boolean;
  email: string;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://api.class-fi.com/",
    prepareHeaders: (headers) => {
      headers.set("no-recaptcha-token", "true");
      const token = useAuthStore.getState().token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    signup: builder.mutation<{ detail: string }, SignUpRequest>({
      query: (userData) => ({
        url: "/organization/users/signup/student/",
        method: "POST",
        body: userData,
      }),
    }),
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "organization/users/student-login/",
        method: "POST",
        body: credentials,
      }),
    }),
    createClass: builder.mutation({
      query: (body) => ({
        url: "classes",
        method: "POST",
        body,
      }),
    }),

    // New education endpoints
    getSubjects: builder.query<SubjectsResponse, void>({
      query: () => ({
        url: "education/subjects/",
        method: "GET",
      }),
    }),

    getTopics: builder.query<Topic[], number>({
      query: (subject_id) => ({
        url: "education/topics/",
        method: "GET",
        params: { subject_id },
      }),
    }),

    getSubtopics: builder.query<Subtopic[], { topic_id: number }>({
      query: ({ topic_id }) => ({
        url: "education/subtopics/",
        method: "GET",
        params: { topic_id },
      }),
    }),

    // getCards: builder.query<CardsResponse, { subject_id: number; topic_id: number }>({
    //   query: ({ subject_id, topic_id }) => ({
    //     url: 'education/cards/',
    //     method: 'GET',
    //     params: { subject_id, topic_id },
    //   }),
    // }),
    getCards: builder.query<
      CardsResponse,
      {
        subject_id?: number;
        topic_id?: number;
        subtopic_id?: number; // Add this
        isOnline?: boolean; // Add if needed
      }
    >({
      query: (params) => ({
        url: "education/cards/",
        method: "GET",
        params: {
          ...params,
          isOnline: true, // Include if always needed
        },
      }),
    }),

    // Diagnostic endpoints
    startDiagnostic: builder.mutation<
      StartDiagnosticResponse,
      StartDiagnosticRequest
    >({
      query: (body) => ({
        url: "https://uncorned-objurgative-lilli.ngrok-free.dev/diagnostics/start",
        method: "POST",
        body,
      }),
    }),

    submitDiagnosticAnswers: builder.mutation<
      DiagnosticResults,
      { diagnostic_id: number; body: SubmitAnswersRequest }
    >({
      query: ({ diagnostic_id, body }) => ({
        url: `https://uncorned-objurgative-lilli.ngrok-free.dev/diagnostics/${diagnostic_id}/submit`,
        method: "POST",
        body,
      }),
    }),

    getDiagnosticResults: builder.query<DiagnosticResults, number>({
      query: (diagnostic_id) => ({
        url: `https://uncorned-objurgative-lilli.ngrok-free.dev/diagnostics/${diagnostic_id}/results`,
        method: "GET",
      }),
    }),

    checkUserDiagnostic: builder.mutation<
      CheckUserDiagnosticResponse,
      CheckUserDiagnosticRequest
    >({
      query: (body) => ({
        url: "https://uncorned-objurgative-lilli.ngrok-free.dev/diagnostics/check-user",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useCreateClassMutation,
  useGetSubjectsQuery,
  useGetTopicsQuery,
  useGetSubtopicsQuery,
  useGetCardsQuery,
  useStartDiagnosticMutation,
  useSubmitDiagnosticAnswersMutation,
  useGetDiagnosticResultsQuery,
  useCheckUserDiagnosticMutation,
} = api;

export type {
    CheckUserDiagnosticResponse, DiagnosticQuestion,
    DiagnosticResults,
    Reward,
    SubjectBreakdown
};

