import axios from "axios";

/* ================= AXIOS INSTANCE ================= */

const API = axios.create({
  baseURL: "http://localhost:5000",
});

/* ================= AUTH HEADER ================= */

const authHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

/* ================= MULTIPART HEADER ================= */

const multipartHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "multipart/form-data",
  },
});

/* ================= AUTH ================= */

export const googleAuthApi = (idToken, mode) =>
  API.post("/api/auth/google", { idToken, mode });

export const emailRegisterApi = (email, password) =>
  API.post("/api/auth/register", { email, password });

export const emailLoginApi = (email, password) =>
  API.post("/api/auth/login", { email, password });

export const getMeApi = (token) =>
  API.get("/api/auth/me", authHeader(token));


/* ================= CHAPTERS ================= */

export const createChapterApi = (courseId, data, token) =>
  API.post(
    `/api/chapters/${courseId}`,
    data,
    authHeader(token)
  );

export const reorderChaptersApi = (courseId, chapters, token) =>
  API.patch(
    `/api/chapters/${courseId}/reorder`,
    { chapters },
    authHeader(token)
  );

export const getChaptersByCourseApi = (courseId, token) =>
  API.get(`/api/chapters/${courseId}`, authHeader(token));


/* ================= STUDENT STRUCTURE ================= */

export const getCourseChaptersApi = (courseId, token) =>
  API.get(`/api/chapters/${courseId}/structure`, authHeader(token));


/* ================= CONTENT ================= */

export const getContentsByChapterApi = (chapterId, token) =>
  API.get(`/api/contents/chapter/${chapterId}`, authHeader(token));

export const createContentApi = (chapterId, payload, token) =>
  API.post(
    `/api/contents/${chapterId}`,
    payload,
    multipartHeader(token)
  );

export const reorderContentsApi = (contents, token) =>
  API.patch(
    "/api/contents/reorder",
    { contents },
    authHeader(token)
  );


/* ================= QUIZ ================= */

export const getQuizApi = (chapterId, token) =>
  API.get(`/api/quizzes/${chapterId}`, authHeader(token));

export const createQuizApi = (chapterId, data, token) =>
  API.post(
    `/api/quizzes/${chapterId}`,
    data,
    authHeader(token)
  );

export const addQuestionApi = (quizId, data, token) =>
  API.post(
    `/api/quizzes/${quizId}/question`,
    data,
    authHeader(token)
  );

export const updateQuestionApi = (id, data, token) =>
  API.put(
    `/api/quizzes/question/${id}`,
    data,
    authHeader(token)
  );

export const deleteQuestionApi = (id, token) =>
  API.delete(
    `/api/quizzes/question/${id}`,
    authHeader(token)
  );


/* ================= BOOKMARK ================= */

export const saveBookmarkApi = (data, token) =>
  API.post("/api/bookmarks", data, authHeader(token));

export const getBookmarkApi = (courseId, token) =>
  API.get(`/api/bookmarks/${courseId}`, authHeader(token));

export const clearBookmarkApi = (courseId, token) =>
  API.delete(`/api/bookmarks/${courseId}`, authHeader(token));


/* ================= BUSINESS ================= */

export const createBusinessApi = (data, token) =>
  API.post(
    "/api/business/admin/business",
    data,
    multipartHeader(token)
  );

export const getMyBusinessesApi = (token) =>
  API.get("/api/business/my", authHeader(token));


/* ================= COURSES ================= */

export const createCourseApi = (data, token) =>
  API.post("/api/courses", data, multipartHeader(token));

export const updateCourseApi = (id, data, token) =>
  API.put(`/api/courses/${id}`, data, multipartHeader(token));

export const deleteCourseApi = (productId, token) =>
  API.delete(
    `/api/courses/product/${productId}`,
    authHeader(token)
  );

export const getMyCoursesApi = (token) =>
  API.get("/api/courses/my", authHeader(token));


/* ================= COURSE INFO ================= */

export const getCourseMoreInfoApi = (id, token) =>
  API.get(`/api/courses/${id}/more-info`, authHeader(token));

export const updateCourseSettingsApi = (id, settings, token) =>
  API.patch(
    `/api/courses/${id}/settings`,
    settings,
    authHeader(token)
  );


/* ================= EVENTS ================= */

export const createEventApi = (data, token) =>
  API.post("/api/events", data, multipartHeader(token));

export const updateEventApi = (id, data, token) =>
  API.put(`/api/events/${id}`, data, authHeader(token));

export const deleteEventApi = (id, token) =>
  API.delete(`/api/events/${id}`, authHeader(token));

export const getMyEventsApi = (token) =>
  API.get("/api/events/my", authHeader(token));

