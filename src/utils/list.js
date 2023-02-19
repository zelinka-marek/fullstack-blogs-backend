// eslint-disable-next-line no-unused-vars
export function dummy(_blogs) {
  return 1;
}

export function totalLikes(blogs) {
  return blogs.reduce((likes, blog) => likes + blog.likes, 0);
}

export function favoriteBlog(blogs) {
  if (!blogs.length) {
    return null;
  }

  const maxLikes = Math.max(...blogs.map((blog) => blog.likes));
  const favoriteBlog = blogs.find((blog) => blog.likes === maxLikes);

  return {
    title: favoriteBlog.title,
    author: favoriteBlog.author,
    likes: maxLikes,
  };
}
