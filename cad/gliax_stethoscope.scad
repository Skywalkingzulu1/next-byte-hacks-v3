// Gliax Stethoscope — parametric OpenSCAD model
// A 3D-printable demonstration stethoscope: chestpiece (bell + diaphragm),
// flexible acoustic tubing, binaural yoke (arc), and two earpieces.
// All dimensions in millimetres. Tune the parameters below to "modify the file".

// ---------- Parameters ----------
chest_d        = 48;   // chestpiece outer diameter
chest_h        = 14;   // chestpiece height
bell_d         = 30;   // bell (inner) diameter
tube_r         = 4.5;  // tubing radius
tube_len       = 420;  // approximate tubing length (arc)
yoke_w         = 6;    // binaural tube (metal arc) diameter
yoke_span      = 150;  // distance between ear tubes
ear_d          = 11;   // earpiece tip diameter
ear_l          = 22;   // earpiece length
wall           = 2.0;  // wall thickness for hollow parts

// ---------- Chestpiece (bell + diaphragm rim) ----------
module chestpiece() {
  difference() {
    union() {
      // base disc
      cylinder(d = chest_d, h = chest_h, $fn = 80);
      // rim
      cylinder(d = chest_d + 3, h = 3, $fn = 80);
      // short stem to tubing
      translate([0, 0, -6]) cylinder(d = 10, h = 10, $fn = 40);
    }
    // hollow the bell
    translate([0, 0, wall]) cylinder(d = bell_d, h = chest_h, $fn = 80);
    // sound channel
    translate([0, 0, -16]) cylinder(d = 4, h = 20, $fn = 24);
  }
}

// ---------- Earpiece ----------
module earpiece() {
  union() {
    // conical soft tip
    cylinder(d1 = ear_d + 4, d2 = ear_d, h = ear_l, $fn = 36);
    // stem
    translate([0, 0, ear_l]) cylinder(d = 5, h = 14, $fn = 24);
  }
}

// ---------- Binaural yoke (spring arc) ----------
module yoke() {
  // two vertical ear tubes joined by a U / arc at top
  for (s = [-1, 1]) {
    translate([s * yoke_span/2, 0, 0])
      cylinder(d = yoke_w, h = 90, $fn = 24);
  }
  // top arc
  translate([0, 0, 90])
    rotate([90, 0, 0])
      difference() {
        cylinder(d = yoke_span + yoke_w, h = yoke_w, $fn = 64, center = true);
        cylinder(d = yoke_span - yoke_w, h = yoke_w + 2, $fn = 64, center = true);
      };
}

// ---------- Tubing (helix-ish acoustic path) ----------
module tubing() {
  // a swept tube from chestpiece up to the yoke split
  path = [
    [0, 0, -10],
    [40, 10, 40],
    [10, 60, 120],
    [-yoke_span/2 + 10, 20, 175],
    [-yoke_span/2, 0, 135]
  ];
  for (i = [0 : len(path) - 2]) {
    p1 = path[i]; p2 = path[i + 1];
    d = p2 - p1;
    len = norm(d);
    ang = atan2(d[1], d[0]);
    pitch = atan2(d[2], sqrt(d[0]*d[0] + d[1]*d[1]));
    translate(p1)
      rotate([0, 0, ang])
        rotate([0, pitch, 0])
          cylinder(d = tube_r * 2, h = len, $fn = 24);
  }
}

// ---------- Assemble ----------
chestpiece();
translate([0, 0, -10]) tubing();
yoke();
// earpieces on top of yoke tubes
translate([-yoke_span/2, 0, 90 + 90]) earpiece();
translate([ yoke_span/2, 0, 90 + 90]) mirror([1,0,0]) earpiece();