export const getPublicEventsApi = () =>
  API.get("/api/events/public");

export const getPublicEventApi = (id) =>
  API.get(`/api/events/public/events/${id}`);

export const getEventByIdApi = (id, token) =>
  API.get(`/api/events/${id}`, authHeader(token));

export const registerEventApi = (id, token) =>
  API.post(
    `/api/events/${id}/register`,
    {},
    authHeader(token)
  );


/* ================= EVENT HOST ================= */

export const getHostsApi = (token) =>
  API.get("/api/auth/hosts", authHeader(token));


/* ================= EVENT REGISTRATION ================= */

export const getMyEventRegistrationsApi = (token) =>
  API.get("/api/events/my-registrations", authHeader(token));

export const checkEventRegistrationApi = (id, token) =>
  API.get(`/api/events/${id}/check`, authHeader(token));


/* ================= EVENT ROOM ================= */

export const getEventRoomMessagesApi = (eventId, token) =>
  API.get(
    `/api/event-rooms/${eventId}/messages`,
    authHeader(token)
  );

export const sendEventRoomMessageApi = (
  eventId,
  message,
  token
) =>
  API.post(
    `/api/event-rooms/${eventId}/messages`,
    { message },
    authHeader(token)
  );


/* ================= EVENT MANAGE ================= */

export const updateEventSettingsApi = (
  eventId,
  data,
  token
) =>
  API.patch(
    `/api/events/${eventId}/settings`,
    data,
    authHeader(token)
  );


/* ================= EVENT QUESTIONS ================= */

export const getEventQuestionsApi = (id, token) =>
  API.get(`/api/events/${id}/questions`, authHeader(token));

export const addEventQuestionApi = (id, data, token) =>
  API.post(`/api/events/${id}/questions`, data, authHeader(token));

export const updateEventQuestionApi = (id, data, token) =>
  API.put(`/api/events/questions/${id}`, data, authHeader(token));

export const deleteEventQuestionApi = (id, token) =>
  API.delete(`/api/events/questions/${id}`, authHeader(token));


/* ================= ATTENDEES ================= */

export const getEventAttendeesApi = (id, token) =>
  API.get(`/api/events/${id}/attendees`, authHeader(token));

export const approveEventRegistrationApi = (id, token) =>
  API.post(
    `/api/events/registrations/${id}/approve`,
    {},
    authHeader(token)
  );


/* ================= PUBLIC ================= */

export const getPublicCoursesApi = () =>
  API.get("/api/public/courses");

export const getPublicCourseApi = (id) =>
  API.get(`/api/public/courses/${id}`);

export const getCourseLandingApi = (id) =>
  API.get(`/api/public/courses/${id}/landing`);

export const getPublicQuizApi = (chapterId) =>
  API.get(`/api/public/quiz/${chapterId}`);


/* ================= ENROLLMENT ================= */

/* ================= PAYMENTS ================= */

export const createPaymentOrderApi = (
  productId,
  productType,
  token
) =>
  API.post(
    "/api/payment/create-order",
    { productId, productType },
    authHeader(token)
  );

export const verifyPaymentApi = (
  orderId,
  paymentId,
  token
) =>
  API.post(
    "/api/payment/verify",
    { orderId, paymentId },
    authHeader(token)
  );

// export const createCourseOrderApi = (courseId, token) =>
//   API.post(
//     "/api/payment/create-order",
//     { courseId },
//     authHeader(token)
//   );

// export const verifyCoursePaymentApi = (
//   orderId,
//   paymentId,
//   token
// ) =>
//   API.post(
//     "/api/payment/verify",
//     { orderId, paymentId },
//     authHeader(token)
//   );

export const getMyEnrollmentsApi = (token) =>
  API.get("/api/enroll/my", authHeader(token));

export const getEnrolledUsersByCourseApi = (courseId, token) =>
  API.get(
    `/api/enroll/course/${courseId}`,
    authHeader(token)
  );


/* ================= ROOM ================= */

export const getRoomMessagesApi = (courseId, token) =>
  API.get(
    `/api/rooms/${courseId}/messages`,
    authHeader(token)
  );

export const sendRoomMessageApi = (courseId, message, token) =>
  API.post(
    `/api/rooms/${courseId}/messages`,
    { message },
    authHeader(token)
  );


/* ================= MAIL ================= */

export const sendCustomMailApi = (payload, token) =>
  API.post(
    "/api/mail/send",
    payload,
    authHeader(token)
  );


/* ================= SESSIONS ================= */

export const createSessionApi = (data, token) =>
  API.post(
    "/api/sessions",
    data,
    multipartHeader(token)
  );

export const updateSessionApi = (id, data, token) =>
  API.patch(
    `/api/sessions/${id}`,
    data,
    multipartHeader(token)
  );

