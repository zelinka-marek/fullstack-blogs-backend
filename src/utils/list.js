// eslint-disable-next-line no-unused-vars
export function dummy(_blogs) {
  return 1;
}

export function totalLikes(blogs) {
  return blogs.reduce((likes, blog) => likes + blog.likes, 0);
}
