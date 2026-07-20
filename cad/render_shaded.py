import os, numpy as np
from stl import mesh
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D  # noqa
from mpl_toolkits.mplot3d.art3d import Poly3DCollection  # noqa

m = mesh.Mesh.from_file("cad/gliax_stethoscope.stl")
fig = plt.figure(figsize=(7, 9), dpi=130)
ax = fig.add_subplot(111, projection="3d")
ax.set_facecolor("white")

# build collection with normal-based shading
from matplotlib.colors import LightSource
ls = LightSource(azdeg=225, altdeg=45)
polys = []
facecolors = []
for v in m.vectors:
    polys.append(v)
    # normal
    n = np.cross(v[1] - v[0], v[2] - v[0])
    n = n / (np.linalg.norm(n) + 1e-8)
    # shade 0..1
    intensity = abs(np.dot(n, np.array([0.3, 0.4, 0.85])))  # light dir
    base = np.array([0.35, 0.45, 0.85])  # blue
    shade = 0.35 + 0.65 * intensity
    facecolors.append(base * shade)
pc = Poly3DCollection(polys, facecolor=facecolors, edgecolor="none", linewidth=0)
ax.add_collection3d(pc)
allv = m.vectors.reshape(-1, 3)
ax.auto_scale_xyz(allv[:, 0], allv[:, 1], allv[:, 2])
ax.view_init(elev=12, azim=25)
ax.set_axis_off()
fig.subplots_adjust(left=0, right=1, top=1, bottom=0)
fig.savefig("cad/gliax_stethoscope_shaded.png", dpi=130)
print("shaded preview written")