export const deleteSessionApi = (id, token) =>
  API.delete(`/api/sessions/${id}`, authHeader(token));

export const getMySessionsApi = (token) =>
  API.get("/api/sessions/my", authHeader(token));

export const getSessionBookingsApi = (id, token) =>
  API.get(`/api/sessions/${id}/bookings`, authHeader(token));

export const bookSessionApi = (id, token, slot, answers) =>
  API.post(
    `/api/sessions/${id}/book`,
    {
      slot,
      answers,
    },
    authHeader(token)
  );


/* ================= PUBLIC SESSION ================= */

export const getPublicSessionsApi = () =>
  API.get("/api/sessions/public");

export const getPublicSessionApi = (id, token) =>
  API.get(
    `/api/sessions/public/${id}`,
    token ? authHeader(token) : {}
  );


/* =====================================================
   ============== DIGITAL FILE (NEW) ===================
   ===================================================== */

/* CREATE DIGITAL FILE */
export const createDigitalApi = (data, token) =>
  API.post(
    "/api/digital-files",
    data,
    multipartHeader(token)
  );

/* GET MY DIGITAL FILES */
export const getMyDigitalsApi = (token) =>
  API.get(
    "/api/digital-files/my",
    authHeader(token)
  );

/* GET SINGLE DIGITAL FILE */
export const getDigitalApi = (id, token) =>
  API.get(
    `/api/digital-files/${id}`,
    authHeader(token)
  );

/* UPDATE DIGITAL FILE */
export const updateDigitalApi = (id, data, token) =>
  API.put(
    `/api/digital-files/${id}`,
    data,
    multipartHeader(token)
  );

/* DELETE DIGITAL FILE */
export const deleteDigitalApi = (id, token) =>
  API.delete(
    `/api/digital-files/${id}`,
    authHeader(token)
  );

/* ADD DIGITAL CONTENT */
export const addDigitalContentApi = (id, data, token) =>
  API.post(
    `/api/digital-files/${id}/content`,
    data,
    multipartHeader(token)
  );

  /* ✅ UPDATE DIGITAL CONTENT (NEW — REQUIRED FOR EDIT) */
export const updateDigitalContentApi = (
  contentId,
  data,
  token
) =>
  API.put(
    `/api/digital-files/content/${contentId}`,
    data,
    multipartHeader(token)
  );


/* DELETE DIGITAL CONTENT */
export const deleteDigitalContentApi = (contentId, token) =>
  API.delete(
    `/api/digital-files/content/${contentId}`,
    authHeader(token)
  );

/* GET DIGITAL AUDIENCE */
export const getDigitalAudienceApi = (id, token) =>
  API.get(
    `/api/digital-files/${id}/audience`,
    authHeader(token)
  );

/* BUY DIGITAL FILE */
// export const buyDigitalApi = (data, token) =>
//   API.post(
//     "/api/purchase",
//     data,
//     authHeader(token)
//   );

  /* GET DIGITAL CONTENTS */
export const getDigitalContentsApi = (id, token) =>
  API.get(
    `/api/digital-files/${id}/content`,
    authHeader(token)
  );

/* GET SINGLE DIGITAL (FOR ABOUT TAB) */
export const getDigitalByIdApi = (id, token) =>
  API.get(
    `/api/digital-files/${id}`,
    authHeader(token)
  );

  /* ================= PUBLIC DIGITAL ================= */

/* GET ALL DIGITAL FILES */
export const getPublicDigitalsApi = () =>
  API.get("/api/public/digital-files");

