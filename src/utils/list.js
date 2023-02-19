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

export function mostBlogs(blogs) {
  if (!blogs.length) {
    return null;
  }

  const authorCount = blogs.reduce((tally, blog) => {
    tally[blog.author] = (tally[blog.author] || 0) + 1;
    return tally;
  }, {});

  const topAuthor = Object.keys(authorCount).reduce(
    (prevAuthor, currentAuthor) => {
      return authorCount[prevAuthor] > authorCount[currentAuthor]
        ? prevAuthor
        : currentAuthor;
    }
  );

  return {
    author: topAuthor,
    blogs: authorCount[topAuthor],
  };
}
