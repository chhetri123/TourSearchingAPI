class ApiFeature {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedField = ["page", "sort", "limit", "fields"];
    excludedField.forEach((field) => delete queryObj[field]);

    // Advance level filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|lte|gt|lt)\b/g, (match) => `$${match}`);
    // //
    this.query.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query.sort(sortBy);
    } else {
      this.query.sort("-createdAt");
    }
    return this;
  }
  limitFields() {
    if (this.queryString.fields) {
      const queryFields = this.queryString.fields.split(",").join(" ");
      this.query.select(queryFields);
    } else {
      this.query.select("-__v");
    }
    return this;
  }
  pagination() {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 100;
    const skip = (page - 1) * limit;
    this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = ApiFeature;