/* GET SINGLE DIGITAL FILE */
export const getPublicDigitalByIdApi = (id) =>
  API.get(`/api/public/digital-files/${id}`);

  export const reorderDigitalContentsApi = (
  orders,
  token
) => {
  return API.post(
    "/api/digital-files/content/reorder",
    { orders },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

/* ================= PACKAGES ================= */

export const createPackageApi = (data, token) =>
  API.post("/api/packages", data, multipartHeader(token));

export const updatePackageApi = (id, data, token) =>
  API.put(`/api/packages/${id}`, data, multipartHeader(token));

export const deletePackageApi = (productId, token) =>
  API.delete(
    `/api/packages/product/${productId}`,
    authHeader(token)
  );

export const addCourseToPackageApi = (data, token) =>
  API.post(
    "/api/packages/add-course",
    data,
    authHeader(token)
  );

export const reorderPackageCoursesApi = (courses, token) =>
  API.patch(
    "/api/packages/reorder",
    { courses },
    authHeader(token)
  );

/* ================= PUBLIC PACKAGES ================= */

export const getPublicPackagesApi = () =>
  API.get("/api/public/packages");

export const getPublicPackageApi = (id, token) =>
  API.get(
    `/api/public/packages/${id}`,
    authHeader(token)
  );
/* ================= BUY PACKAGE ================= */

// export const buyPackageApi = (id, token) =>
//   API.post(
//     `/api/purchase/package/${id}`,
//     {},
//     authHeader(token)
//   );

/*==================R#EMOVE EACH COURSE FROM PACKAGE ==================*/
export const removeCourseFromPackageApi = (
  packageId,
  courseId,
  token
) => {
  return API.delete(
    `/api/packages/${packageId}/course/${courseId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};


/* ================= SINGLE PACKAGE ================= */

export const getPackageByIdApi = (id, token) =>
  API.get(`/api/packages/${id}`, authHeader(token));

/* ======================================================
   CREATE MEMBERSHIP
====================================================== */

export const createMembershipApi = (data, token) =>
  API.post("/api/memberships", data, authHeader(token));


/* ======================================================
   UPDATE MEMBERSHIP
====================================================== */

export const updateMembershipApi = (id, data, token) =>
  API.patch(`/api/memberships/${id}`, data, authHeader(token));


/* ======================================================
   DELETE MEMBERSHIP
====================================================== */

export const deleteMembershipApi = (id, token) =>
  API.delete(`/api/memberships/${id}`, authHeader(token));


/* ======================================================
   GET MY MEMBERSHIPS
====================================================== */

export const getMyMembershipsApi = (token) =>
  API.get("/api/memberships/my", authHeader(token));


/* ======================================================
   GET SINGLE MEMBERSHIP (ADMIN)
====================================================== */

export const getMembershipByIdApi = (id, token) =>
  API.get(`/api/memberships/${id}`, authHeader(token));


/* ======================================================
   MEMBERSHIP OPTIONS (FOR PRODUCT TOGGLE)
====================================================== */

export const getMembershipOptionsApi = (token) =>
  API.get("/api/memberships/options", authHeader(token));


/* ======================================================
   QUESTIONS
====================================================== */

export const addMembershipQuestionApi = (id, data, token) =>
  API.post(`/api/memberships/${id}/questions`, data, authHeader(token));


export const updateMembershipQuestionApi = (id, data, token) =>
  API.patch(`/api/memberships/questions/${id}`, data, authHeader(token));


export const deleteMembershipQuestionApi = (id, token) =>
  API.delete(`/api/memberships/questions/${id}`, authHeader(token));


/* ======================================================
   APPROVAL TOGGLE
====================================================== */

export const toggleMembershipApprovalApi = (id, token) =>
  API.patch(`/api/memberships/${id}/approval`, {}, authHeader(token));


/* ======================================================
   MEMBERSHIP PURCHASES (ADMIN VIEW)
====================================================== */

export const getMembershipPurchasesApi = (membershipId, token) =>
  API.get(`/api/memberships/${membershipId}/purchases`, authHeader(token));


/* ======================================================
   APPROVE / REJECT MEMBERSHIP
====================================================== */

export const approveMembershipApi = (purchaseId, token) =>
  API.post(
    `/api/membership-purchase/${purchaseId}/approve`,
    {},
    authHeader(token)
  );


export const rejectMembershipApi = (purchaseId, token) =>
  API.post(
    `/api/membership-purchase/${purchaseId}/reject`,
    {},
    authHeader(token)
  );


/* ======================================================
   PUBLIC MEMBERSHIPS
====================================================== */

export const getPublicMembershipsApi = () =>
  API.get("/api/public/memberships");


export const getPublicMembershipApi = (id, token) =>
  API.get(
    `/api/public/memberships/${id}`,
    token ? authHeader(token) : {}
  );


/* ======================================================
   PURCHASE MEMBERSHIP
====================================================== */

// export const purchaseMembershipApi = (data, token) =>
//   API.post(
//     "/api/membership-purchase",
//     data,
//     authHeader(token)
//   );


/* ======================================================
   MY ACTIVE MEMBERSHIP
====================================================== */

export const getMyActiveMembershipApi = (token) =>
  API.get(
    "/api/membership-purchase/my-active",
    authHeader(token)
  );

  /*========================AI COFOUNDER==================*/
  /* ================= AI COFOUNDER ================= */

export const aiCofounderChatApi = (message, token) =>
  API.post(
    "/api/ai-cofounder/chat",
    { message },
    authHeader(token)
  );

  export const getAICofounderHistoryApi = (token) =>
  API.get("/api/ai-cofounder/history", authHeader(token));

  export const generateLandingPageApi = (data, token) =>
  API.post(
    "/api/ai-cofounder/landing-page",
    data,
    authHeader(token)
  );