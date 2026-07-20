import numpy as np
from stl import mesh
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D  # noqa
from mpl_toolkits.mplot3d.art3d import Poly3DCollection  # noqa

m = mesh.Mesh.from_file("cad/gliax_stethoscope.stl")
fig = plt.figure(figsize=(8, 8), dpi=110)
ax = fig.add_subplot(111, projection="3d")
ax.add_collection3d(Poly3DCollection(m.vectors, facecolor="#6f7bd6", edgecolor="none", alpha=0.9))
allv = m.vectors.reshape(-1, 3)
ax.auto_scale_xyz(allv[:, 0], allv[:, 1], allv[:, 2])
ax.view_init(elev=22, azim=35)
ax.set_axis_off()
fig.savefig("cad/gliax_stethoscope_preview.png", bbox_inches="tight", transparent=True)
print("preview written")
