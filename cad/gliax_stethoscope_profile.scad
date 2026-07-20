// Gliax Stethoscope — 2D side-profile projection for DXF export (laser/plot/documentation)
// This is a flattened silhouette of the assembled stethoscope.

chest_d        = 48;
chest_h        = 14;
yoke_span      = 150;
yoke_w         = 6;
tube_r         = 4.5;

// 2D side profile (XZ plane silhouette)
module profile() {
  // chestpiece
  square([chest_d, chest_h], center = true);
  // stem down
  translate([0, -chest_h/2 - 5]) square([10, 10], center = true);
  // tubing as a polyline (approx) — drawn as thin rectangles
  pts = [
    [0, -chest_h/2 - 10],
    [40, 30],
    [10, 110],
    [-yoke_span/2 + 10, 165],
    [-yoke_span/2, 125]
  ];
  for (i = [0 : len(pts) - 2]) {
    p1 = pts[i]; p2 = pts[i + 1];
    d = p2 - p1; len = norm(d); ang = atan2(d[1], d[0]);
    translate(p1) rotate([0, 0, -ang]) square([len, tube_r * 2], center = true);
  }
  // binaural arc
  translate([0, 215]) circle(r = yoke_span/2 + yoke_w/2, $fn = 80);
  // ear tubes
  translate([-yoke_span/2, 125]) square([yoke_w, 90], center = true);
  translate([ yoke_span/2, 125]) square([yoke_w, 90], center = true);
  // ear tips
  translate([-yoke_span/2, 125 + 90]) circle(d = 11, $fn = 24);
  translate([ yoke_span/2, 125 + 90]) circle(d = 11, $fn = 24);
}

profile();
