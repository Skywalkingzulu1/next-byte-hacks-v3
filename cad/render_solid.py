import os
from stl import mesh
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D  # noqa
from mpl_toolkits.mplot3d.art3d import Poly3DCollection  # noqa

m = mesh.Mesh.from_file("cad/gliax_stethoscope.stl")
fig = plt.figure(figsize=(7, 9), dpi=120)
ax = fig.add_subplot(111, projection="3d")
# solid faces with simple depth shading
poly = Poly3DCollection(m.vectors, facecolor="#5566cc", edgecolor="none", alpha=1.0)
ax.add_collection3d(poly)
allv = m.vectors.reshape(-1, 3)
ax.auto_scale_xyz(allv[:, 0], allv[:, 1], allv[:, 2])
ax.view_init(elev=15, azim=20)
ax.set_axis_off()
ax.set_facecolor("white")
fig.subplots_adjust(left=0, right=1, top=1, bottom=0)
fig.savefig("cad/gliax_stethoscope_solid.png", dpi=120)
print("solid preview written")
