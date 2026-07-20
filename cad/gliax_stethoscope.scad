// Gliax Stethoscope — parametric OpenSCAD model (v3, bold & unmistakable)
// Goal: read clearly as a stethoscope, not a ring-stand.
//  - FAT chestpiece (bell + diaphragm rim) at the bottom (wide disc)
//  - THICK flexible acoustic tubing rising and curving into the binaural
//  - clearly splayed binaural tubes joined by a sprung top arc
//  - conical EAR TIPS at the very top
// Dimensions in mm.

// ---------- Parameters ----------
chest_d     = 60;   // chestpiece diameter (FAT)
chest_h     = 16;   // chestpiece height
bell_d      = 40;   // bell inner diameter
tube_r      = 7;    // acoustic tube radius (THICK)
yoke_span   = 120;  // ear-tube spacing
ear_l       = 30;   // ear tip length
ear_d       = 14;   // ear tip base diameter
arc_r       = tube_r;

// ---------- Chestpiece (bell + diaphragm) ----------
module chestpiece() {
  union() {
    // main body
    cylinder(d = chest_d, h = chest_h, $fn = 96);
    // diaphragm rim (slightly larger lip on top)
    translate([0, 0, chest_h]) cylinder(d = chest_d + 5, h = 4, $fn = 96);
    // bell hollow (visual indent on top face)
    translate([0, 0, chest_h + 0.5]) cylinder(d = bell_d, h = 6, $fn = 96);
    // short thick neck down to the tube
    translate([0, 0, -10]) cylinder(d = 18, h = 14, $fn = 48);
  }
}

// ---------- One binaural side: tube up + ear tip ----------
module side(sign) {
  translate([sign * yoke_span/2, 0, 0])
    cylinder(d = tube_r * 2, h = 170, $fn = 36);
  // ear tip (conical, clearly an earpiece)
  translate([sign * yoke_span/2, 0, 170])
    cylinder(d1 = ear_d + 6, d2 = ear_d - 2, h = ear_l, $fn = 44);
}

// ---------- Binaural arc (spring) at top ----------
module arc() {
  translate([0, 0, 170])
    rotate([90, 0, 0])
      difference() {
        cylinder(d = yoke_span + arc_r * 2, h = arc_r * 2, $fn = 80, center = true);
        cylinder(d = yoke_span - arc_r * 2, h = arc_r * 2 + 2, $fn = 80, center = true);
      }
}

// ---------- Acoustic tubing: chestpiece neck -> up -> to arc center ----------
module tubing() {
  translate([0, 0, -2]) cylinder(d = tube_r * 2, h = 174, $fn = 36);
}

// ---------- Assemble (clear Y: wide base, tube up, splayed ears + tips) ----------
chestpiece();   // wide disc at bottom
tubing();       // thick center riser
side(-1); side(1);
arc();
