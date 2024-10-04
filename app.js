const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");

const BlogPost = require("./models/blogPost");
const Comment = require("./models/comment");

const app = express();
const port = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.set("view engine", "ejs");

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/blogPostCommentsDB", {})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

app.get("/", (req, res) => {
  res.send("Welcome to my BlogPost!");
});

app.get("/blogPosts", async (req, res) => {
  const blogPosts = await BlogPost.find({});
  res.render("blogPost/index", { blogPosts });
});

app.get("/blogPosts/new", (req, res) => {
  res.render("blogPost/new");
});

app.get("/blogPosts/:id", async (req, res) => {
  const { id } = req.params;
  const blogPost = await BlogPost.findById(id).populate("comments");
  console.log(blogPost);
  res.render("blogPost/show", { blogPost });
});

app.post("/blogPosts", async (req, res) => {
  const { title, body } = req.body;
  const blog = new BlogPost({
    title: title,
    body: body,
  });
  await blog.save();
  res.redirect("/blogPosts");
});

app.post("/blogPosts/:id/comments", async (req, res) => {
  const { comment } = req.body;
  const newComment = new Comment({ body: comment });
  await newComment.save();

  const { id } = req.params;
  const blogPost = await BlogPost.findById(id);
  blogPost.comments.push(newComment);
  await blogPost.save();
  res.redirect(`/blogPosts/${blogPost._id}`);
});

app.delete("/blogPosts/:id/comments/:commentId", async (req, res) => {
  const { id, commentId } = req.params;
  console.log(id, commentId);
  await Comment.findByIdAndDelete(commentId);
  await BlogPost.findByIdAndUpdate(id, { $pull: { comments: commentId } });

  res.redirect(`/blogPosts/${id}`);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
