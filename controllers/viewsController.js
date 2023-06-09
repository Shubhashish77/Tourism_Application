const Tour = require("./../models/tourModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require('../utils/appError');
const User = require("../models/userModel");

exports.getOverview = catchAsync(async (req, res) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  // 2) Build template
  // 3) Render that template using tour data from 1)

  res.status(200).render("overview", {
    title: "All tour",
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "reviews rating user",
  });
  if(!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }
  res.status(200).render("tour", {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = catchAsync(async (req, res) => {
  res.status(200).render("login", {
    title: "Log into your account",
  });
});

exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "Your Account",
  });
}

exports.updateUserData = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const updatedUser = await User.findByIdAndUpdate(req.user.id, {
    name: req.body.name,
    email: req.body.email
  },
  {
    new: true,
    runValidators: true 
  }); 
  res.status(200).render("account", {
    title: "Your Account",
    user: updatedUser
  });
});
