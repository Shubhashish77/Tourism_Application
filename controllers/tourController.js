const multer = require("multer");
const sharp = require("sharp");
const Tour = require("../models/tourModel");
const catchAsync = require("./../utils/catchAsync");
const APIFeatures = require("./../utils/apiFeatures");
const AppError = require("../utils/appError");
const factory = require("./handelerFactory");


const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), flase);
  }
}

//const upload = multer({ dest: "public/img/users" });

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([
  {name: "imageCover", maxCount: 1},
  {name: "images", maxCount: 3}
]);

// upload.array('images', 5)

exports.resizeTourImages = async (req, res,next) => {
  if(!req.files.imageCover || !req.files.images) 
    return next();

  // 1) Cover Image  
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);
  
  // 2) Images
  req.body.images = [];

  await Promise.all(req.files.images.map( async (file, i) => {
    const filename = `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;
    await sharp(file.buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${filename}`);
    
      req.body.images.push(filename)
  }));


  next();
}

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkId = (req, res, next, _val) => {
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'invalid ID',
//     });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'failed',
//       message: 'Missing name or price',
//     });
//   }
//   next();
// };

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingAverage,price";
  req.query.fields = "name,price,ratingAverage,summary,difficulty";
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  //const tours = await Tour.find();
  console.log(req.query);

  //BUILD QUERY

  // 1A) Filtering
  // const queryObj = { ...req.query };
  // const excludedFields = ["page", "sort", "limit", "fields"];
  // excludedFields.forEach((el) => delete queryObj[el]);

  // console.log(req.query, queryObj);

  // 1B) Advance filtering

  // let queryStr = JSON.stringify(queryObj);
  // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  //console.log(JSON.parse(queryStr));

  //let query = Tour.find(JSON.parse(queryStr));

  // 2) Sorting
  // if (req.query.sort) {
  //   const sortBy = req.query.sort.split(",").join(" ");
  //console.log(sortBy);
  //query = query.sort(req.query.sort);
  //   query = query.sort(sortBy);
  // } else {
  //   query = query.sort("-createdAt");
  // }

  // 3) Field limiting
  // if (req.query.fields) {
  //   const fields = req.query.fields.split(",").join(" ");
  //   query = query.select(fields);
  // } else {
  //   query = query.select("-__v");
  // }

  // Pagination

  // const page = req.query.page * 1 || 1;
  // const limit = req.query.limit * 1 || 100;
  // const skip = (page - 1) * limit;
  //page=3&Limit=10, 1-10, page 1, 11-20, page 2, 21-30 page 3
  // query = query.skip(skip).limit(limit);

  // if (req.query.page) {
  //   const numTours = await Tour.countDocuments();
  //   if (skip >= numTours) throw new Error("This page does not exist");
  // }

  // EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query;

  //const tours = await Tour.find();
  //   .where('duration')
  //   .equals(5)
  //   .where('difficulty')
  //   .equals('easy');

  //SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours,
    },
  });
});

// exports.getTour = catchAsync(async (req, res, next) => {
//   //console.log(req.params);
//   //const id = req.params.id * 1;
//   // const tour = tours.find((el) => el.id === id);

//   const tour = await Tour.findById(req.params.id).populate("reviews");

//   if (!tour) {
//     return next(new AppError("No tour found with that ID", 404));
//   }

//   console.log(req.params.id);
//   res.status(200).json({
//     status: "success",
//     data: {
//       tour,
//     },
//   });
// });

exports.getTour = factory.getOne(Tour, { path: "reviews" });

// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);

//   res.status(201).json({
//     status: "success",
//     data: {
//       tours: newTour,
//     },
//   });

// try {
// const newTour = new Tour({//#DATA})
// newTour.save()

// const newTour = await Tour.create(req.body);

// res.status(201).json({
//   status: "success",
//   data: {
//     tours: newTour,
//   },
// });
// } catch (err) {
//   res.status(400).json({
//     status: "fail",
//     message: err,
//   });
// }
// });

exports.createTour = factory.createOne(Tour);

// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   if (!tour) {
//     return next(new AppError("No tour found with that ID", 404));
//   }

//   res.status(200).json({
//     status: "success",
//     data: {
//       tour,
//     },
//   });
// });

exports.updateTour = factory.updateOne(Tour);

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   await Tour.findByIdAndDelete(req.params.id);
//   res.status(204).json({
//     status: "success",
//     data: {
//       tour: null,
//     },
//   });
// });

exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: "EASY" } },
    // },
  ]);
  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  //console.log(year);
  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numToursStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    // {
    //   $limit: 12,
    // },
  ]);
  res.status(200).send({
    status: "success",
    data: {
      plan,
    },
  });
});
