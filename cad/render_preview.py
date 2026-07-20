import os
from stl import mesh
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D  # noqa
from mpl_toolkits.mplot3d.art3d import Poly3DCollection  # noqa

m = mesh.Mesh.from_file("cad/gliax_stethoscope.stl")
views = [("front", 20, 0), ("side", 20, 90), ("iso", 25, 35), ("top", 90, 0)]
fig = plt.figure(figsize=(16, 4), dpi=110)
for i, (name, elev, azim) in enumerate(views, 1):
    ax = fig.add_subplot(1, 4, i, projection="3d")
    ax.add_collection3d(Poly3DCollection(m.vectors, facecolor="#6f7bd6", edgecolor="none", alpha=0.92))
    allv = m.vectors.reshape(-1, 3)
    ax.auto_scale_xyz(allv[:, 0], allv[:, 1], allv[:, 2])
    ax.view_init(elev=elev, azim=azim)
    ax.set_axis_off()
    ax.set_title(name, color="gray")
fig.savefig("cad/gliax_stethoscope_preview.png", bbox_inches="tight", transparent=True)
print("multi-angle preview written")
