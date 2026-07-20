// Gliax Stethoscope — parametric OpenSCAD model (v2, clearer anatomy)
// Clear "Y" layout: chestpiece at bottom, tubing rises and splits into
// two binaural tubes joined by a sprung arc at the top, ear tips on top.
// Dimensions in millimetres.

// ---------- Parameters ----------
chest_d   = 46;   // chestpiece diameter
chest_h   = 13;   // chestpiece height
tube_r    = 5;    // acoustic tube radius
tube_span = 130;  // horizontal span of the binaural arc
ear_l     = 26;   // ear tip length
ear_d     = 12;   // ear tip diameter
rim_h     = 3;    // chestpiece rim

// ---------- Chestpiece (bell + diaphragm) ----------
module chestpiece() {
  union() {
    cylinder(d = chest_d, h = chest_h, $fn = 96);
    // diaphragm rim on top
    translate([0, 0, chest_h]) cylinder(d = chest_d + 4, h = rim_h, $fn = 96);
    // short neck down to the tube
    translate([0, 0, -8]) cylinder(d = 12, h = 10, $fn = 40);
  }
}

// ---------- One binaural side: tube up + ear tip ----------
module side(sign) {
  // vertical tube from the arc down to the chestpiece neck
  translate([sign * tube_span/2, 0, 0])
    cylinder(d = tube_r * 2, h = 150, $fn = 32);
  // ear tip on top
  translate([sign * tube_span/2, 0, 150])
    cylinder(d1 = ear_d + 5, d2 = ear_d, h = ear_l, $fn = 40);
}

// ---------- Binaural arc (spring) joining the two tubes at top ----------
module arc() {
  translate([0, 0, 150])
    rotate([90, 0, 0])
      difference() {
        cylinder(d = tube_span + tube_r * 2, h = tube_r * 2, $fn = 80, center = true);
        cylinder(d = tube_span - tube_r * 2, h = tube_r * 2 + 2, $fn = 80, center = true);
      }
}

// ---------- Acoustic tubing (one continuous tube: chestpiece -> up -> split) ----------
module tubing() {
  // center tube from chestpiece neck up to the arc center
  translate([0, 0, -2]) cylinder(d = tube_r * 2, h = 152, $fn = 32);
}

// ---------- Assemble ----------
chestpiece();          // at z=0 (bottom)
tubing();              // center riser
side(-1); side(1);    // two binaural tubes + ear tips
arc();                 // top spring arc
