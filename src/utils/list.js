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

  const favorite = blogs.reduce((prevBlog, currentBlog) => {
    return prevBlog.likes > currentBlog.likes ? prevBlog : currentBlog;
  });

  return {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes,
  };
}

  return {
    title: favoriteBlog.title,
    author: favoriteBlog.author,
    likes: maxLikes,
  };
}
