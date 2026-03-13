// Save bookmark
export const saveBookmark = (courseId, data) => {
  localStorage.setItem(
    `bookmark_${courseId}`,
    JSON.stringify(data)
  );
};

// Get bookmark
export const getBookmark = (courseId) => {
  const data = localStorage.getItem(`bookmark_${courseId}`);
  return data ? JSON.parse(data) : null;
};

// Remove bookmark
export const clearBookmark = (courseId) => {
  localStorage.removeItem(`bookmark_${courseId}`);
};
