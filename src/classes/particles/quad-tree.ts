export class Rectangle {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  contains(point) {
    return (
      point.x >= this.x - this.w &&
      point.x <= this.x + this.w &&
      point.y >= this.y - this.h &&
      point.y <= this.y + this.h
    );
  }

  intersects(range) {
    return !(
      range.x - range.w > this.x + this.w ||
      range.x + range.w < this.x - this.w ||
      range.y - range.h > this.y + this.h ||
      range.y + range.h < this.y - this.h
    );
  }
}

export class QuadTree {
  constructor(boundary, capacity) {
    this.boundary = boundary; // A Rectangle defining the boundary of this quadtree
    this.capacity = capacity; // Maximum number of points before this tree must subdivide
    this.points = []; // List of points contained within this quadtree
    this.divided = false; // Whether this quadtree has been subdivided
  }

  // Insert a point into the quadtree
  insert(point) {
    // If the point is not within the boundary of this quadtree, return false
    if (!this.boundary.contains(point)) {
      return false;
    }

    // If there is still space in this quadtree, add the point here
    if (this.points.length < this.capacity) {
      this.points.push(point);
      return true;
    } else {
      // Otherwise, subdivide and add the point to one of the sub-quads
      if (!this.divided) {
        this.subdivide();
      }

      // Try to insert the point into each of the subdivided quadrants
      if (this.northeast.insert(point)) return true;
      if (this.northwest.insert(point)) return true;
      if (this.southeast.insert(point)) return true;
      if (this.southwest.insert(point)) return true;
    }
  }

  // Subdivide this quadtree into four smaller quads
  subdivide() {
    const x = this.boundary.x;
    const y = this.boundary.y;
    const w = this.boundary.w / 2;
    const h = this.boundary.h / 2;

    // Create four new QuadTrees for each region (northwest, northeast, southwest, southeast)
    const ne = new Rectangle(x + w, y - h, w, h);
    const nw = new Rectangle(x - w, y - h, w, h);
    const se = new Rectangle(x + w, y + h, w, h);
    const sw = new Rectangle(x - w, y + h, w, h);

    // Initialize the QuadTree for each new sub-region
    this.northeast = new QuadTree(ne, this.capacity);
    this.northwest = new QuadTree(nw, this.capacity);
    this.southeast = new QuadTree(se, this.capacity);
    this.southwest = new QuadTree(sw, this.capacity);

    this.divided = true; // Mark this quadtree as subdivided
  }

  // Query all points within a certain range (another Rectangle)
  query(range, found = []) {
    // If the range does not intersect this boundary, return empty
    if (!this.boundary.intersects(range)) {
      return found;
    }

    // Otherwise, check for points within this quadtree that are within the range
    for (const p of this.points) {
      if (range.contains(p)) {
        found.push(p);
      }
    }

    // If this quadtree is subdivided, check its sub-quadrants as well
    if (this.divided) {
      this.northwest.query(range, found);
      this.northeast.query(range, found);
      this.southwest.query(range, found);
      this.southeast.query(range, found);
    }

    return found; // Return the list of points found within the range
  }

  // Optional: Draw the quadtree boundaries (useful for visualization)
  draw(ctx) {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.strokeRect(
      this.boundary.x - this.boundary.w,
      this.boundary.y - this.boundary.h,
      this.boundary.w * 2,
      this.boundary.h * 2,
    );

    if (this.divided) {
      this.northwest.draw(ctx);
      this.northeast.draw(ctx);
      this.southwest.draw(ctx);
      this.southeast.draw(ctx);
    }
  }
}
